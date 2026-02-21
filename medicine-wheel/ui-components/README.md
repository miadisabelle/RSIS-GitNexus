# medicine-wheel-ui-components

React UI components for Medicine Wheel visualization.

## Purpose

Visual components for the Medicine Wheel relational science interface:

- **MedicineWheelView**: Main wheel visualization showing Four Directions distribution
- **ThematicSunsDisplay**: Six Thematic Suns with inquiry counts and status
- **KinshipGraph**: Interactive kinship hub relationship graph
- **ReciprocityFlowChart**: Contribution flow visualization with balance indicators
- **DirectionBadge**: Direction-aligned badge component (East 🌸, South 🧠, West ⚡, North 🕸️)
- **CeremonyTimeline**: Ceremony cycle timeline with phase indicators

## Usage by RSIS-GitNexus

This package is consumed by:
- `rsis-gitnexus-web/` — web interface for RSIS-GitNexus
- Medicine Wheel UI dashboard

## Data Source

Components consume data from the `medicine-wheel-view` MCP resource:
```
rsis-gitnexus://repo/{name}/medicine-wheel-view
```

## Desired API

```tsx
import {
  MedicineWheelView,
  ThematicSunsDisplay,
  KinshipGraph,
  ReciprocityFlowChart,
  DirectionBadge,
  CeremonyTimeline,
} from 'medicine-wheel-ui-components';
```
