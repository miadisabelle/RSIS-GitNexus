/**
 * medicine-wheel-ontology-core
 *
 * Core ontology types and schema definitions for the Medicine Wheel
 * relational science framework — Wilson's ontology, Thematic Suns,
 * Four Directions, Ceremony phases, and Kinship Hub protocol.
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

export const SUN_NAMES: SunName[] = [
  'NovelEmergence', 'CreativeActualization', 'WovenMeaning',
  'FirstCause', 'EmbodiedPractice', 'SustainedPresence',
];

export const SUN_DESCRIPTIONS: Record<SunName, string> = {
  NovelEmergence: 'Emergence of new knowledge and understanding',
  CreativeActualization: 'Creative manifestation and bringing ideas into form',
  WovenMeaning: 'Integration and meaning-making across knowledge domains',
  FirstCause: 'Root causes, origins, and foundational principles',
  EmbodiedPractice: 'Lived experience, embodiment, and practical application',
  SustainedPresence: 'Ongoing commitment, maintenance, and enduring engagement',
};

// ============================================================================
// CEREMONY PHASES
// ============================================================================

export type CeremonyPhase = 'opening' | 'council' | 'integration' | 'closure';

export const CEREMONY_PHASES: CeremonyPhase[] = ['opening', 'council', 'integration', 'closure'];

export const CEREMONY_PHASE_DESCRIPTIONS: Record<CeremonyPhase, string> = {
  opening: 'What wants to emerge? Focus on intention and vision.',
  council: 'Cross-Sun perspectives on code relationships.',
  integration: 'Weaving insights into synthesis artifacts.',
  closure: 'Reciprocity summaries and seeding observations.',
};

// ============================================================================
// FOUR DIRECTIONS
// ============================================================================

export type DirectionName = 'east' | 'south' | 'west' | 'north';

export const DIRECTION_NAMES: DirectionName[] = ['east', 'south', 'west', 'north'];

export interface DirectionInfo {
  name: DirectionName;
  emoji: string;
  focus: string;
  guidance: string;
}

export const DIRECTIONS: Record<DirectionName, DirectionInfo> = {
  east: { name: 'east', emoji: '🌸', focus: 'Vision, intention, emergence', guidance: 'What wants to emerge? What seeds are being planted?' },
  south: { name: 'south', emoji: '🧠', focus: 'Architecture, structure, planning', guidance: 'What structures support the vision? What patterns serve advancement?' },
  west: { name: 'west', emoji: '⚡', focus: 'Implementation, creation, manifestation', guidance: 'What is being built? How does creation serve the inquiries?' },
  north: { name: 'north', emoji: '🕸️', focus: 'Reflection, integration, wisdom', guidance: 'What has been learned? What reciprocity needs tending?' },
};

// ============================================================================
// GOVERNANCE ACCESS LEVELS
// ============================================================================

export type GovernanceAccess = 'open' | 'ceremony_required' | 'restricted' | 'sacred';

export const GOVERNANCE_ACCESS_LEVELS: GovernanceAccess[] = ['open', 'ceremony_required', 'restricted', 'sacred'];

// ============================================================================
// PERSON ROLES
// ============================================================================

export type PersonRole = 'steward' | 'contributor' | 'elder' | 'firekeeper';

export const PERSON_ROLES: PersonRole[] = ['steward', 'contributor', 'elder', 'firekeeper'];

// ============================================================================
// RSIS RELATIONAL EDGE TYPES
// ============================================================================

export type RSISRelationType =
  | 'STEWARDS'
  | 'BORN_FROM'
  | 'SERVES'
  | 'GIVES_BACK_TO'
  | 'ALIGNED_WITH'
  | 'KINSHIP_OF';

export const RSIS_RELATION_TYPES: RSISRelationType[] = [
  'STEWARDS', 'BORN_FROM', 'SERVES', 'GIVES_BACK_TO', 'ALIGNED_WITH', 'KINSHIP_OF',
];

// ============================================================================
// CONFIGURATION INTERFACES
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
// DIRECTION CLASSIFICATION RESULT
// ============================================================================

export interface DirectionDetail {
  name: string;
  direction: DirectionName;
  reason: string;
}

export interface DirectionDistribution {
  east: number;
  south: number;
  west: number;
  north: number;
}

// ============================================================================
// MEDICINE WHEEL VIEW (for UI)
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
