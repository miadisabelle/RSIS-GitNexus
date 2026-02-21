# Governance & Data Sovereignty

Indigenous data sovereignty and governance metadata layer for RSIS-GitNexus, grounded in Kaupapa Māori principles and Wilson's relational accountability framework.

## Desired Outcome

Repository stewards create governance boundaries that RSIS-GitNexus reads and enforces — ensuring Indigenous knowledge, ceremonial protocols, and community-controlled data spaces are protected by the tool itself, not just by social convention.

## Current Reality

- GitNexus treats all code equally — no concept of protected paths, governance authority, or ceremonial access requirements
- Kaupapa Māori demands iwi/hapū/whānau governance over Indigenous knowledge
- Wilson's framework requires relational accountability: who has authority, who benefits, who is responsible
- The existing `.gitignore` pattern handles file exclusion but not relational governance

## Governance Metadata

### `.rsis/governance.json`

Per-repository governance configuration specifying protected paths, authority, and ceremonial requirements.

```json
{
  "protected_paths": [
    {
      "path": "ceremonies/",
      "authority": ["firekeeper-name"],
      "access": "ceremony_required",
      "description": "Ceremonial protocol scripts — changes require firekeeper approval and ceremony"
    },
    {
      "path": "indigenous-knowledge/",
      "authority": ["community-council"],
      "access": "restricted",
      "description": "Community-controlled knowledge — governed by iwi/hapū/whānau rules"
    }
  ],
  "ceremony_required_changes": [
    "rispecs/*.spec.md",
    ".rsis/governance.json"
  ],
  "index_exclusions": [
    "sacred-protocols/"
  ]
}
```

### Behavior

**During Indexing**:
- Paths listed in `index_exclusions` are not parsed, not stored in the graph, not queryable
- Protected paths are indexed but tagged with governance metadata on their File nodes

**During Tool Queries**:
- `impact` and `detect_changes` tools flag when changes touch protected paths
- Flag format: `⚠️ GOVERNANCE: Changes to [path] require [authority] approval. Access level: [access]`
- `relational_context` includes governance boundaries in its kinship section

**During `rename` Operations**:
- If a rename touches protected paths, the tool returns a warning and requires explicit `--governance-acknowledged` flag
- The tool does NOT silently proceed

## Access Levels

| Level | Meaning | Tool Behavior |
|-------|---------|---------------|
| `open` | Standard code, no special governance | Normal GitNexus behavior |
| `ceremony_required` | Changes must pass through ceremonial review | Tools flag changes, suggest ceremony |
| `restricted` | Community-governed, access by authority only | Tools exclude from general queries unless authority context provided |
| `sacred` | Not indexed, not queryable | Completely invisible to the tool |

## Per-Community Configuration

**Behavior**: RSIS-GitNexus supports multiple governance policies within one repository via path-scoped rules. Different directories can have different authority structures and access levels.

This enables a single repo to contain:
- Open-source tooling code (open access)
- Community ceremony scripts (ceremony_required)
- Indigenous knowledge datasets (restricted)
- Sacred protocols (sacred — excluded from indexing)

## Implementation Notes

- Governance config read during indexing pipeline, before graph population
- Protected path flags stored as properties on File nodes in KuzuDB
- Tool output layer checks governance flags and injects warnings
- No governance bypass mechanism exists — if governance says excluded, the tool cannot see it
- Governance file itself is `ceremony_required` by default — changing governance requires ceremony
