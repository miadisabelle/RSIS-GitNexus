# Ecosystem Integration

How rsis-gitnexus feeds data into `mcp-medicine-wheel-ui` and connects to coaia-narrative charts.

## Desired Outcome

A human working in `mcp-medicine-wheel-ui` sees **live relational intelligence from their repos** — which directions recent work aligned with, which ceremonies birthed which modules, where reciprocity invites tending — rendered via the `medicine-wheel-*` React components that the UI already imports.

## Data Flow

```
git repo
  ↓ rsis-gitnexus analyze (indexes into KuzuDB)
  ↓ rsis-gitnexus mcp (serves MCP tools + resources)
  ↓
mcp-medicine-wheel (MCP server, reads rsis resources)
  ↓
mcp-medicine-wheel-ui (Next.js, renders via medicine-wheel-ui-components)
  uses: <MedicineWheelGraph data={MWGraphData} />
  uses: <DirectionCard direction={...} />
  uses: <BeatTimeline beats={NarrativeBeat[]} />
  uses: <WilsonMeter alignment={number} />
  uses: <OcapBadge compliant={boolean} />
```

## Integration Points

### 1. Medicine Wheel View → UI

**Resource**: `rsis://repo/{name}/medicine-wheel-view`
**Returns**: `MWGraphData` (from `medicine-wheel-graph-viz`)
**UI renders**: `<MedicineWheelGraph data={data} showOcapIndicators showWilsonHalos />`

No transformation needed. The resource returns the exact prop type.

### 2. Direction Alignment → DirectionCard

**Tool**: `direction_alignment`
**Returns**: `distribution: Record<DirectionName, number>`
**UI renders**: Four `<DirectionCard>` components, one per direction, with count/percentage

### 3. Ceremony Provenance → BeatTimeline

**Tool**: `ceremony_provenance`
**Returns**: `lineage: CeremonyLog[]` → converted to `NarrativeBeat[]` by narrative-engine
**UI renders**: `<BeatTimeline beats={beats} />`

### 4. Reciprocity → WilsonMeter

**Tool**: `reciprocity_view`
**Returns**: `report: AccountabilityReport` with `averageWilsonAlignment`
**UI renders**: `<WilsonMeter alignment={report.averageWilsonAlignment} />`

### 5. Coaia-narrative Charts ↔ Inquiries

**Indexing behavior**: When `rsis-gitnexus analyze` runs with `.rsis/config.json` listing chart paths:
- Parse `.coaia/*.coaia-narrative.jsonl` files
- Extract chart `desired_outcome` as Inquiry nodes
- Match commits to action steps via commit message mining
- Create `SERVES` edges: File → Inquiry

### 6. Commit Direction Classification

Commits auto-tagged with `DirectionName` via heuristics or explicit `[east]`/`[south]`/`[west]`/`[north]` tags. Stored as `ALIGNED_WITH` edges. Feeds `direction_alignment` tool and the direction distribution view in the UI.

## What `mcp-medicine-wheel-ui` needs to add

To consume rsis-gitnexus data, the UI needs:
1. An MCP client that reads `rsis://` resources (or fetches from `rsis-gitnexus serve` HTTP)
2. A "Repository View" page that renders the medicine-wheel-view resource
3. Wire existing components (`MedicineWheelGraph`, `DirectionCard`, `BeatTimeline`, `WilsonMeter`, `OcapBadge`) to rsis-gitnexus data

The packages are already installed. The data shapes already match. The missing piece is the fetch + render wiring.
