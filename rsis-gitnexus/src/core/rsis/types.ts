/**
 * RSIS Relational Science Types
 *
 * Re-exports from medicine-wheel-ontology-core — single source of truth.
 * DO NOT define types inline. Import from the published package.
 */

export type {
  SunName,
  CeremonyPhase,
  DirectionName,
  GovernanceAccess,
  PersonRole,
  RSISRelationType,
  RSISConfig,
  GovernanceProtectedPath,
  GovernanceConfig,
  DirectionDistribution,
  DirectionDetail,
  DirectionInfo,
  ReciprocityFlow,
  ReciprocityBalance,
  CeremonyLineageEntry,
  KinshipHubInfo,
  KinshipRelation,
  MedicineWheelView,
  OcapFlags,
  AccountabilityTracking,
  RelationalNode,
  CeremonyLog,
  NarrativeBeat,
} from 'medicine-wheel-ontology-core';

export {
  DIRECTION_NAMES,
  SUN_NAMES,
  SUN_DESCRIPTIONS,
  CEREMONY_PHASES,
  CEREMONY_PHASE_DESCRIPTIONS,
  PERSON_ROLES,
  RSIS_RELATION_TYPES,
  GOVERNANCE_ACCESS_LEVELS,
  DIRECTION_INFO,
} from 'medicine-wheel-ontology-core';
