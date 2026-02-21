/**
 * RSIS Relational Science Types
 *
 * Type definitions for relational science entities grounded in Wilson's
 * relational ontology and the Ceremonial Inquiry Ecosystem.
 */

// ============================================================================
// THEMATIC SUNS
// ============================================================================

export type SunName =
  | 'NovelEmergence'
  | 'CreativeActualization'
  | 'WovenMeaning'
  | 'FirstCause'
  | 'EmbodiedPractice'
  | 'SustainedPresence';

// ============================================================================
// CEREMONY PHASES
// ============================================================================

export type CeremonyPhase = 'opening' | 'council' | 'integration' | 'closure';

// ============================================================================
// FOUR DIRECTIONS
// ============================================================================

export type DirectionName = 'east' | 'south' | 'west' | 'north';

// ============================================================================
// GOVERNANCE ACCESS LEVELS
// ============================================================================

export type GovernanceAccess = 'open' | 'ceremony_required' | 'restricted' | 'sacred';

// ============================================================================
// PERSON ROLES
// ============================================================================

export type PersonRole = 'steward' | 'contributor' | 'elder' | 'firekeeper';

// ============================================================================
// RSIS CONFIGURATION
// ============================================================================

export interface RSISConfig {
  enabled: boolean;
  charts?: string[];
  kinship_paths?: string[];
  ceremony?: {
    current_cycle?: string;
    host_sun?: SunName;
    phase?: CeremonyPhase;
  };
  directions?: {
    auto_classify_commits?: boolean;
    heuristics?: 'default' | string;
  };
  governance?: GovernanceConfig;
}

// ============================================================================
// GOVERNANCE CONFIGURATION
// ============================================================================

export interface GovernanceProtectedPath {
  path: string;
  authority: string[];
  access: GovernanceAccess;
  description?: string;
}

export interface GovernanceConfig {
  protected_paths?: GovernanceProtectedPath[];
  ceremony_required_changes?: string[];
  index_exclusions?: string[];
}

// ============================================================================
// DIRECTION CLASSIFICATION
// ============================================================================

export interface DirectionDistribution {
  east: number;
  south: number;
  west: number;
  north: number;
}

export interface DirectionDetail {
  name: string;
  direction: DirectionName;
  reason: string;
}

// ============================================================================
// RECIPROCITY
// ============================================================================

export interface ReciprocityFlow {
  from: string;
  to: string;
  type: string;
  count: number;
}

export interface ReciprocityBalance {
  entity: string;
  giving: number;
  receiving: number;
}

// ============================================================================
// CEREMONY LINEAGE
// ============================================================================

export interface CeremonyLineageEntry {
  ceremonyId: string;
  ceremonyName: string;
  sun: string;
  cycle: string;
  phase: CeremonyPhase;
  stewards: string[];
}

// ============================================================================
// KINSHIP HUB
// ============================================================================

export interface KinshipHubInfo {
  path: string;
  identity: string;
  lineage: string;
  humanAccountabilities: string[];
  moreThanHumanAccountabilities: string[];
  boundaries: string[];
}

export interface KinshipRelation {
  from: string;
  to: string;
  type: string;
}

// ============================================================================
// MEDICINE WHEEL VIEW
// ============================================================================

export interface MedicineWheelView {
  suns: Array<{ name: SunName; inquiryCount: number }>;
  directions: Record<DirectionName, { count: number; recent: string[] }>;
  reciprocity: {
    flows: ReciprocityFlow[];
    balance: ReciprocityBalance[];
  };
  kinship: {
    hubs: KinshipHubInfo[];
    relations: KinshipRelation[];
  };
}
