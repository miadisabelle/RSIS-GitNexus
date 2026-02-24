/**
 * RSIS Governance — Indigenous Data Sovereignty
 *
 * Re-exports governance functions from medicine-wheel-ceremony-protocol.
 * Adds loadGovernanceConfig for reading .rsis/governance.json from disk.
 */

import fs from 'fs/promises';
import path from 'path';
import type { GovernanceConfig, GovernanceProtectedPath, GovernanceAccess } from './types.js';

// Re-export governance functions from the published package
export {
  checkGovernance,
  isIndexExcluded,
  checkCeremonyRequired,
  getAccessLevel,
  formatGovernanceWarning,
  loadCeremonyState,
  nextPhase,
  getPhaseFraming,
} from 'medicine-wheel-ceremony-protocol';

export type { CeremonyState } from 'medicine-wheel-ceremony-protocol';

/**
 * Load governance configuration from .rsis/governance.json
 */
export async function loadGovernanceConfig(repoPath: string): Promise<GovernanceConfig | null> {
  const configPath = path.join(repoPath, '.rsis', 'governance.json');
  try {
    const raw = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(raw) as GovernanceConfig;
  } catch {
    return null;
  }
}

/**
 * Check if changes to a file require ceremonial review
 * (kept for backward compat with local-backend.ts import)
 */
export { checkCeremonyRequired as requiresCeremony } from 'medicine-wheel-ceremony-protocol';
