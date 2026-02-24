# Ontology Gaps

Types RSIS-GitNexus needs that do NOT yet exist in `medicine-wheel-ontology-core`. Each requires a PR to `jgwill/medicine-wheel`.

## Missing Types

### `SunName` — Thematic Sun enum
```typescript
type SunName =
  | 'NovelEmergence'
  | 'CreativeActualization'
  | 'WovenMeaning'
  | 'FirstCause'
  | 'EmbodiedPractice'
  | 'SustainedPresence';
```
**Where needed**: Inquiry nodes, ceremony host sun, direction_alignment observations
**Workaround until PR merges**: Use `string` and validate at application layer

### `Inquiry`
```typescript
interface Inquiry {
  id: string;
  title: string;
  sun: SunName;
  coreQuestion: string;
  status: 'active' | 'dormant' | 'completed';
  created_at: string;
}
```
**Where needed**: Inquiry graph nodes, `SERVES` edges, wisdom-ledger resource

### `KinshipHub`
```typescript
interface KinshipHub {
  path: string;
  identity: string;
  lineage: string;
  humanAccountabilities: string[];
  moreThanHumanAccountabilities: string[];
  boundaries: string[];
}
```
**Where needed**: Kinship graph nodes, kinship_map tool, governance boundaries
**Note**: ontology-core has `RelationalNode` with `type: 'knowledge'` which is close but not specific enough for directory-level kinship hubs

### `CeremonyPhase` — for Ceremonial Inquiry Ecosystem cadence
```typescript
type CeremonyPhase = 'opening' | 'council' | 'integration' | 'closure';
```
**Note**: ontology-core has `CeremonyType` (smudging, talking_circle, etc.) but not the 4-phase cadence used by the Ceremonial Inquiry Ecosystem. These are orthogonal: a `talking_circle` ceremony can be in `council` phase.

## Action

Local agent should PR these to `jgwill/medicine-wheel/src/ontology-core/src/types.ts` and re-export from `index.ts`. Once published, rsis-gitnexus removes its workaround types and imports from the package.
