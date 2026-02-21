# Dependency Contracts

Exact imports RSIS-GitNexus must use from published `medicine-wheel-*` packages. No inline duplication.

## `package.json` dependencies to add

```json
{
  "dependencies": {
    "medicine-wheel-ontology-core": "^0.1.0",
    "medicine-wheel-relational-query": "^0.1.0",
    "medicine-wheel-narrative-engine": "^0.1.0",
    "medicine-wheel-graph-viz": "^0.1.0"
  }
}
```

Note: `medicine-wheel-ui-components` is NOT a dependency of rsis-gitnexus — it's consumed by `mcp-medicine-wheel-ui` directly.

---

## From `medicine-wheel-ontology-core`

**Used in**: `rsis-gitnexus/src/core/rsis/types.ts`, `rsis-gitnexus/src/mcp/tools.ts`, `rsis-gitnexus/src/core/kuzu/schema.ts`

```typescript
// Types — DO NOT REDEFINE, import these
import type {
  DirectionName,
  Direction,
  NodeType,
  RelationalNode,
  RelationalEdge,
  Relation,
  OcapFlags,
  AccountabilityTracking,
  CeremonyType,
  CeremonyLog,
  NarrativeBeat,
  MedicineWheelCycle,
  TensionPhase,
  StructuralTensionChart,
  ActionStep,
  RelationalObligation,
  ObligationCategory,
} from 'medicine-wheel-ontology-core';

// Constants
import {
  DIRECTIONS,
  DIRECTION_NAMES,
  CEREMONY_TYPES,
  NODE_TYPES,
} from 'medicine-wheel-ontology-core';

// Query helpers — for computing Wilson alignment scores on indexed data
import {
  computeWilsonAlignment,
  checkOcapCompliance,
  beatsByDirection,
  relationalCompleteness,
} from 'medicine-wheel-ontology-core';

// Zod schemas — for validating .rsis/config.json and governance.json input
import {
  DirectionNameSchema,
  OcapFlagsSchema,
  CeremonyLogSchema,
} from 'medicine-wheel-ontology-core';
```

---

## From `medicine-wheel-relational-query`

**Used in**: `rsis-gitnexus/src/mcp/local/local-backend.ts` (tool handlers that query the graph)

```typescript
import type {
  TraversalOptions,
  TraversalResult,
  TraversalPath,
  AccountabilityReport,
  NodeFilter,
  EdgeFilter,
  RelationFilter,
  QueryResult,
} from 'medicine-wheel-relational-query';
```

**Why**: The `relational_context`, `kinship_map`, and `reciprocity_view` tools perform graph traversals. Instead of hand-writing traversal logic, use the query builder that already handles ceremony boundaries, OCAP-only traversal, and Wilson alignment filtering.

---

## From `medicine-wheel-narrative-engine`

**Used in**: `rsis-gitnexus/src/mcp/local/local-backend.ts` (ceremony_provenance tool)

```typescript
import type {
  // For sequencing ceremony lineage into a readable arc
} from 'medicine-wheel-narrative-engine';
```

**Why**: The `ceremony_provenance` tool returns a `narrative` field — a human-readable provenance story. The narrative-engine's beat sequencing and arc validation create that story from raw ceremony/commit data.

---

## From `medicine-wheel-graph-viz`

**Used in**: `rsis-gitnexus/src/mcp/resources.ts` (medicine-wheel-view resource)

```typescript
import type {
  MWGraphNode,
  MWGraphLink,
  MWGraphData,
} from 'medicine-wheel-graph-viz';
```

**Why**: The `rsis://repo/{name}/medicine-wheel-view` resource returns `MWGraphData` — the exact shape `mcp-medicine-wheel-ui` renders via `<MedicineWheelGraph data={...} />`. By returning this type, the UI needs zero transformation.

---

## What this means for the cloud agent

1. `npm install medicine-wheel-ontology-core medicine-wheel-relational-query medicine-wheel-narrative-engine medicine-wheel-graph-viz` in `rsis-gitnexus/`
2. Delete `rsis-gitnexus/src/core/rsis/types.ts` — replace all imports with ontology-core
3. Delete `medicine-wheel/` directory from this repo entirely — those stubs are obsolete
4. Tool handlers return types from the packages, not inline interfaces
5. The `rsis://repo/{name}/medicine-wheel-view` resource returns `MWGraphData` directly
