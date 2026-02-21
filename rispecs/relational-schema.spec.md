# Relational Schema Extension

Extends GitNexus's KuzuDB graph with entities from `medicine-wheel-ontology-core` types.

## Desired Outcome

The KuzuDB graph stores relational science entities using the same type vocabulary that `mcp-medicine-wheel-ui` renders. A `RelationalNode` in the graph IS the `RelationalNode` from ontology-core.

## Current Reality

GitNexus graph: `File, Function, Class, Interface, Method, Community, Process` with code-structural edges. ontology-core defines `RelationalNode`, `Relation`, `CeremonyLog`, `NarrativeBeat`, `StructuralTensionChart` — none are in the graph yet.

## New KuzuDB Node Tables

All map directly to ontology-core types:

### `RelationalNode` (from ontology-core)
Stores people, land, spirit, ancestor, future, knowledge entities.
- Properties mirror `RelationalNode`: `id, name, type (NodeType), direction (DirectionName), metadata, created_at, updated_at`

### `CeremonyLog` (from ontology-core)
- Properties mirror `CeremonyLog`: `id, type (CeremonyType), direction, participants, medicines_used, intentions, timestamp, research_context`

### `Inquiry`
- Properties: `id, title, sun (SunName), coreQuestion, status, created_at`
- **Note**: `SunName` is NOT in ontology-core yet (see `ontology-gaps.md`). Use string until PR merges.

### `KinshipHub`
- Properties: `path, identity, lineage, humanAccountabilities[], moreThanHumanAccountabilities[], boundaries[]`
- Parsed from `KINSHIP.md` files

## New KuzuDB Relation Tables

### `RSISRelation` (maps to ontology-core `Relation`)
A single relation table with `type` property discriminator, mirroring how CodeRelation works:

| type | from → to | meaning |
|------|-----------|---------|
| `STEWARDS` | RelationalNode → File | Who holds authority |
| `BORN_FROM` | File → CeremonyLog | Ceremonial provenance |
| `SERVES` | File → Inquiry | What inquiry this code serves |
| `GIVES_BACK_TO` | RelationalNode → RelationalNode | Reciprocity |
| `ALIGNED_WITH` | File → DirectionName (stored as property) | Four Directions alignment |
| `KINSHIP_OF` | KinshipHub → KinshipHub | Inter-hub relations |

Properties on RSISRelation: `type, strength, ceremony_honored, direction, ocap (JSON-serialized OcapFlags from ontology-core)`

## Schema Migration

Additive. Runs after `rsis-gitnexus analyze` when `.rsis/config.json` exists. Uses `CREATE NODE TABLE IF NOT EXISTS` and `CREATE REL TABLE IF NOT EXISTS`.

## Implementation

- Schema DDL: `rsis-gitnexus/src/core/kuzu/schema.ts`
- Type imports: `from 'medicine-wheel-ontology-core'` — not inline
- OcapFlags stored as JSON string in KuzuDB (no native complex type), parsed on read via `OcapFlagsSchema.parse()`
