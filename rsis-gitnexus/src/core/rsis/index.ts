/**
 * RSIS Core Integration Module
 *
 * Config loading, kinship hub discovery, Four Directions commit classification,
 * and ceremony phase awareness for the Relational Science Inquiry System.
 */

import fs from 'fs/promises';
import path from 'path';
import type {
  RSISConfig,
  DirectionName,
  DirectionDetail,
  KinshipHubInfo,
  CeremonyPhase,
} from './types.js';

// ============================================================================
// CONFIG LOADING
// ============================================================================

/**
 * Load RSIS configuration from .rsis/config.json
 */
export async function loadRSISConfig(repoPath: string): Promise<RSISConfig | null> {
  const configPath = path.join(repoPath, '.rsis', 'config.json');
  try {
    const raw = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(raw) as RSISConfig;
  } catch {
    return null;
  }
}

/**
 * Check if RSIS mode is enabled for a repo
 */
export async function isRSISEnabled(repoPath: string): Promise<boolean> {
  const config = await loadRSISConfig(repoPath);
  return config?.enabled === true;
}

// ============================================================================
// FOUR DIRECTIONS COMMIT CLASSIFICATION
// ============================================================================

const EAST_PATTERNS = [/README/i, /\.md$/, /intention/i, /vision/i, /proposal/i];
const SOUTH_PATTERNS = [/schema/i, /types?\.(ts|js|py)/i, /config/i, /rispecs\//i, /architecture/i];
const WEST_PATTERNS = [/\.(ts|js|py|rs|go|java|c|cpp)$/, /test/i, /spec/i, /script/i];
const NORTH_PATTERNS = [/CHANGELOG/i, /KINSHIP/i, /reflection/i, /docs?\//i, /retrospective/i];

/**
 * Classify a commit message or file path into a Four Directions alignment.
 *
 * East 🌸 = vision, intention, README
 * South 🧠 = architecture, schema, types, config
 * West ⚡ = implementation, tests, scripts
 * North 🕸️ = reflection, docs, changelogs, kinship
 */
export function classifyDirection(
  commitMessage: string,
  changedFiles: string[]
): DirectionDetail {
  // Explicit tags override heuristics
  const tagMatch = commitMessage.match(/\[(east|south|west|north)\]/i);
  if (tagMatch) {
    const dir = tagMatch[1].toLowerCase() as DirectionName;
    return { name: commitMessage, direction: dir, reason: `Explicit [${dir}] tag` };
  }

  // Score each direction based on changed files
  const scores: Record<DirectionName, number> = { east: 0, south: 0, west: 0, north: 0 };

  for (const file of changedFiles) {
    if (EAST_PATTERNS.some((p) => p.test(file))) scores.east++;
    if (SOUTH_PATTERNS.some((p) => p.test(file))) scores.south++;
    if (WEST_PATTERNS.some((p) => p.test(file))) scores.west++;
    if (NORTH_PATTERNS.some((p) => p.test(file))) scores.north++;
  }

  const sorted = (Object.entries(scores) as [DirectionName, number][]).sort(
    (a, b) => b[1] - a[1]
  );
  const topDirection = sorted[0][0];
  const topScore = sorted[0][1];

  if (topScore === 0) {
    return { name: commitMessage, direction: 'west', reason: 'Default (no heuristic match)' };
  }

  return { name: commitMessage, direction: topDirection, reason: `Heuristic: ${topScore} file(s) matched ${topDirection} patterns` };
}

// ============================================================================
// KINSHIP HUB DISCOVERY
// ============================================================================

/**
 * Discover kinship hubs by scanning for KINSHIP.md files
 */
export async function discoverKinshipHubs(
  repoPath: string,
  kinshipPaths?: string[]
): Promise<KinshipHubInfo[]> {
  const hubs: KinshipHubInfo[] = [];
  const searchPaths = kinshipPaths || ['KINSHIP.md'];

  for (const searchPath of searchPaths) {
    const fullPath = path.join(repoPath, searchPath);
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const hub = parseKinshipFile(content, searchPath);
      if (hub) hubs.push(hub);
    } catch {
      // File not found — skip
    }
  }

  return hubs;
}

/**
 * Parse a KINSHIP.md file into a KinshipHubInfo
 */
function parseKinshipFile(content: string, filePath: string): KinshipHubInfo | null {
  const lines = content.split('\n');
  const hub: KinshipHubInfo = {
    path: filePath,
    identity: '',
    lineage: '',
    humanAccountabilities: [],
    moreThanHumanAccountabilities: [],
    boundaries: [],
  };

  let currentSection = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      hub.identity = trimmed.replace(/^#\s*/, '');
    } else if (trimmed.toLowerCase().includes('lineage')) {
      currentSection = 'lineage';
    } else if (trimmed.toLowerCase().includes('human accountabilit')) {
      currentSection = 'human';
    } else if (trimmed.toLowerCase().includes('more-than-human') || trimmed.toLowerCase().includes('more than human')) {
      currentSection = 'morethan';
    } else if (trimmed.toLowerCase().includes('boundar')) {
      currentSection = 'boundaries';
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const item = trimmed.replace(/^[-*]\s*/, '');
      switch (currentSection) {
        case 'human':
          hub.humanAccountabilities.push(item);
          break;
        case 'morethan':
          hub.moreThanHumanAccountabilities.push(item);
          break;
        case 'boundaries':
          hub.boundaries.push(item);
          break;
      }
    } else if (currentSection === 'lineage' && trimmed.length > 0) {
      hub.lineage += (hub.lineage ? ' ' : '') + trimmed;
    }
  }

  return hub.identity ? hub : null;
}

// ============================================================================
// CEREMONY PHASE FRAMING
// ============================================================================

/**
 * Get ceremony-phase-aware framing for tool output
 */
export function getCeremonyFraming(phase?: CeremonyPhase): string {
  switch (phase) {
    case 'opening':
      return 'Opening Phase — What wants to emerge? Focus on intention and vision.';
    case 'council':
      return 'Council Phase — Cross-Sun perspectives on code relationships.';
    case 'integration':
      return 'Integration Phase — Weaving insights into synthesis artifacts.';
    case 'closure':
      return 'Closure Phase — Reciprocity summaries and seeding observations.';
    default:
      return '';
  }
}
