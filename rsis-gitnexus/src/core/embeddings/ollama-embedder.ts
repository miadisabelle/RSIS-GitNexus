/**
 * Ollama Embedding Client
 *
 * HTTP client for generating embeddings via local Ollama server.
 * Supports single and batch embedding using POST /api/embed.
 *
 * Default model: mxbai-embed-large (1024 dimensions)
 */

import { OLLAMA_EMBEDDING_CONFIG } from './types.js';

interface OllamaEmbedResponse {
  embeddings: number[][];
}

let ollamaModel = OLLAMA_EMBEDDING_CONFIG.ollamaModel!;
let ollamaBaseUrl = OLLAMA_EMBEDDING_CONFIG.ollamaBaseUrl!;
let ollamaDimensions = OLLAMA_EMBEDDING_CONFIG.dimensions;
let initialized = false;

/**
 * Configure the Ollama embedder
 */
export const configureOllama = (opts: {
  model?: string;
  baseUrl?: string;
  dimensions?: number;
}) => {
  if (opts.model) ollamaModel = opts.model;
  if (opts.baseUrl) ollamaBaseUrl = opts.baseUrl;
  if (opts.dimensions) ollamaDimensions = opts.dimensions;
};

/**
 * Initialize: verify Ollama is reachable and model is available
 */
export const initOllamaEmbedder = async (model?: string, baseUrl?: string): Promise<void> => {
  if (model) ollamaModel = model;
  if (baseUrl) ollamaBaseUrl = baseUrl;

  // Probe with a tiny embed call to verify connectivity + model
  const res = await fetch(`${ollamaBaseUrl}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: ollamaModel, input: 'test' }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Ollama embed probe failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as OllamaEmbedResponse;
  if (!data.embeddings?.[0]) {
    throw new Error('Ollama returned empty embeddings on probe');
  }

  // Auto-detect dimensions from probe response
  ollamaDimensions = data.embeddings[0].length;
  initialized = true;
};

export const isOllamaReady = (): boolean => initialized;
export const getOllamaDimensions = (): number => ollamaDimensions;
export const getOllamaModel = (): string => ollamaModel;

/**
 * Embed a single text via Ollama
 */
export const ollamaEmbedText = async (text: string): Promise<Float32Array> => {
  const res = await fetch(`${ollamaBaseUrl}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: ollamaModel, input: text }),
  });

  if (!res.ok) {
    throw new Error(`Ollama embed failed (${res.status})`);
  }

  const data = (await res.json()) as OllamaEmbedResponse;
  return new Float32Array(data.embeddings[0]);
};

/**
 * Embed multiple texts in one call via Ollama
 * Ollama /api/embed accepts `input` as string[] for batch
 */
export const ollamaEmbedBatch = async (texts: string[]): Promise<Float32Array[]> => {
  if (texts.length === 0) return [];

  const res = await fetch(`${ollamaBaseUrl}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: ollamaModel, input: texts }),
  });

  if (!res.ok) {
    throw new Error(`Ollama batch embed failed (${res.status})`);
  }

  const data = (await res.json()) as OllamaEmbedResponse;
  return data.embeddings.map(e => new Float32Array(e));
};

/**
 * Dispose (no-op for HTTP client, but satisfies interface)
 */
export const disposeOllamaEmbedder = async (): Promise<void> => {
  initialized = false;
};
