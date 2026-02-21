# Ecosystem Integration

Connectors between RSIS-GitNexus and the broader IAIP ecosystem: Structural Tension Charts (coaia-narrative), IAIP-MCP (Four Directions), Kinship Hub protocol, and Medicine Wheel UI.

## Desired Outcome

RSIS-GitNexus participates as a living organ within the Ceremonial Inquiry Ecosystem — feeding code-relational intelligence into ceremonies, charts, and kinship maps; and receiving ceremonial context (active inquiries, current cycle phase, directional guidance) that shapes how it presents information.

## Current Reality

- `coaia-narrative` MCP manages structural tension charts as JSONL files in `.coaia/` directories
- `iaip-mcp` provides Four Directions guidance and relational alignment assessment
- `mcp-medicine-wheel` and `mcp-medicine-wheel-ui` are emerging as the visual/interactive layer
- `KINSHIP.md` and `KINSHIP.list.txt` files are manually maintained
- No automated connection between these systems and GitNexus's code graph

## Integration Points

### 1. Structural Tension Charts ↔ Code Artifacts

**Behavior**: When RSIS-GitNexus indexes a repo, it reads `.coaia/` chart files and creates `BORN_FROM` and `SERVES` edges linking code artifacts to chart IDs.

**Mechanism**:
- Parse `.coaia/*.coaia-narrative.jsonl` files during indexing
- Extract chart IDs, desired outcomes, action steps
- Match action steps to code changes via commit message mining (Phase 4 RISE methodology)
- Create graph edges: `File/Function --SERVES--> chart_id`

**Configuration**: Chart file paths specified in `.rsis/config.json` under `charts[]` key, or auto-discovered from `.coaia/` directories.

### 2. Four Directions ↔ Commit Classification

**Behavior**: Commits are automatically classified by directional alignment based on commit message patterns and file change types.

**Classification Heuristics**:
- **East** 🌸: Commits touching vision docs, README, intention files, `.md` in root
- **South** 🧠: Commits touching architecture, schemas, types, configs, `rispecs/`
- **West** ⚡: Commits touching implementation code, tests, scripts
- **North** 🕸️: Commits touching docs, changelogs, reflection files, `KINSHIP.md`

**Override**: Commit messages can include directional tags: `[east]`, `[south]`, `[west]`, `[north]` for explicit classification.

**Storage**: Direction stored as `ALIGNED_WITH` edge from Commit node to Direction node.

### 3. Kinship Hub Auto-Discovery

**Behavior**: RSIS-GitNexus reads `KINSHIP.md` and `.mia/kinship/KINSHIP.list.txt` files to populate KinshipHub nodes and KINSHIP_OF edges.

**Discovery**:
- Scan for `KINSHIP.md` files in repo and referenced paths
- Parse identity, lineage, accountabilities, boundaries from each file
- Create KinshipHub nodes in the graph
- Establish KINSHIP_OF edges between hubs based on declared relationships

**Behavior on Index**: Kinship discovery runs as a post-indexing step. If kinship files change, a re-index of the kinship layer updates graph nodes without full code re-indexing.

### 4. Medicine Wheel UI Data Feed

**Behavior**: RSIS-GitNexus exposes a JSON endpoint (via MCP resource or HTTP when `rsis-gitnexus serve` runs) that Medicine Wheel UI consumes for visualization.

**Data Shape**:
```
{
  "suns": [...],           // Six Thematic Suns with inquiry counts
  "directions": {          // Four Directions distribution
    "east": { "count": N, "recent": [...] },
    "south": { "count": N, "recent": [...] },
    "west":  { "count": N, "recent": [...] },
    "north": { "count": N, "recent": [...] }
  },
  "reciprocity": {         // Reciprocity flow summary
    "flows": [...],
    "balance": {...}
  },
  "kinship": {             // Kinship graph for visualization
    "hubs": [...],
    "relations": [...]
  }
}
```

**Resource URI**: `rsis://repo/{name}/medicine-wheel-view`

### 5. Ceremony Phase Awareness

**Behavior**: When a ceremony is active (defined in `.rsis/ceremony.json` or retrieved from coaia-narrative charts), RSIS-GitNexus tools adjust their output framing:

- **Opening phase**: Tools emphasize intention and vision (what wants to emerge)
- **Council phase**: Tools show cross-Sun perspectives on code relationships
- **Integration phase**: Tools help produce synthesis artifacts (lineage diagrams, woven insights)
- **Closure phase**: Tools surface reciprocity summaries and seeding observations

**Mechanism**: Ceremony state read from local config. Tool output templates include ceremony-phase-aware framing sections.

## Configuration File: `.rsis/config.json`

```json
{
  "enabled": true,
  "charts": [
    ".coaia/charts.coaia-narrative.jsonl"
  ],
  "kinship_paths": [
    "KINSHIP.md",
    ".mia/kinship/KINSHIP.list.txt"
  ],
  "ceremony": {
    "current_cycle": "2026-02",
    "host_sun": "EmbodiedPractice",
    "phase": "council"
  },
  "directions": {
    "auto_classify_commits": true,
    "heuristics": "default"
  },
  "governance": {
    "protected_paths": [],
    "ceremony_required_paths": []
  }
}
```

## Implementation Notes

- Integration layer lives in new `rsis-gitnexus/src/core/rsis/` directory
- Does not modify existing GitNexus core — extends via hooks in the indexing pipeline
- Chart parsing uses line-delimited JSON reader (same as coaia-narrative)
- Kinship parsing uses markdown frontmatter + section extraction
- Medicine Wheel data feed is a computed view, not stored — regenerated on request from graph queries
