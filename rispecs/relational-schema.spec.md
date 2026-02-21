# Relational Schema Extension

Extends GitNexus's KuzuDB graph with entities and relationships grounded in Wilson's relational ontology and the Ceremonial Inquiry Ecosystem.

## Desired Outcome

A graph schema where code artifacts exist in relationship with people, inquiries, ceremonies, directions, and kinship — enabling queries like "What ceremonies birthed this module?" or "Which inquiries does this code path serve?" alongside the existing "What calls this function?"

## Current Reality

GitNexus graph knows: `File, Function, Class, Interface, Method, Community, Process` with edges `CALLS, IMPORTS, EXTENDS, IMPLEMENTS, DEFINES, MEMBER_OF, STEP_IN_PROCESS`. These are purely code-structural. No relational science entities exist in the schema.

## New Node Types

### `Person`
A human contributor with relational identity (not just git author string).
- **Properties**: `name`, `email`, `roles[]` (steward, contributor, elder, firekeeper), `communities[]`
- **Behavior**: Created from git history enriched by governance metadata. A Person is not reducible to their commits.

### `Inquiry`
A living question being explored across the ecosystem.
- **Properties**: `id`, `title`, `sun` (thematic sun affiliation), `coreQuestion`, `status`, `createdAt`
- **Behavior**: Linked to code artifacts that serve or emerged from the inquiry. Maps to Perplexity inquiry IDs and Structural Tension Chart IDs.

### `Sun`
One of the six Thematic Suns from the Ceremonial Inquiry Ecosystem.
- **Properties**: `name`, `principle`, `coreQuestion`, `valueStatement`
- **Enum values**: `NovelEmergence`, `CreativeActualization`, `WovenMeaning`, `FirstCause`, `EmbodiedPractice`, `SustainedPresence`

### `Ceremony`
A bounded ceremonial cycle with four phases (Opening, Council, Integration, Closure).
- **Properties**: `id`, `hostSun`, `cycle`, `phase`, `startDate`, `endDate`, `intention`
- **Behavior**: Commits made during a ceremony phase are linked to that ceremony.

### `Direction`
One of the Four Directions (East/South/West/North).
- **Properties**: `name`, `indigenousName`, `focus`, `primaryAgent`
- **Behavior**: Code changes, reviews, and architectural decisions can be tagged with directional alignment.

### `KinshipHub`
A directory or repository treated as a relational accountability node per the Kinship Hub protocol.
- **Properties**: `path`, `identity`, `lineage`, `humanAccountabilities[]`, `moreThanHumanAccountabilities[]`, `boundaries[]`
- **Behavior**: Maps to `KINSHIP.md` files. Establishes relational boundaries for what code may access or modify.

## New Edge Types

### `STEWARDS`
Person → (File | KinshipHub) — Who holds mana/authority over this code or knowledge space.

### `BORN_FROM`
(File | Function | Class) → (Inquiry | Ceremony) — Provenance linking code to the ceremonial/inquiry context that birthed it.

### `SERVES`
(File | Function | Class) → (Inquiry | Sun) — What inquiry or thematic sun does this code serve?

### `GIVES_BACK_TO`
Person → (Community | KinshipHub) — Reciprocity tracking: documentation, mentoring, refactoring as acts of giving.

### `ALIGNED_WITH`
(Commit | File) → Direction — Directional alignment of work (East=vision, South=architecture, West=implementation, North=reflection).

### `KINSHIP_OF`
KinshipHub → KinshipHub — Relational links between directories/repos per Kinship Hub protocol.

## Schema Migration

**Behavior**: The schema extension is additive — all existing GitNexus node types and edges remain unchanged. New types are added via KuzuDB `CREATE NODE TABLE` and `CREATE REL TABLE` statements. A migration script runs after `gitnexus analyze` when RSIS mode is enabled.

**Configuration**: RSIS extensions activate when a `.rsis/config.json` exists in the repo root, or when `--rsis` flag is passed to `gitnexus analyze`.

## Implementation Reference

- Existing schema definition: `gitnexus/src/storage/` (KuzuDB interface)
- Graph population: `gitnexus/src/core/graph/`
- Type definitions: `gitnexus/src/types/pipeline.ts`
