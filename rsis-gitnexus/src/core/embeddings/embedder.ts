/**
 * Embedder Module
 *
 * Singleton factory for transformers.js embedding pipeline.
 * Handles model loading, caching, and both single and batch embedding operations.
 *
 * Uses snowflake-arctic-embed-xs by default (22M params, 384 dims, ~90MB)
 */

// Suppress ONNX Runtime native warnings (e.g. VerifyEachNodeIsAssignedToAnEp)
// Must be set BEFORE onnxruntime-node is imported by transformers.js
// Level 3 = Error only (skips Warning/Info)
if (!process.env.ORT_LOG_LEVEL) {
  process.env.ORT_LOG_LEVEL = '3';
}

import { pipeline, env, type FeatureExtractionPipeline } from '@huggingface/transformers';
import { DEFAULT_EMBEDDING_CONFIG, type EmbeddingConfig, type ModelProgress } from './types.js';
import {
  initOllamaEmbedder, isOllamaReady, ollamaEmbedText, ollamaEmbedBatch,
  disposeOllamaEmbedder, getOllamaDimensions, configureOllama,
} from './ollama-embedder.js';

// Module-level state for singleton pattern
let embedderInstance: FeatureExtractionPipeline | null = null;
let isInitializing = false;
let initPromise: Promise<any> | null = null;
let currentDevice: 'dml' | 'cuda' | 'cpu' | 'wasm' | 'ollama' | null = null;
let activeDimensions: number = DEFAULT_EMBEDDING_CONFIG.dimensions;

/**
 * Progress callback type for model loading
 */
export type ModelProgressCallback = (progress: ModelProgress) => void;

/**
 * Get the current device being used for inference
 */
export const getCurrentDevice = (): 'dml' | 'cuda' | 'cpu' | 'wasm' | 'ollama' | null => currentDevice;

/**
 * Get the active embedding dimensions (may differ from default when using Ollama)
 */
export const getActiveDimensions = (): number => activeDimensions;

/**
 * Initialize the embedding model
 * Uses singleton pattern - only loads once, subsequent calls return cached instance
 *
 * When device='ollama', uses local Ollama server instead of transformers.js.
 * Set RSIS_EMBED_DEVICE=ollama or pass config.device='ollama' to enable.
 *
 * @param onProgress - Optional callback for model download progress
 * @param config - Optional configuration override
 * @param forceDevice - Force a specific device
 */
