# medicine-wheel-ontology-core

Core ontology types and schema definitions for the Medicine Wheel relational science framework.

## Purpose

Provides the foundational type system grounded in Wilson's relational ontology and the Ceremonial Inquiry Ecosystem:

- **Thematic Suns**: NovelEmergence, CreativeActualization, WovenMeaning, FirstCause, EmbodiedPractice, SustainedPresence
- **Four Directions**: East (vision), South (architecture), West (implementation), North (reflection)
- **Ceremony Phases**: Opening, Council, Integration, Closure
- **Person Roles**: Steward, Contributor, Elder, Firekeeper
- **Kinship Hub Protocol**: Identity, lineage, accountabilities, boundaries
- **Governance Access Levels**: Open, Ceremony Required, Restricted, Sacred

## Usage by RSIS-GitNexus

This package provides the canonical type definitions consumed by:
- `rsis-gitnexus/src/core/rsis/types.ts` — graph entity types
- `rsis-gitnexus/src/core/kuzu/schema.ts` — KuzuDB node/edge schemas
- `medicine-wheel-relational-query` — query result typing
- `medicine-wheel-narrative-engine` — ceremony lineage typing

## Desired API

```typescript
import {
  SunName, DirectionName, CeremonyPhase, PersonRole,
  GovernanceAccess, KinshipHubInfo, RSISConfig,
} from 'medicine-wheel-ontology-core';
```
