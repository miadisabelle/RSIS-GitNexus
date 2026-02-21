# medicine-wheel-relational-query

Relational query interface for Medicine Wheel — queries code knowledge graphs through relational science lenses.

## Purpose

Provides query builders and result formatters for RSIS relational graph queries:

- **Relational Context Queries**: Extend code symbol context with ceremonies, inquiries, stewards, kinship
- **Reciprocity Queries**: Surface contribution flows and balance, framed as invitations for tending
- **Ceremony Provenance Queries**: Trace code artifacts back to ceremonial origins
- **Kinship Queries**: Traverse kinship hub relationships with boundary awareness
- **Direction Queries**: Classify and aggregate work by Four Directions alignment

## Usage by RSIS-GitNexus

This package is consumed by:
- `rsis-gitnexus/src/mcp/tools.ts` — RSIS MCP tool implementations
- `rsis-gitnexus/src/mcp/resources.ts` — RSIS resource reading
- `medicine-wheel-graph-viz` — visualization data preparation

## Desired API

```typescript
import {
  queryRelationalContext,
  queryReciprocity,
  queryCeremonyProvenance,
  queryKinshipMap,
  queryDirectionAlignment,
} from 'medicine-wheel-relational-query';
```
