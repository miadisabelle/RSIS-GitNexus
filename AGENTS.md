# AI Agent Rules

<!-- rsis-gitnexus:start -->
# GitNexus MCP

This project is indexed by GitNexus as **GitnexusV2** (1312 symbols, 3315 relationships, 101 execution flows).

GitNexus provides a knowledge graph over this codebase — call chains, blast radius, execution flows, and semantic search.

## Always Start Here

For any task involving code understanding, debugging, impact analysis, or refactoring, you must:

1. **Read `rsis-gitnexus://repo/{name}/context`** — codebase overview + check index freshness
2. **Match your task to a skill below** and **read that skill file**
3. **Follow the skill's workflow and checklist**

> If step 1 warns the index is stale, run `npx rsis-gitnexus analyze` in the terminal first.

## Skills

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/rsis-gitnexus/exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/rsis-gitnexus/impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/rsis-gitnexus/debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/rsis-gitnexus/refactoring/SKILL.md` |

## Tools Reference

| Tool | What it gives you |
|------|-------------------|
| `query` | Process-grouped code intelligence — execution flows related to a concept |
| `context` | 360-degree symbol view — categorized refs, processes it participates in |
| `impact` | Symbol blast radius — what breaks at depth 1/2/3 with confidence |
| `detect_changes` | Git-diff impact — what do your current changes affect |
| `rename` | Multi-file coordinated rename with confidence-tagged edits |
| `cypher` | Raw graph queries (read `rsis-gitnexus://repo/{name}/schema` first) |
| `list_repos` | Discover indexed repos |
| `relational_context` | 360-degree relational view — ceremonies, inquiries, stewards, kinship |
| `reciprocity_view` | Reciprocity patterns and balance across the codebase |
| `ceremony_provenance` | Trace code artifacts back to ceremonial origins |
| `kinship_map` | Kinship relationships between directories and repos |
| `direction_alignment` | Four Directions analysis of recent changes |

## Resources Reference

Lightweight reads (~100-500 tokens) for navigation:

| Resource | Content |
|----------|---------|
| `rsis-gitnexus://repo/{name}/context` | Stats, staleness check |
| `rsis-gitnexus://repo/{name}/clusters` | All functional areas with cohesion scores |
| `rsis-gitnexus://repo/{name}/cluster/{clusterName}` | Area members |
| `rsis-gitnexus://repo/{name}/processes` | All execution flows |
| `rsis-gitnexus://repo/{name}/process/{processName}` | Step-by-step trace |
| `rsis-gitnexus://repo/{name}/schema` | Graph schema for Cypher |
| `rsis-gitnexus://repo/{name}/wisdom-ledger` | Inquiry-ceremony-artifact links |
| `rsis-gitnexus://repo/{name}/stewards-compass` | Directional teachings and patterns |
| `rsis-gitnexus://repo/{name}/kinship` | Full kinship graph |
| `rsis-gitnexus://repo/{name}/medicine-wheel-view` | Medicine Wheel UI data feed |

## Graph Schema

**Nodes:** File, Function, Class, Interface, Method, Community, Process
**RSIS Nodes:** Person, Inquiry, Sun, Ceremony, Direction, KinshipHub
**Edges (via CodeRelation.type):** CALLS, IMPORTS, EXTENDS, IMPLEMENTS, DEFINES, MEMBER_OF, STEP_IN_PROCESS
**RSIS Edges (via RSISRelation.type):** STEWARDS, BORN_FROM, SERVES, GIVES_BACK_TO, ALIGNED_WITH, KINSHIP_OF

```cypher
MATCH (caller)-[:CodeRelation {type: 'CALLS'}]->(f:Function {name: "myFunc"})
RETURN caller.name, caller.filePath
```

<!-- rsis-gitnexus:end -->
