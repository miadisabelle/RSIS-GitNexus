# Governance & Data Sovereignty

Uses `OcapFlags` from `medicine-wheel-ontology-core` — not a reinvented governance model.

## Desired Outcome

Protected paths in repos are governed by OCAP® metadata that rsis-gitnexus reads, enforces during indexing, and surfaces in tool responses. The same `OcapFlags` type flows through the graph, through MCP tool outputs, and into UI rendering via `<OcapBadge />`.

## OCAP® from ontology-core

Already defined in `medicine-wheel-ontology-core`:

```typescript
interface OcapFlags {
  ownership: string;
  control: string;
  access: 'community' | 'researchers' | 'public' | 'restricted';
  possession: 'on-premise' | 'community-server' | 'cloud-sovereign' | 'cloud-shared';
  compliant: boolean;
  steward?: string;
  consent_given?: boolean;
  consent_scope?: string;
}
```

Plus `checkOcapCompliance()` and `auditOcapCompliance()` helpers.

## `.rsis/governance.json`

```json
{
  "protected_paths": [
    {
      "path": "ceremonies/",
      "ocap": {
        "ownership": "community-council",
        "control": "firekeeper",
        "access": "restricted",
        "possession": "on-premise",
        "compliant": true,
        "steward": "elder-name"
      },
      "description": "Ceremonial protocols"
    }
  ],
  "index_exclusions": ["sacred-protocols/"],
  "ceremony_required_changes": [".rsis/*", "KINSHIP.md"]
}
```

## Behavior

- `index_exclusions`: Not parsed, not in graph, invisible to all tools
- `protected_paths`: Indexed but OcapFlags attached to File nodes. Tools check `access` before returning data. `restricted` paths excluded from general queries unless authority context provided.
- `ceremony_required_changes`: `detect_changes` tool flags these with governance warnings
- All governance checks use `checkOcapCompliance()` from ontology-core
- `<OcapBadge compliant={flags.compliant} />` renders in the UI automatically

## Validation

- `governance.json` validated via `OcapFlagsSchema` from ontology-core on load
- Invalid governance configs fail loudly at `rsis-gitnexus analyze` time, not silently at query time
