# Medicine Wheel Packages — Dependency Map

## Reality

Five packages exist and are published at `medicine-wheel-*` on npm (v0.1.0).
Source lives in `/workspace/repos/jgwill/medicine-wheel/src/`.
`mcp-medicine-wheel-ui` already depends on all 5.

**RSIS-GitNexus must install and import these packages — NOT duplicate them.**

## Package → RSIS-GitNexus Usage

### `medicine-wheel-ontology-core` → types, schemas, validation, query helpers

| What rsis-gitnexus uses | From ontology-core |
|-------------------------|--------------------|
| All relational types | `DirectionName`, `RelationalNode`, `Relation`, `OcapFlags`, `AccountabilityTracking`, `CeremonyLog`, `NarrativeBeat`, etc. |
| Constants | `DIRECTIONS`, `DIRECTION_NAMES`, `CEREMONY_TYPES`, `NODE_TYPES` |
| Zod validation | `OcapFlagsSchema`, `CeremonyLogSchema`, `DirectionNameSchema` |
| Wilson scoring | `computeWilsonAlignment()`, `checkOcapCompliance()`, `relationalCompleteness()` |

### `medicine-wheel-relational-query` → graph traversal in tool handlers

| What rsis-gitnexus uses | From relational-query |
|-------------------------|----------------------|
| Traversal types | `TraversalOptions`, `TraversalResult`, `TraversalPath` |
| Audit types | `AccountabilityReport` |
| Filter types | `NodeFilter`, `EdgeFilter`, `RelationFilter` |

### `medicine-wheel-narrative-engine` → ceremony_provenance narrative generation

| What rsis-gitnexus uses | From narrative-engine |
|-------------------------|----------------------|
| Beat sequencing | Convert ceremony lineage into ordered `NarrativeBeat[]` |
| Arc validation | Validate that provenance story covers all directions |

### `medicine-wheel-graph-viz` → MWGraphData output for UI consumption

| What rsis-gitnexus uses | From graph-viz |
|-------------------------|----------------|
| Graph types | `MWGraphData`, `MWGraphNode`, `MWGraphLink` |
| Layout types | `WheelLayoutConfig` (for default layout hints in resource output) |

### `medicine-wheel-ui-components` → NOT used by rsis-gitnexus

This package is consumed by `mcp-medicine-wheel-ui` directly. RSIS-GitNexus does not render React components.

## What does NOT exist in medicine-wheel packages yet

See `ontology-gaps.md` for types RSIS-GitNexus needs that must be added to `jgwill/medicine-wheel` via PR.

## Delete from this repo

The `medicine-wheel/` directory in this repo (created by previous cloud agent) must be **deleted entirely**. It contains stale duplicates of what already exists in the published packages.
