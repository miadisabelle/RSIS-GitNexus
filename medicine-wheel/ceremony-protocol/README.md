# medicine-wheel-ceremony-protocol

Ceremony lifecycle protocol for Medicine Wheel — manages ceremony state, phase transitions, and governance enforcement.

## Purpose

Provides the ceremony lifecycle management that RSIS-GitNexus tools need:

- **Ceremony State Management**: Track current ceremony cycle, host sun, and phase
- **Phase Transitions**: Opening → Council → Integration → Closure lifecycle
- **Governance Enforcement**: Read `.rsis/governance.json`, enforce protected paths, ceremony-required changes
- **Ceremonial Review Workflow**: Tools flag changes requiring ceremony, suggest appropriate reviews
- **Phase-Aware Output Framing**: Adjust tool output language based on ceremony phase

## Usage by RSIS-GitNexus

This package is consumed by:
- `rsis-gitnexus/src/core/rsis/governance.ts` — governance config reading and enforcement
- `rsis-gitnexus/src/core/rsis/index.ts` — ceremony phase framing
- `rsis-gitnexus/src/mcp/tools.ts` — ceremony_provenance, relational_context
- `rsis-gitnexus/src/mcp/server.ts` — governance warnings in tool output

## Desired API

```typescript
import {
  loadCeremonyState,
  transitionPhase,
  enforceGovernance,
  checkCeremonyRequired,
  getPhaseFraming,
  formatGovernanceWarning,
} from 'medicine-wheel-ceremony-protocol';
```
