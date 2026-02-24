# Ceremonial Tools — MCP Extensions

5 new MCP tools. All return types from `medicine-wheel-*` packages so `mcp-medicine-wheel-ui` can render results without transformation.

## Tools

### `relational_context`
Extends `context` with relational science dimensions.

**Input**: `{ name: string, repo?: string, include?: string[] }`
**Output**: Standard `context` result + enrichments typed as:
- `stewards: RelationalNode[]` (from ontology-core)
- `ceremonies: CeremonyLog[]` (from ontology-core)
- `kinship: KinshipHub | null`
- `inquiries: Inquiry[]`
- `direction: DirectionName` (from ontology-core)
- `ocap: OcapFlags` (from ontology-core)
- `accountability: AccountabilityTracking` (from ontology-core)

### `reciprocity_view`
**Input**: `{ repo?: string, scope?: 'person'|'community'|'kinship_hub', period?: string }`
**Output**:
- `report: AccountabilityReport` (from relational-query)
- `flows: RelationalEdge[]` (from ontology-core)
- `observation: string` — framed as "invites tending", never performance evaluation

### `ceremony_provenance`
**Input**: `{ target: string, repo?: string, depth?: number }`
**Output**:
- `lineage: CeremonyLog[]` (from ontology-core)
- `narrative: string` — generated via narrative-engine beat sequencing
- `stewardship_chain: RelationalNode[]` (from ontology-core)

### `kinship_map`
**Input**: `{ root?: string, depth?: number, repo?: string }`
**Output**:
- `graph: MWGraphData` (from graph-viz) — directly renderable by `<MedicineWheelGraph />`
- `hubs: KinshipHub[]`
- `boundaries: string[]`

### `direction_alignment`
**Input**: `{ repo?: string, since?: string, scope?: 'commits'|'files'|'processes' }`
**Output**:
- `distribution: Record<DirectionName, number>` (DirectionName from ontology-core)
- `details: Array<{ name: string, direction: DirectionName, reason: string }>`
- `observation: string`

## Resources

### `rsis://repo/{name}/medicine-wheel-view`
Returns `MWGraphData` (from graph-viz). `mcp-medicine-wheel-ui` renders this directly via `<MedicineWheelGraph data={fetchedData} />`.

### `rsis://repo/{name}/wisdom-ledger`
Returns inquiry → ceremony → artifact lineage as `NarrativeBeat[]` (from ontology-core).

### `rsis://repo/{name}/kinship`
Returns the kinship graph as `MWGraphData` (from graph-viz).

## Implementation

- Tool handlers in `rsis-gitnexus/src/mcp/local/local-backend.ts`
- Use `medicine-wheel-relational-query` traversal for `relational_context`, `kinship_map`, `reciprocity_view`
- Use `medicine-wheel-narrative-engine` for `ceremony_provenance` narrative generation
- Use `medicine-wheel-graph-viz` types for `kinship_map` and `medicine-wheel-view` resource output
- All `OcapFlags` checked via `checkOcapCompliance()` from ontology-core before returning restricted data