export const initEmbedder = async (
  onProgress?: ModelProgressCallback,
  config: Partial<EmbeddingConfig> = {},
  forceDevice?: EmbeddingConfig['device']
): Promise<void> => {
  // Return if already initialized
  if (embedderInstance || isOllamaReady()) {
    return;
  }

  // If already initializing, wait for that promise
  if (isInitializing && initPromise) {
    await initPromise;
    return;
  }

  isInitializing = true;

  const finalConfig = { ...DEFAULT_EMBEDDING_CONFIG, ...config };
  // Environment variable override: RSIS_EMBED_DEVICE=ollama
  const envDevice = process.env.RSIS_EMBED_DEVICE as EmbeddingConfig['device'] | undefined;
  const envModel = process.env.RSIS_OLLAMA_MODEL;
  const envUrl = process.env.RSIS_OLLAMA_URL;

  let requestedDevice = forceDevice || envDevice || finalConfig.device;

  // ─── Ollama path ──────────────────────────────────────────────────
  if (requestedDevice === 'ollama') {
    initPromise = (async () => {
      try {
        const model = envModel || finalConfig.ollamaModel || 'mxbai-embed-large:latest';
        const baseUrl = envUrl || finalConfig.ollamaBaseUrl || 'http://localhost:11434';

        configureOllama({ model, baseUrl, dimensions: finalConfig.dimensions });
        console.log(`🧠 Connecting to Ollama (${model}) at ${baseUrl}...`);

        await initOllamaEmbedder(model, baseUrl);

        currentDevice = 'ollama';
        activeDimensions = getOllamaDimensions();
        console.log(`✅ Ollama embedder ready (${activeDimensions} dims)`);
        return true as const;
      } catch (error) {
        isInitializing = false;
        initPromise = null;
        throw error;
      } finally {
        isInitializing = false;
      }
    })();
    await initPromise;
    return;
  }

  // ─── transformers.js path ─────────────────────────────────────────
  const isWindows = process.platform === 'win32';
  const gpuDevice = isWindows ? 'dml' : 'cuda';
  if (requestedDevice === 'auto') requestedDevice = gpuDevice;

  initPromise = (async () => {
    try {
      env.allowLocalModels = false;

      const isDev = process.env.NODE_ENV === 'development';
      if (isDev) {
        console.log(`🧠 Loading embedding model: ${finalConfig.modelId}`);
      }

      const progressCallback = onProgress ? (data: any) => {
        const progress: ModelProgress = {
          status: data.status || 'progress',
          file: data.file,
          progress: data.progress,
          loaded: data.loaded,
          total: data.total,
        };
        onProgress(progress);
      } : undefined;

      const devicesToTry: Array<'dml' | 'cuda' | 'cpu' | 'wasm'> =
        (requestedDevice === 'dml' || requestedDevice === 'cuda')
          ? [requestedDevice, 'cpu']
          : [requestedDevice as 'cpu' | 'wasm'];

      for (const device of devicesToTry) {
        try {
          if (isDev) {
            const labels: Record<string, string> = {
              dml: '🔧 Trying DirectML (DirectX12) GPU backend...',
              cuda: '🔧 Trying CUDA GPU backend...',
              cpu: '🔧 Using CPU backend...',
              wasm: '🔧 Using WASM backend (slower)...',
            };
            console.log(labels[device] || `🔧 Trying ${device}...`);
          }

          embedderInstance = await (pipeline as any)(
            'feature-extraction',
            finalConfig.modelId,
            {
              device: device,
              dtype: 'fp32',
              progress_callback: progressCallback,
            }
          );
          currentDevice = device;
          activeDimensions = finalConfig.dimensions;

          if (isDev) {
            const label = device === 'dml' ? 'GPU (DirectML/DirectX12)'
                        : device === 'cuda' ? 'GPU (CUDA)'
                        : device.toUpperCase();
            console.log(`✅ Using ${label} backend`);
          }

          return embedderInstance!;
        } catch (deviceError) {
          if (isDev && (device === 'cuda' || device === 'dml')) {
            const gpuType = device === 'dml' ? 'DirectML' : 'CUDA';
            console.log(`⚠️  ${gpuType} not available, falling back to CPU...`);
          }
          if (device === devicesToTry[devicesToTry.length - 1]) {
            throw deviceError;
          }
        }
      }

      throw new Error('No suitable device found for embedding model');
    } catch (error) {
      isInitializing = false;
      initPromise = null;
      embedderInstance = null;
      throw error;
    } finally {
      isInitializing = false;
    }
  })();

  await initPromise;
};

/**
 * Check if the embedder is initialized and ready
 */
export const isEmbedderReady = (): boolean => {
  return embedderInstance !== null || isOllamaReady();
};

/**
 * Embed a single text string
 *
 * @param text - Text to embed
 * @returns Float32Array of embedding vector
 */
export const embedText = async (text: string): Promise<Float32Array> => {
  if (currentDevice === 'ollama') {
    return ollamaEmbedText(text);
  }

  if (!embedderInstance) {
    throw new Error('Embedder not initialized. Call initEmbedder() first.');
  }

  const result = await embedderInstance(text, {
    pooling: 'mean',
    normalize: true,
  });

  return new Float32Array(result.data as ArrayLike<number>);
};

/**
 * Embed multiple texts in a single batch
 *
 * @param texts - Array of texts to embed
 * @returns Array of Float32Array embedding vectors
 */
export const embedBatch = async (texts: string[]): Promise<Float32Array[]> => {
  if (texts.length === 0) return [];

  if (currentDevice === 'ollama') {
    return ollamaEmbedBatch(texts);
  }

  if (!embedderInstance) {
    throw new Error('Embedder not initialized. Call initEmbedder() first.');
  }

  const result = await embedderInstance(texts, {
    pooling: 'mean',
    normalize: true,
  });

  const data = result.data as ArrayLike<number>;
  const dimensions = activeDimensions;
  const embeddings: Float32Array[] = [];

  for (let i = 0; i < texts.length; i++) {
    const start = i * dimensions;
    const end = start + dimensions;
    embeddings.push(new Float32Array(Array.prototype.slice.call(data, start, end)));
  }

  return embeddings;
};

/**
 * Convert Float32Array to regular number array (for KuzuDB storage)
 */
export const embeddingToArray = (embedding: Float32Array): number[] => {
  return Array.from(embedding);
};

/**
 * Cleanup the embedder (free memory)
 */
export const disposeEmbedder = async (): Promise<void> => {
  if (currentDevice === 'ollama') {
    await disposeOllamaEmbedder();
  } else if (embedderInstance) {
    try {
      if ('dispose' in embedderInstance && typeof embedderInstance.dispose === 'function') {
        await embedderInstance.dispose();
      }
    } catch {
      // Ignore disposal errors
    }
  }
  embedderInstance = null;
  initPromise = null;
  currentDevice = null;
};

