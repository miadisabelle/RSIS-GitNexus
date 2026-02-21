# GitNexus

**Graph-powered code intelligence for AI agents.** Index any codebase into a knowledge graph, then query it via MCP or CLI.

Works with **Cursor**, **Claude Code**, **Windsurf**, **Cline**, **OpenCode**, and any MCP-compatible tool.

[![npm version](https://img.shields.io/npm/v/rsis-gitnexus.svg)](https://www.npmjs.com/package/rsis-gitnexus)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/License-PolyForm%20Noncommercial-blue.svg)](https://polyformproject.org/licenses/noncommercial/1.0.0/)

---

## Why?

AI coding tools don't understand your codebase structure. They edit a function without knowing 47 other functions depend on it. GitNexus fixes this by **precomputing every dependency, call chain, and relationship** into a queryable graph.

**Three commands to give your AI agent full codebase awareness.**

## Quick Start

```bash
# Index your repo (run from repo root)
npx rsis-gitnexus analyze
```

That's it. This indexes the codebase, installs agent skills, registers Claude Code hooks, and creates `AGENTS.md` / `CLAUDE.md` context files — all in one command.

To configure MCP for your editor, run `npx rsis-gitnexus setup` once — or set it up manually below.

`rsis-gitnexus setup` auto-detects your editors and writes the correct global MCP config. You only need to run it once.

### Editor Support

| Editor | MCP | Skills | Hooks (auto-augment) | Support |
|--------|-----|--------|---------------------|---------|
| **Claude Code** | Yes | Yes | Yes (PreToolUse) | **Full** |
| **Cursor** | Yes | Yes | — | MCP + Skills |
| **Windsurf** | Yes | — | — | MCP |
| **OpenCode** | Yes | Yes | — | MCP + Skills |

> **Claude Code** gets the deepest integration: MCP tools + agent skills + PreToolUse hooks that automatically enrich grep/glob/bash calls with knowledge graph context.

## MCP Setup (manual)

If you prefer to configure manually instead of using `rsis-gitnexus setup`:

### Claude Code (full support — MCP + skills + hooks)

```bash
claude mcp add rsis-gitnexus -- npx -y rsis-gitnexus@latest mcp
```

### Cursor / Windsurf

Add to `~/.cursor/mcp.json` (global — works for all projects):

```json
{
  "mcpServers": {
    "rsis-gitnexus": {
      "command": "npx",
      "args": ["-y", "rsis-gitnexus@latest", "mcp"]
    }
  }
}
```

### OpenCode

Add to `~/.config/opencode/config.json`:

```json
{
  "mcp": {
    "rsis-gitnexus": {
      "command": "npx",
      "args": ["-y", "rsis-gitnexus@latest", "mcp"]
    }
  }
}
```

## How It Works

GitNexus builds a complete knowledge graph of your codebase through a multi-phase indexing pipeline:

1. **Structure** — Walks the file tree and maps folder/file relationships
2. **Parsing** — Extracts functions, classes, methods, and interfaces using Tree-sitter ASTs
3. **Resolution** — Resolves imports and function calls across files with language-aware logic
4. **Clustering** — Groups related symbols into functional communities
5. **Processes** — Traces execution flows from entry points through call chains
6. **Search** — Builds hybrid search indexes for fast retrieval

The result is a **KuzuDB graph database** stored locally in `.rsis-gitnexus/` with full-text search and semantic embeddings.

## MCP Tools

Your AI agent gets these tools automatically:

| Tool | What It Does | `repo` Param |
|------|-------------|--------------|
| `list_repos` | Discover all indexed repositories | — |
| `query` | Process-grouped hybrid search (BM25 + semantic + RRF) | Optional |
| `context` | 360-degree symbol view — categorized refs, process participation | Optional |
| `impact` | Blast radius analysis with depth grouping and confidence | Optional |
| `detect_changes` | Git-diff impact — maps changed lines to affected processes | Optional |
| `rename` | Multi-file coordinated rename with graph + text search | Optional |
| `cypher` | Raw Cypher graph queries | Optional |

> With one indexed repo, the `repo` param is optional. With multiple, specify which: `query({query: "auth", repo: "my-app"})`.

## MCP Resources

| Resource | Purpose |
|----------|---------|
| `rsis-gitnexus://repos` | List all indexed repositories (read first) |
| `rsis-gitnexus://repo/{name}/context` | Codebase stats, staleness check, and available tools |
| `rsis-gitnexus://repo/{name}/clusters` | All functional clusters with cohesion scores |
| `rsis-gitnexus://repo/{name}/cluster/{name}` | Cluster members and details |
| `rsis-gitnexus://repo/{name}/processes` | All execution flows |
| `rsis-gitnexus://repo/{name}/process/{name}` | Full process trace with steps |
| `rsis-gitnexus://repo/{name}/schema` | Graph schema for Cypher queries |

## MCP Prompts

| Prompt | What It Does |
|--------|-------------|
| `detect_impact` | Pre-commit change analysis — scope, affected processes, risk level |
| `generate_map` | Architecture documentation from the knowledge graph with mermaid diagrams |

## CLI Commands

```bash
rsis-gitnexus setup                    # Configure MCP for your editors (one-time)
rsis-gitnexus analyze [path]           # Index a repository (or update stale index)
rsis-gitnexus analyze --force          # Force full re-index
rsis-gitnexus analyze --skip-embeddings  # Skip embedding generation (faster)
rsis-gitnexus mcp                     # Start MCP server (stdio) — serves all indexed repos
rsis-gitnexus serve                   # Start HTTP server for web UI
rsis-gitnexus list                    # List all indexed repositories
rsis-gitnexus status                  # Show index status for current repo
rsis-gitnexus clean                   # Delete index for current repo
rsis-gitnexus clean --all --force     # Delete all indexes
rsis-gitnexus wiki [path]             # Generate LLM-powered docs from knowledge graph
rsis-gitnexus wiki --model <model>    # Wiki with custom LLM model (default: gpt-4o-mini)
```

## Multi-Repo Support

GitNexus supports indexing multiple repositories. Each `rsis-gitnexus analyze` registers the repo in a global registry (`~/.rsis-gitnexus/registry.json`). The MCP server serves all indexed repos automatically.

## Supported Languages

TypeScript, JavaScript, Python, Java, C, C++, C#, Go, Rust

## Agent Skills

GitNexus ships with skill files that teach AI agents how to use the tools effectively:

- **Exploring** — Navigate unfamiliar code using the knowledge graph
- **Debugging** — Trace bugs through call chains
- **Impact Analysis** — Analyze blast radius before changes
- **Refactoring** — Plan safe refactors using dependency mapping

Installed automatically by both `rsis-gitnexus analyze` (per-repo) and `rsis-gitnexus setup` (global).

## Requirements

- Node.js >= 18
- Git repository (uses git for commit tracking)

## Privacy

- All processing happens locally on your machine
- No code is sent to any server
- Index stored in `.rsis-gitnexus/` inside your repo (gitignored)
- Global registry at `~/.rsis-gitnexus/` stores only paths and metadata

## Web UI

GitNexus also has a browser-based UI at [rsis-gitnexus.vercel.app](https://rsis-gitnexus.vercel.app) — 100% client-side, your code never leaves the browser.

## License

[PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0/)

Free for non-commercial use. Contact for commercial licensing.
