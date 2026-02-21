# medicine-wheel-narrative-engine

Narrative generation engine for Medicine Wheel — produces ceremony-phase-aware stories and observations.

## Purpose

Generates human-readable narratives from relational science data:

- **Provenance Narratives**: "This module was born in the Novel Emergence Sun during cycle X, refactored under Sustained Presence during cycle Y..."
- **Reciprocity Observations**: Framed as invitations for tending, never performance evaluations
- **Directional Observations**: "Recent work is concentrated in West (implementation). The ecosystem may benefit from a North (reflection) ceremony."
- **Ceremony Phase Framing**: Adjusts output tone based on Opening/Council/Integration/Closure phase

## Usage by RSIS-GitNexus

This package is consumed by:
- `rsis-gitnexus/src/mcp/tools.ts` — ceremony_provenance and reciprocity_view tool output
- `rsis-gitnexus/src/core/rsis/index.ts` — ceremony phase framing
- `medicine-wheel-ui-components` — narrative display components

## Desired API

```typescript
import {
  generateProvenanceNarrative,
  generateReciprocityObservation,
  generateDirectionObservation,
  getCeremonyPhaseFraming,
} from 'medicine-wheel-narrative-engine';
```
