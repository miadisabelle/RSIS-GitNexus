/**
 * medicine-wheel-ui-components
 *
 * React component type definitions and helpers for Medicine Wheel visualization.
 * Component implementations should use these interfaces.
 */

import type {
  DirectionName,
  DirectionDistribution,
  SunName,
  KinshipHubInfo,
  KinshipRelation,
  ReciprocityFlow,
  ReciprocityBalance,
  MedicineWheelView,
  CeremonyPhase,
} from 'medicine-wheel-ontology-core';

// ============================================================================
// COMPONENT PROP INTERFACES
// ============================================================================

export interface MedicineWheelViewProps {
  data: MedicineWheelView;
  onDirectionClick?: (direction: DirectionName) => void;
  onSunClick?: (sun: SunName) => void;
}

export interface ThematicSunsDisplayProps {
  suns: Array<{ name: SunName; inquiryCount: number }>;
  activeSun?: SunName;
  onSunSelect?: (sun: SunName) => void;
}

export interface KinshipGraphProps {
  hubs: KinshipHubInfo[];
  relations: KinshipRelation[];
  selectedHub?: string;
  onHubSelect?: (hubPath: string) => void;
}

export interface ReciprocityFlowChartProps {
  flows: ReciprocityFlow[];
  balance: ReciprocityBalance[];
  scope?: 'person' | 'community' | 'kinship_hub';
}

export interface DirectionBadgeProps {
  direction: DirectionName;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export interface CeremonyTimelineProps {
  ceremonies: Array<{
    id: string;
    name: string;
    sun: string;
    cycle: string;
    phase: CeremonyPhase;
    startDate?: string;
    endDate?: string;
  }>;
  activeCeremony?: string;
  onCeremonySelect?: (id: string) => void;
}

// ============================================================================
// DIRECTION DISPLAY HELPERS
// ============================================================================

const DIRECTION_COLORS: Record<DirectionName, string> = {
  east: '#f472b6',  // pink
  south: '#60a5fa',  // blue
  west: '#fbbf24',  // amber
  north: '#a78bfa',  // purple
};

const DIRECTION_EMOJIS: Record<DirectionName, string> = {
  east: '🌸', south: '🧠', west: '⚡', north: '🕸️',
};

const DIRECTION_LABELS: Record<DirectionName, string> = {
  east: 'Vision', south: 'Architecture', west: 'Implementation', north: 'Reflection',
};

/**
 * Get display properties for a direction
 */
export function getDirectionDisplay(direction: DirectionName) {
  return {
    color: DIRECTION_COLORS[direction],
    emoji: DIRECTION_EMOJIS[direction],
    label: DIRECTION_LABELS[direction],
  };
}

// ============================================================================
// SUN DISPLAY HELPERS
// ============================================================================

const SUN_COLORS: Record<SunName, string> = {
  NovelEmergence: '#34d399',
  CreativeActualization: '#f472b6',
  WovenMeaning: '#818cf8',
  FirstCause: '#fb923c',
  EmbodiedPractice: '#22d3ee',
  SustainedPresence: '#a3e635',
};

/**
 * Get display properties for a Thematic Sun
 */
export function getSunDisplay(sun: SunName) {
  return {
    color: SUN_COLORS[sun],
    name: sun.replace(/([A-Z])/g, ' $1').trim(), // CamelCase → spaced
  };
}

// ============================================================================
// MEDICINE WHEEL VIEW HELPERS
// ============================================================================

/**
 * Calculate total activity from a MedicineWheelView
 */
export function calculateTotalActivity(view: MedicineWheelView): number {
  return view.directions.east.count + view.directions.south.count +
    view.directions.west.count + view.directions.north.count;
}

/**
 * Get dominant direction from a MedicineWheelView
 */
export function getDominantDirection(view: MedicineWheelView): DirectionName {
  const dirs: [DirectionName, number][] = [
    ['east', view.directions.east.count],
    ['south', view.directions.south.count],
    ['west', view.directions.west.count],
    ['north', view.directions.north.count],
  ];
  dirs.sort((a, b) => b[1] - a[1]);
  return dirs[0][0];
}
