/**
 * RSIS Governance — Indigenous Data Sovereignty
 *
 * Reads and enforces governance boundaries from .rsis/governance.json,
 * grounded in Kaupapa Māori principles and Wilson's relational accountability.
 */

import fs from 'fs/promises';
import path from 'path';
import type { GovernanceConfig, GovernanceProtectedPath, GovernanceAccess } from './types.js';

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
 * Check if a file path falls under governance protection
 */
export function checkGovernance(
  filePath: string,
  config: GovernanceConfig
): GovernanceProtectedPath | null {
  if (!config.protected_paths) return null;

  for (const rule of config.protected_paths) {
    if (filePath.startsWith(rule.path) || filePath === rule.path) {
      return rule;
    }
  }
  return null;
}

/**
 * Check if a file path should be excluded from indexing
 */
export function isIndexExcluded(filePath: string, config: GovernanceConfig): boolean {
  if (!config.index_exclusions) return false;
  return config.index_exclusions.some(
    (exclusion) => filePath.startsWith(exclusion) || filePath === exclusion
  );
}

/**
 * Check if changes to a file require ceremonial review
 */
export function requiresCeremony(filePath: string, config: GovernanceConfig): boolean {
  if (!config.ceremony_required_changes) return false;
  return config.ceremony_required_changes.some((pattern) => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(filePath);
    }
    return filePath.startsWith(pattern) || filePath === pattern;
  });
}

/**
 * Format a governance warning for tool output
 */
export function formatGovernanceWarning(rule: GovernanceProtectedPath): string {
  const authority = rule.authority.join(', ');
  return `⚠️ GOVERNANCE: Changes to [${rule.path}] require [${authority}] approval. Access level: ${rule.access}`;
}

/**
 * Get governance access level for a path
 */
export function getAccessLevel(
  filePath: string,
  config: GovernanceConfig
): GovernanceAccess {
  const rule = checkGovernance(filePath, config);
  if (rule) return rule.access;
  if (requiresCeremony(filePath, config)) return 'ceremony_required';
  return 'open';
}
