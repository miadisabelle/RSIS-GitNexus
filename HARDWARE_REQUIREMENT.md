# RSIS-GitNexus — Hardware Requirement for Semantic Embeddings

**Date:** 2026-02-24
**Status:** Suspended pending infrastructure upgrade

## Observation

Running `rsis-gitnexus analyze` with Ollama embedding backend (`mxbai-embed-large:latest`, 334M params, F16, 1024-dim vectors) crashed the current development machine (gaia.jgwill.com) due to resource exhaustion during batch embedding of code nodes.

## What Works Now

- Repository indexing (Tree-sitter AST → KuzuDB graph): **functional**
- BM25 keyword search: **functional**
- MCP tools (12 tools including 5 RSIS relational tools): **functional**
- CLI (`rsis analyze --skip-embeddings`, `rsis list`, `rsis query`): **functional**

## What Requires Stronger Hardware

- **Semantic vector embeddings** — the component that enables natural-language code search ("find ceremony provenance logic") vs keyword-only search
- Embedding 500+ code nodes with a 334M-param model in batch exceeds current RAM/CPU capacity
- This is the differentiator between basic code indexing and relational code intelligence

## Infrastructure Need

| Option | Spec | Est. Cost |
|--------|------|-----------|
| GPU server (cloud) | 1x A10G or T4, 16GB+ VRAM | ~$0.50-1.00/hr |
| Local GPU workstation | RTX 3060+ (12GB VRAM) | ~$800-1200 one-time |
| Smaller model fallback | nomic-embed-text (137M, 768d) | Current hardware *might* work |

## Code Readiness

The Ollama embedding backend is fully implemented and builds clean:
- `src/core/embeddings/ollama-embedder.ts` — HTTP client
- Both embedder modules wired for `RSIS_EMBED_DEVICE=ollama`
- Dynamic vector dimensions in KuzuDB schema
- Environment variables: `RSIS_EMBED_DEVICE`, `RSIS_OLLAMA_MODEL`, `RSIS_OLLAMA_URL`

Ready to activate the moment adequate compute is available.
