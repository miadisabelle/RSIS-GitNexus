# Ceremonial Tools — MCP Extensions

New MCP tools that project git history and code relationships through relational science lenses, extending GitNexus's existing 7-tool suite.

## Desired Outcome

AI agents and human stewards create relational understanding of codebases — seeing not just "what calls what" but "what ceremonies birthed this code," "who is stewarding this knowledge," and "where is reciprocity flowing or stagnating."

## Current Reality

GitNexus exposes 7 MCP tools (`query`, `context`, `impact`, `detect_changes`, `rename`, `cypher`, `list_repos`) focused purely on code-structural intelligence. No tools expose relational, ceremonial, or kinship views.

## New MCP Tools

### `relational_context`
360-degree relational view of a code symbol — extending `context` with ceremonial and kinship dimensions.

**Parameters**:
- `name` (string, required): Symbol name
- `repo` (string, optional): Repository name
- `include` (string[], optional): Which relational dimensions to include. Default: all. Options: `ceremonies`, `inquiries`, `stewards`, `kinship`, `directions`, `reciprocity`

**Returns**:
- Everything `context` returns (incoming/outgoing calls, imports, processes)
- Plus: `ceremonies[]` — ceremonies this symbol participated in (with phase)
- Plus: `inquiries[]` — inquiries this symbol serves
- Plus: `stewards[]` — people with stewardship over this symbol
- Plus: `kinship` — kinship hub this symbol belongs to, with boundaries
- Plus: `direction_alignment` — directional tagging of the symbol's creation context

### `reciprocity_view`
Surfaces reciprocity patterns across the codebase — where contributions flow, where giving and taking are balanced or imbalanced.

**Parameters**:
- `repo` (string, optional): Repository name
- `scope` (string, optional): `person`, `community`, `kinship_hub`. Default: `community`
- `period` (string, optional): ISO date range. Default: last ceremony cycle

**Returns**:
- `flows[]` — contribution flows between entities (commits, reviews, documentation, mentoring tags)
- `balance` — per-entity reciprocity assessment (giving vs taking)
- `prompts[]` — suggested ceremonial attention points (NOT performance metrics — framed as "this area invites tending")

**Behavior**: Results are framed as invitations for ceremonial attention, never as performance evaluations. Language uses "invites tending" not "underperforming."

### `ceremony_provenance`
Traces a code artifact back to its ceremonial origins.

**Parameters**:
- `target` (string, required): File path, function name, or directory
- `repo` (string, optional): Repository name
- `depth` (number, optional): How many ceremony cycles back to trace. Default: 3

**Returns**:
- `lineage[]` — Ordered list of ceremonies, inquiries, and structural tension charts that shaped this artifact
- `narrative` — A human-readable provenance story: "This module was born in the Novel Emergence Sun during cycle X, refactored under Sustained Presence during cycle Y..."
- `stewardship_chain[]` — Who stewarded changes at each point

### `kinship_map`
Visualizes the kinship relationships between directories, repos, and knowledge spaces.

**Parameters**:
- `root` (string, optional): Starting path. Default: repo root
- `depth` (number, optional): Kinship traversal depth. Default: 2

**Returns**:
- `hubs[]` — KinshipHub nodes with identity, lineage, accountabilities
- `relations[]` — KINSHIP_OF edges between hubs
- `boundaries[]` — Access and modification boundaries per hub

### `direction_alignment`
Analyzes recent changes through the Four Directions lens — categorizing work as vision (East), planning (South), implementation (West), or reflection (North).

**Parameters**:
- `repo` (string, optional): Repository name
- `since` (string, optional): ISO date. Default: last 7 days
- `scope` (string, optional): `commits`, `files`, `processes`. Default: `commits`

**Returns**:
- `distribution` — Percentage of work in each direction
- `details[]` — Per-commit or per-file directional classification
- `observation` — Natural language observation: "Recent work is concentrated in West (implementation). The ecosystem may benefit from a North (reflection) ceremony."

## Extended Resources

### `rsis://repo/{name}/wisdom-ledger`
Returns a Wisdom Ledger view — linking inquiries, ceremonies, code artifacts, and integrated artifacts across time.

### `rsis://repo/{name}/stewards-compass`
Returns accumulated directional teachings, cautionary patterns, and onboarding narrative distilled from ceremony records.

### `rsis://repo/{name}/kinship`
Returns the full kinship graph for the repository.

## Implementation Notes

- New tools are registered in `rsis-gitnexus/src/mcp/tools.ts` alongside existing tools
- New resources are registered in `rsis-gitnexus/src/mcp/resources.ts`
- All new tools query the extended relational schema (see `relational-schema.spec.md`)
- The `relational_context` tool composes with the existing `context` tool — it calls `context` internally then enriches the result
- Reciprocity framing enforced at the tool output layer — raw data never exposed as rankings
