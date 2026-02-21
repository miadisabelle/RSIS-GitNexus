# RSIS-GitNexus

Extends GitNexus (zero-server code intelligence engine) into a **relational code elder** — indexing git repos into a knowledge graph that speaks the relational science vocabulary already defined in the `medicine-wheel-*` npm packages.

## Desired Outcome

When a human or AI agent runs `rsis-gitnexus analyze` on any repo, the resulting MCP server exposes relational views (kinship, ceremony provenance, reciprocity, directional alignment) alongside standard code intelligence. These views use the **exact types from `medicine-wheel-ontology-core`** so that `mcp-medicine-wheel-ui` can render them directly — no translation layer needed.

## Current Reality

- GitNexus indexes code into KuzuDB: File, Function, Class, Interface, Method, Community, Process
- Five `medicine-wheel-*` packages exist and are **published on npm** (v0.1.0), with real source in `/workspace/repos/jgwill/medicine-wheel/src/`
- `mcp-medicine-wheel-ui` (Next.js app) **already depends on all 5 packages**
- RSIS-GitNexus currently imports **zero** medicine-wheel packages — types are duplicated inline

## Architecture

```
jgwill/medicine-wheel/src/          ← shared npm packages (source of truth)
  ontology-core                     ← types, schemas, vocabulary, query helpers
  relational-query                  ← traversal, filters, accountability audit
  narrative-engine                  ← beat sequencing, arc validation, cadence
  graph-viz                         ← MWGraphNode, MWGraphLink, wheel layout
  ui-components                     ← DirectionCard, BeatTimeline, WilsonMeter

miadisabelle/RSIS-GitNexus          ← THIS REPO (fork of GitNexus)
  rsis-gitnexus/src/
    core/rsis/                      ← RSIS indexing pipeline (populates graph)
    mcp/tools.ts                    ← 5 new MCP tools returning medicine-wheel types
    mcp/resources.ts                ← 3 new MCP resources
  .rsis/config.json                 ← per-repo activation

/src/mcp-medicine-wheel-ui          ← visual surface (already consumes packages)
  renders MWGraphData, DirectionCard, BeatTimeline from package imports
  NEW: consumes rsis-gitnexus MCP views to show code-relational intelligence
```

## Critical Rule

**Do NOT duplicate types from `medicine-wheel-ontology-core`.** Import them. If a type is missing from ontology-core, open a PR on `jgwill/medicine-wheel` to add it — or note it in `rispecs/ontology-gaps.md` for the local agent.

## Spec Files

| File | What It Specifies |
|------|-------------------|
| `app.spec.md` | This file — system overview, architecture, rules |
| `dependency-contracts.spec.md` | Exact imports from each medicine-wheel package and what rsis-gitnexus uses them for |
| `relational-schema.spec.md` | KuzuDB schema extension using ontology-core types |
| `ceremonial-tools.spec.md` | 5 new MCP tools — inputs, outputs typed with medicine-wheel types |
| `ecosystem-integration.spec.md` | How rsis-gitnexus feeds data to mcp-medicine-wheel-ui |
| `governance-sovereignty.spec.md` | Indigenous data sovereignty via OcapFlags from ontology-core |
| `ontology-gaps.md` | Types rsis-gitnexus needs that don't exist in ontology-core yet — PRs needed on jgwill/medicine-wheel |

## Non-Goals

- Never reinvent types that exist in medicine-wheel-ontology-core
- Never rank individuals by productivity
- Never aggregate data to external services
- Never bypass OCAP® governance flags
