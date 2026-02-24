# MIA

```
.gitignore                                                 |   1 +
 .rsis/config.json                                          |  34 +++
 .rsis/governance.json                                      |  22 ++
 AGENTS.md                                                  |  11 +
 CLAUDE.md                                                  |  11 +
 HARDWARE_REQUIREMENT.md                                    |  39 +++
 rispecs/app.spec.md                                        |  95 +++---
 rispecs/ceremonial-tools.spec.md                           | 124 +++-----
 rispecs/dependency-contracts.spec.md                       | 131 +++++++++
 rispecs/ecosystem-integration.spec.md                      | 152 +++-------
 rispecs/governance-sovereignty.spec.md                     | 102 +++----
 rispecs/medicine-wheel-packages.spec.md                    |  59 +++-
 rispecs/ontology-gaps.md                                   |  55 ++++
 rispecs/relational-schema.spec.md                          |  83 ++----
 .../.claude/skills/rsis-gitnexus/debugging/SKILL.md        |  85 ++++++
 .../.claude/skills/rsis-gitnexus/exploring/SKILL.md        |  75 +++++
 .../.claude/skills/rsis-gitnexus/impact-analysis/SKILL.md  |  94 ++++++
 .../.claude/skills/rsis-gitnexus/refactoring/SKILL.md      | 113 ++++++++
 rsis-gitnexus/.gitignore                                   |   1 +
 rsis-gitnexus/AGENTS.md                                    |  62 ++++
 rsis-gitnexus/CLAUDE.md                                    |  62 ++++
 rsis-gitnexus/package-lock.json                            |  97 ++++++-
 rsis-gitnexus/package.json                                 |   5 +
 rsis-gitnexus/src/cli/analyze.ts                           |   6 +-
 rsis-gitnexus/src/cli/setup.ts                             |   4 +-
 rsis-gitnexus/src/core/embeddings/embedder.ts              | 183 +++++++-----
 rsis-gitnexus/src/core/embeddings/embedding-pipeline.ts    |   4 +-
 rsis-gitnexus/src/core/embeddings/ollama-embedder.ts       | 111 +++++++
 rsis-gitnexus/src/core/embeddings/types.ts                 |  27 +-
 rsis-gitnexus/src/core/graph/types.ts                      |  46 ++-
 rsis-gitnexus/src/core/kuzu/kuzu-adapter.ts                |   6 +-
 rsis-gitnexus/src/core/kuzu/schema.ts                      | 140 ++++++++-
 rsis-gitnexus/src/core/rsis/governance.ts                  |  43 +++
 rsis-gitnexus/src/core/rsis/index.ts                       | 190 ++++++++++++
 rsis-gitnexus/src/core/rsis/types.ts                       |  44 +++
 rsis-gitnexus/src/mcp/core/embedder.ts                     | 121 +++++---
 rsis-gitnexus/src/mcp/local/local-backend.ts               | 386 +++++++++++++++++++++++++
 rsis-gitnexus/src/mcp/resources.ts                         | 308 +++++++++++++++++++-
 rsis-gitnexus/src/mcp/server.ts                            |  16 +
 rsis-gitnexus/src/mcp/tools.ts                             | 131 ++++++++-

```

* Done in PR #4
* * Could be useful to know what happened in this first wave....

