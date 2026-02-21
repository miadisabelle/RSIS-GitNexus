# medicine-wheel-graph-viz

Graph visualization utilities for Medicine Wheel — transforms relational graph data into renderable formats.

## Purpose

Transforms RSIS relational graph data into visualization-ready formats:

- **Kinship Graph Layout**: Force-directed layout for kinship hub networks
- **Reciprocity Flow Diagram**: Sankey/flow diagram data for contribution flows
- **Direction Wheel Data**: Polar chart data for Four Directions distribution
- **Ceremony Timeline Data**: Timeline chart data for ceremony cycles and phases
- **Mermaid Export**: Generate Mermaid diagram syntax for relational graphs

## Usage by RSIS-GitNexus

This package is consumed by:
- `medicine-wheel-ui-components` — prepares data for React components
- `rsis-gitnexus-web/` — web visualization layer
- Export/documentation generation

## Desired API

```typescript
import {
  toKinshipGraphLayout,
  toReciprocityFlowDiagram,
  toDirectionWheelData,
  toCeremonyTimelineData,
  toMermaidDiagram,
} from 'medicine-wheel-graph-viz';
```
