/**
 * Embedder Module (Read-Only / MCP)
 *
 * For MCP, we only need to compute query embeddings, not batch embed.
 * Supports both transformers.js and Ollama backends.
 *
 * Configure via env vars:
 *   RSIS_EMBED_DEVICE=ollama
 *   RSIS_OLLAMA_MODEL=mxbai-embed-large:latest
 *   RSIS_OLLAMA_URL=http://localhost:11434
 */

import { pipeline, env, type FeatureExtractionPipeline } from '@huggingface/transformers';
import {
  initOllamaEmbedder, isOllamaReady, ollamaEmbedText,
  disposeOllamaEmbedder, getOllamaDimensions, configureOllama,
} from '../../core/embeddings/ollama-embedder.js';

// Model config (transformers.js defaults)
const MODEL_ID = 'Snowflake/snowflake-arctic-embed-xs';
const DEFAULT_DIMS = 384;

// Module-level state
let embedderInstance: FeatureExtractionPipeline | null = null;
let isInitializing = false;
let initPromise: Promise<any> | null = null;
let activeDevice: 'ollama' | 'dml' | 'cuda' | 'cpu' | null = null;
let activeDims: number = DEFAULT_DIMS;

/**
 * Initialize the embedding model (lazy, on first search)
 */
export const initEmbedder = async (): Promise<void> => {
  if (embedderInstance || isOllamaReady()) return;
  if (isInitializing && initPromise) { await initPromise; return; }

  isInitializing = true;

  const device = process.env.RSIS_EMBED_DEVICE;

  // ─── Ollama path ──────────────────────────────────────────────────
  if (device === 'ollama') {
    initPromise = (async () => {
      try {
        const model = process.env.RSIS_OLLAMA_MODEL || 'mxbai-embed-large:latest';
        const baseUrl = process.env.RSIS_OLLAMA_URL || 'http://localhost:11434';
        configureOllama({ model, baseUrl });
        console.error(`GitNexus: Connecting to Ollama (${model})...`);
        await initOllamaEmbedder(model, baseUrl);
        activeDevice = 'ollama';
        activeDims = getOllamaDimensions();
        console.error(`GitNexus: Ollama embedder ready (${activeDims} dims)`);
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
  initPromise = (async () => {
    try {
      env.allowLocalModels = false;
      console.error('GitNexus: Loading embedding model (first search may take a moment)...');

      const isWindows = process.platform === 'win32';
      const gpuDevice = isWindows ? 'dml' : 'cuda';
      const devicesToTry: Array<'dml' | 'cuda' | 'cpu'> = [gpuDevice, 'cpu'];

      for (const dev of devicesToTry) {
        try {
          // Silence stdout during model load — protects MCP stdio protocol
          const origWrite = process.stdout.write;
          process.stdout.write = (() => true) as any;
          try {
            embedderInstance = await (pipeline as any)(
              'feature-extraction', MODEL_ID,
              { device: dev, dtype: 'fp32' }
            );
          } finally {
            process.stdout.write = origWrite;
          }
          activeDevice = dev;
          activeDims = DEFAULT_DIMS;
          console.error(`GitNexus: Embedding model loaded (${dev})`);
          return;
        } catch {
          if (dev === 'cpu') throw new Error('Failed to load embedding model');
        }
      }
      throw new Error('No suitable device found');
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
 * Check if embedder is ready
 */
export const isEmbedderReady = (): boolean => embedderInstance !== null || isOllamaReady();

/**
 * Embed a query text for semantic search
 */
export const embedQuery = async (query: string): Promise<number[]> => {
  await initEmbedder();

  if (activeDevice === 'ollama') {
    const vec = await ollamaEmbedText(query);
    return Array.from(vec);
  }

  if (!embedderInstance) {
    throw new Error('Embedder not initialized');
  }

  const result = await embedderInstance(query, {
    pooling: 'mean',
    normalize: true,
  });

  return Array.from(result.data as ArrayLike<number>);
};

/**
 * Get embedding dimensions
 */
export const getEmbeddingDims = (): number => activeDims;

/**
 * Cleanup embedder
 */
export const disposeEmbedder = async (): Promise<void> => {
  if (activeDevice === 'ollama') {
    await disposeOllamaEmbedder();
  } else if (embedderInstance) {
    try {
      if ('dispose' in embedderInstance && typeof embedderInstance.dispose === 'function') {
        await embedderInstance.dispose();
      }
    } catch {}
  }
  embedderInstance = null;
  initPromise = null;
  activeDevice = null;
};
