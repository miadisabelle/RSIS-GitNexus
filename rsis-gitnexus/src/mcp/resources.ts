/**
 * MCP Resources (Multi-Repo)
 * 
 * Provides structured on-demand data to AI agents.
 * All resources use repo-scoped URIs: rsis-gitnexus://repo/{name}/context
 */

import type { LocalBackend } from './local/local-backend.js';
import { checkStaleness } from './staleness.js';

export interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface ResourceTemplate {
  uriTemplate: string;
  name: string;
  description: string;
  mimeType: string;
}

/**
 * Static resources — includes per-repo resources and the global repos list
 */
export function getResourceDefinitions(): ResourceDefinition[] {
  return [
    {
      uri: 'rsis-gitnexus://repos',
      name: 'All Indexed Repositories',
      description: 'List of all indexed repos with stats. Read this first to discover available repos.',
      mimeType: 'text/yaml',
    },
    {
      uri: 'rsis-gitnexus://setup',
      name: 'GitNexus Setup Content',
      description: 'Returns AGENTS.md content for all indexed repos. Useful for setup/onboarding.',
      mimeType: 'text/markdown',
    },
  ];
}

/**
 * Dynamic resource templates
 */
export function getResourceTemplates(): ResourceTemplate[] {
  return [
    {
      uriTemplate: 'rsis-gitnexus://repo/{name}/context',
      name: 'Repo Overview',
      description: 'Codebase stats, staleness check, and available tools',
      mimeType: 'text/yaml',
    },
    {
      uriTemplate: 'rsis-gitnexus://repo/{name}/clusters',
      name: 'Repo Modules',
      description: 'All functional areas (Leiden clusters)',
      mimeType: 'text/yaml',
    },
    {
      uriTemplate: 'rsis-gitnexus://repo/{name}/processes',
      name: 'Repo Processes',
      description: 'All execution flows',
      mimeType: 'text/yaml',
    },
    {
      uriTemplate: 'rsis-gitnexus://repo/{name}/schema',
      name: 'Graph Schema',
      description: 'Node/edge schema for Cypher queries',
      mimeType: 'text/yaml',
    },
    {
      uriTemplate: 'rsis-gitnexus://repo/{name}/cluster/{clusterName}',
      name: 'Module Detail',
      description: 'Deep dive into a specific functional area',
      mimeType: 'text/yaml',
    },
    {
      uriTemplate: 'rsis-gitnexus://repo/{name}/process/{processName}',
      name: 'Process Trace',
      description: 'Step-by-step execution trace',
      mimeType: 'text/yaml',
    },
    // RSIS relational science resources
    {
      uriTemplate: 'rsis-gitnexus://repo/{name}/wisdom-ledger',
      name: 'Wisdom Ledger',
      description: 'Links inquiries, ceremonies, code artifacts, and integrated artifacts across time',
      mimeType: 'text/yaml',
    },
    {
      uriTemplate: 'rsis-gitnexus://repo/{name}/stewards-compass',
      name: "Steward's Compass",
      description: 'Accumulated directional teachings, cautionary patterns, and onboarding narrative',
      mimeType: 'text/yaml',
    },
    {
      uriTemplate: 'rsis-gitnexus://repo/{name}/kinship',
      name: 'Kinship Graph',
      description: 'Full kinship graph for the repository — hubs, relations, and boundaries',
      mimeType: 'text/yaml',
    },
    {
      uriTemplate: 'rsis-gitnexus://repo/{name}/medicine-wheel-view',
      name: 'Medicine Wheel View',
      description: 'Suns, Directions, reciprocity, and kinship for Medicine Wheel UI visualization',
      mimeType: 'application/json',
    },
  ];
}

/**
 * Parse a resource URI to extract the repo name and resource type.
 */
function parseUri(uri: string): { repoName?: string; resourceType: string; param?: string } {
  if (uri === 'rsis-gitnexus://repos') return { resourceType: 'repos' };
  if (uri === 'rsis-gitnexus://setup') return { resourceType: 'setup' };

  // Repo-scoped: rsis-gitnexus://repo/{name}/context
  const repoMatch = uri.match(/^rsis-gitnexus:\/\/repo\/([^/]+)\/(.+)$/);
  if (repoMatch) {
    const repoName = decodeURIComponent(repoMatch[1]);
    const rest = repoMatch[2];

    if (rest.startsWith('cluster/')) {
      return { repoName, resourceType: 'cluster', param: decodeURIComponent(rest.replace('cluster/', '')) };
    }
    if (rest.startsWith('process/')) {
      return { repoName, resourceType: 'process', param: decodeURIComponent(rest.replace('process/', '')) };
    }

    return { repoName, resourceType: rest };
  }

  // RSIS resource URIs: rsis://repo/{name}/...
  const rsisMatch = uri.match(/^rsis:\/\/repo\/([^/]+)\/(.+)$/);
  if (rsisMatch) {
    const repoName = decodeURIComponent(rsisMatch[1]);
    const rest = rsisMatch[2];
    return { repoName, resourceType: rest };
  }

  throw new Error(`Unknown resource URI: ${uri}`);
}

/**
 * Read a resource and return its content
 */
export async function readResource(uri: string, backend: LocalBackend): Promise<string> {
  const parsed = parseUri(uri);

  // Global repos list — no repo context needed
  if (parsed.resourceType === 'repos') {
    return getReposResource(backend);
  }
  
  // Setup resource — returns AGENTS.md content for all repos
  if (parsed.resourceType === 'setup') {
    return getSetupResource(backend);
  }

  const repoName = parsed.repoName;

  switch (parsed.resourceType) {
    case 'context':
      return getContextResource(backend, repoName);
    case 'clusters':
      return getClustersResource(backend, repoName);
    case 'processes':
      return getProcessesResource(backend, repoName);
    case 'schema':
      return getSchemaResource();
    case 'cluster':
      return getClusterDetailResource(parsed.param!, backend, repoName);
    case 'process':
      return getProcessDetailResource(parsed.param!, backend, repoName);
    // RSIS relational science resources
    case 'wisdom-ledger':
      return getWisdomLedgerResource(backend, repoName);
    case 'stewards-compass':
      return getStewardsCompassResource(backend, repoName);
    case 'kinship':
      return getKinshipResource(backend, repoName);
    case 'medicine-wheel-view':
      return getMedicineWheelViewResource(backend, repoName);
    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
}

// ─── Resource Implementations ─────────────────────────────────────────

/**
 * Repos resource — list all indexed repositories
 */
async function getReposResource(backend: LocalBackend): Promise<string> {
  const repos = await backend.listRepos();

  if (repos.length === 0) {
    return 'repos: []\n# No repositories indexed. Run: rsis-gitnexus analyze';
  }

  const lines: string[] = ['repos:'];
  for (const repo of repos) {
    lines.push(`  - name: "${repo.name}"`);
    lines.push(`    path: "${repo.path}"`);
    lines.push(`    indexed: "${repo.indexedAt}"`);
    lines.push(`    commit: "${repo.lastCommit?.slice(0, 7) || 'unknown'}"`);
    if (repo.stats) {
      lines.push(`    files: ${repo.stats.files || 0}`);
      lines.push(`    symbols: ${repo.stats.nodes || 0}`);
      lines.push(`    processes: ${repo.stats.processes || 0}`);
    }
  }

  if (repos.length > 1) {
    lines.push('');
    lines.push('# Multiple repos indexed. Use repo parameter in tool calls:');
    lines.push(`# rsis-gitnexus_search({query: "auth", repo: "${repos[0].name}"})`);
  }

  return lines.join('\n');
}

/**
 * Context resource — codebase overview for a specific repo
 */
async function getContextResource(backend: LocalBackend, repoName?: string): Promise<string> {
  // Resolve repo
  const repo = await backend.resolveRepo(repoName);
  const repoId = repo.name.toLowerCase();
  const context = backend.getContext(repoId) || backend.getContext();

  if (!context) {
    return 'error: No codebase loaded. Run: rsis-gitnexus analyze';
  }
  
  // Check staleness
  const repoPath = repo.repoPath;
  const lastCommit = repo.lastCommit || 'HEAD';
  const staleness = repoPath ? checkStaleness(repoPath, lastCommit) : { isStale: false, commitsBehind: 0 };
  
  const lines: string[] = [
    `project: ${context.projectName}`,
  ];
  
  if (staleness.isStale && staleness.hint) {
    lines.push('');
    lines.push(`staleness: "${staleness.hint}"`);
  }
  
  lines.push('');
  lines.push('stats:');
  lines.push(`  files: ${context.stats.fileCount}`);
  lines.push(`  symbols: ${context.stats.functionCount}`);
  lines.push(`  processes: ${context.stats.processCount}`);
  lines.push('');
  lines.push('tools_available:');
  lines.push('  - query: Process-grouped code intelligence (execution flows related to a concept)');
  lines.push('  - context: 360-degree symbol view (categorized refs, process participation)');
  lines.push('  - impact: Blast radius analysis (what breaks if you change a symbol)');
  lines.push('  - detect_changes: Git-diff impact analysis (what do your changes affect)');
  lines.push('  - rename: Multi-file coordinated rename with confidence tags');
  lines.push('  - cypher: Raw graph queries');
  lines.push('  - list_repos: Discover all indexed repositories');
  lines.push('  # RSIS relational science tools');
  lines.push('  - relational_context: 360-degree relational view (ceremonies, inquiries, stewards, kinship)');
  lines.push('  - reciprocity_view: Reciprocity patterns and balance across the codebase');
  lines.push('  - ceremony_provenance: Trace code artifacts back to ceremonial origins');
  lines.push('  - kinship_map: Kinship relationships between directories and repos');
  lines.push('  - direction_alignment: Four Directions analysis of recent changes');
  lines.push('');
  lines.push('re_index: Run `npx rsis-gitnexus analyze` in terminal if data is stale');
  lines.push('');
  lines.push('resources_available:');
  lines.push('  - rsis-gitnexus://repos: All indexed repositories');
  lines.push(`  - rsis-gitnexus://repo/${context.projectName}/clusters: All functional areas`);
  lines.push(`  - rsis-gitnexus://repo/${context.projectName}/processes: All execution flows`);
  lines.push(`  - rsis-gitnexus://repo/${context.projectName}/cluster/{name}: Module details`);
  lines.push(`  - rsis-gitnexus://repo/${context.projectName}/process/{name}: Process trace`);
  lines.push('  # RSIS relational science resources');
  lines.push(`  - rsis-gitnexus://repo/${context.projectName}/wisdom-ledger: Inquiry-ceremony-artifact links`);
  lines.push(`  - rsis-gitnexus://repo/${context.projectName}/stewards-compass: Directional teachings and patterns`);
  lines.push(`  - rsis-gitnexus://repo/${context.projectName}/kinship: Full kinship graph`);
  lines.push(`  - rsis-gitnexus://repo/${context.projectName}/medicine-wheel-view: Medicine Wheel UI data feed`);
  
  return lines.join('\n');
}

/**
 * Clusters resource — queries graph directly via backend.queryClusters()
 */
async function getClustersResource(backend: LocalBackend, repoName?: string): Promise<string> {
  try {
    const result = await backend.queryClusters(repoName, 100);

    if (!result.clusters || result.clusters.length === 0) {
      return 'modules: []\n# No functional areas detected. Run: rsis-gitnexus analyze';
    }

    const displayLimit = 20;
    const lines: string[] = ['modules:'];
    const toShow = result.clusters.slice(0, displayLimit);

    for (const cluster of toShow) {
      const label = cluster.heuristicLabel || cluster.label || cluster.id;
      lines.push(`  - name: "${label}"`);
      lines.push(`    symbols: ${cluster.symbolCount || 0}`);
      if (cluster.cohesion) {
        lines.push(`    cohesion: ${(cluster.cohesion * 100).toFixed(0)}%`);
      }
    }

    if (result.clusters.length > displayLimit) {
      lines.push(`\n# Showing top ${displayLimit} of ${result.clusters.length} modules. Use rsis-gitnexus_query for deeper search.`);
    }

    return lines.join('\n');
  } catch (err: any) {
    return `error: ${err.message}`;
  }
}

/**
 * Processes resource — queries graph directly via backend.queryProcesses()
 */
async function getProcessesResource(backend: LocalBackend, repoName?: string): Promise<string> {
  try {
    const result = await backend.queryProcesses(repoName, 50);

    if (!result.processes || result.processes.length === 0) {
      return 'processes: []\n# No processes detected. Run: rsis-gitnexus analyze';
    }

    const displayLimit = 20;
    const lines: string[] = ['processes:'];
    const toShow = result.processes.slice(0, displayLimit);

    for (const proc of toShow) {
      const label = proc.heuristicLabel || proc.label || proc.id;
      lines.push(`  - name: "${label}"`);
      lines.push(`    type: ${proc.processType || 'unknown'}`);
      lines.push(`    steps: ${proc.stepCount || 0}`);
    }

    if (result.processes.length > displayLimit) {
      lines.push(`\n# Showing top ${displayLimit} of ${result.processes.length} processes. Use rsis-gitnexus_query for deeper search.`);
    }

    return lines.join('\n');
  } catch (err: any) {
    return `error: ${err.message}`;
  }
}

/**
 * Schema resource — graph structure for Cypher queries
 */
function getSchemaResource(): string {
  return `# GitNexus Graph Schema

nodes:
  - File: Source code files
  - Folder: Directory containers
  - Function: Functions and arrow functions
  - Class: Class definitions
  - Interface: Interface/type definitions
  - Method: Class methods
  - CodeElement: Catch-all for other code elements
  - Community: Auto-detected functional area (Leiden algorithm)
  - Process: Execution flow trace

additional_node_types: "Multi-language: Struct, Enum, Macro, Typedef, Union, Namespace, Trait, Impl, TypeAlias, Const, Static, Property, Record, Delegate, Annotation, Constructor, Template, Module (use backticks in queries: \`Struct\`, \`Enum\`, etc.)"

rsis_nodes:
  - Person: Human contributor with relational identity (steward, contributor, elder, firekeeper)
  - Inquiry: Living question being explored across the ecosystem
  - Sun: One of six Thematic Suns (NovelEmergence, CreativeActualization, WovenMeaning, FirstCause, EmbodiedPractice, SustainedPresence)
  - Ceremony: Bounded ceremonial cycle with four phases (Opening, Council, Integration, Closure)
  - Direction: One of the Four Directions (East/South/West/North)
  - KinshipHub: Directory or repository treated as a relational accountability node

relationships:
  - CONTAINS: File/Folder contains child
  - DEFINES: File defines a symbol
  - CALLS: Function/method invocation
  - IMPORTS: Module imports
  - EXTENDS: Class inheritance
  - IMPLEMENTS: Interface implementation
  - MEMBER_OF: Symbol belongs to community
  - STEP_IN_PROCESS: Symbol is step N in process

rsis_relationships:
  - STEWARDS: Person → File/KinshipHub (who holds authority over code/knowledge)
  - BORN_FROM: File/Function/Class → Inquiry/Ceremony (provenance)
  - SERVES: File/Function/Class → Inquiry/Sun (what does this code serve?)
  - GIVES_BACK_TO: Person → Community/KinshipHub (reciprocity tracking)
  - ALIGNED_WITH: File → Direction (directional alignment)
  - KINSHIP_OF: KinshipHub → KinshipHub (relational links between hubs)

relationship_table: "Code relationships use CodeRelation table. RSIS relationships use RSISRelation table. Both have properties: type (STRING), confidence (DOUBLE), reason (STRING), step (INT32)"

example_queries:
  find_callers: |
    MATCH (caller)-[:CodeRelation {type: 'CALLS'}]->(f:Function {name: "myFunc"})
    RETURN caller.name, caller.filePath
  
  find_community_members: |
    MATCH (s)-[:CodeRelation {type: 'MEMBER_OF'}]->(c:Community)
    WHERE c.heuristicLabel = "Auth"
    RETURN s.name, labels(s)[0] AS type
  
  trace_process: |
    MATCH (s)-[r:CodeRelation {type: 'STEP_IN_PROCESS'}]->(p:Process)
    WHERE p.heuristicLabel = "LoginFlow"
    RETURN s.name, r.step
    ORDER BY r.step
  
  find_stewards: |
    MATCH (p:Person)-[:RSISRelation {type: 'STEWARDS'}]->(f:File)
    RETURN p.name, f.filePath

  find_ceremony_provenance: |
    MATCH (f:File)-[:RSISRelation {type: 'BORN_FROM'}]->(c:Ceremony)
    RETURN f.name, c.name, c.cycle, c.phase
`;
}

/**
 * Cluster detail resource — queries graph directly via backend.queryClusterDetail()
 */
async function getClusterDetailResource(name: string, backend: LocalBackend, repoName?: string): Promise<string> {
  try {
    const result = await backend.queryClusterDetail(name, repoName);

    if (result.error) {
      return `error: ${result.error}`;
    }

    const cluster = result.cluster;
    const members = result.members || [];

    const lines: string[] = [
      `module: "${cluster.heuristicLabel || cluster.label || cluster.id}"`,
      `symbols: ${cluster.symbolCount || members.length}`,
    ];

    if (cluster.cohesion) {
      lines.push(`cohesion: ${(cluster.cohesion * 100).toFixed(0)}%`);
    }

    if (members.length > 0) {
      lines.push('');
      lines.push('members:');
      for (const member of members.slice(0, 20)) {
        lines.push(`  - name: ${member.name}`);
        lines.push(`    type: ${member.type}`);
        lines.push(`    file: ${member.filePath}`);
      }
      if (members.length > 20) {
        lines.push(`  # ... and ${members.length - 20} more`);
      }
    }

    return lines.join('\n');
  } catch (err: any) {
    return `error: ${err.message}`;
  }
}

/**
 * Process detail resource — queries graph directly via backend.queryProcessDetail()
 */
async function getProcessDetailResource(name: string, backend: LocalBackend, repoName?: string): Promise<string> {
  try {
    const result = await backend.queryProcessDetail(name, repoName);

    if (result.error) {
      return `error: ${result.error}`;
    }

    const proc = result.process;
    const steps = result.steps || [];

    const lines: string[] = [
      `name: "${proc.heuristicLabel || proc.label || proc.id}"`,
      `type: ${proc.processType || 'unknown'}`,
      `step_count: ${proc.stepCount || steps.length}`,
    ];

    if (steps.length > 0) {
      lines.push('');
      lines.push('trace:');
      for (const step of steps) {
        lines.push(`  ${step.step}: ${step.name} (${step.filePath})`);
      }
    }

    return lines.join('\n');
  } catch (err: any) {
    return `error: ${err.message}`;
  }
}

/**
 * Setup resource — generates AGENTS.md content for all indexed repos.
 * Useful for `rsis-gitnexus setup` onboarding or dynamic content injection.
 */
async function getSetupResource(backend: LocalBackend): Promise<string> {
  const repos = await backend.listRepos();

  if (repos.length === 0) {
    return '# GitNexus\n\nNo repositories indexed. Run: `npx rsis-gitnexus analyze` in a repository.';
  }
  
  const sections: string[] = [];
  
  for (const repo of repos) {
    const stats = repo.stats || {};
    const lines = [
      `# GitNexus MCP — ${repo.name}`,
      '',
      `This project is indexed by GitNexus as **${repo.name}** (${stats.nodes || 0} symbols, ${stats.edges || 0} relationships, ${stats.processes || 0} execution flows).`,
      '',
      '## Tools',
      '',
      '| Tool | What it gives you |',
      '|------|-------------------|',
      '| `query` | Process-grouped code intelligence — execution flows related to a concept |',
      '| `context` | 360-degree symbol view — categorized refs, processes it participates in |',
      '| `impact` | Symbol blast radius — what breaks at depth 1/2/3 with confidence |',
      '| `detect_changes` | Git-diff impact — what do your current changes affect |',
      '| `rename` | Multi-file coordinated rename with confidence-tagged edits |',
      '| `cypher` | Raw graph queries |',
      '| `list_repos` | Discover indexed repos |',
      '| `relational_context` | 360-degree relational view — ceremonies, inquiries, stewards, kinship |',
      '| `reciprocity_view` | Reciprocity patterns and balance across the codebase |',
      '| `ceremony_provenance` | Trace code artifacts back to ceremonial origins |',
      '| `kinship_map` | Kinship relationships between directories and repos |',
      '| `direction_alignment` | Four Directions analysis of recent changes |',
      '',
      '## Resources',
      '',
      `- \`rsis-gitnexus://repo/${repo.name}/context\` — Stats, staleness check`,
      `- \`rsis-gitnexus://repo/${repo.name}/clusters\` — All functional areas`,
      `- \`rsis-gitnexus://repo/${repo.name}/processes\` — All execution flows`,
      `- \`rsis-gitnexus://repo/${repo.name}/schema\` — Graph schema for Cypher`,
      `- \`rsis-gitnexus://repo/${repo.name}/wisdom-ledger\` — Inquiry-ceremony-artifact links`,
      `- \`rsis-gitnexus://repo/${repo.name}/stewards-compass\` — Directional teachings and patterns`,
      `- \`rsis-gitnexus://repo/${repo.name}/kinship\` — Full kinship graph`,
      `- \`rsis-gitnexus://repo/${repo.name}/medicine-wheel-view\` — Medicine Wheel UI data feed`,
    ];
    sections.push(lines.join('\n'));
  }
  
  return sections.join('\n\n---\n\n');
}

// ─── RSIS Resource Implementations ────────────────────────────────────

/**
 * Wisdom Ledger — links inquiries, ceremonies, code artifacts, and integrated artifacts
 */
async function getWisdomLedgerResource(backend: LocalBackend, repoName?: string): Promise<string> {
  try {
    const repo = await backend.resolveRepo(repoName);

    // Query inquiries from the graph via callTool
    let inquiries: any[] = [];
    try {
      const result = await backend.callTool('cypher', {
        query: 'MATCH (i:Inquiry) RETURN i.id, i.name, i.sun, i.coreQuestion, i.status',
        repo: repo.name,
      });
      if (result?.rows) inquiries = result.rows;
    } catch { /* No inquiries yet */ }

    // Query ceremonies from the graph
    let ceremonies: any[] = [];
    try {
      const result = await backend.callTool('cypher', {
        query: 'MATCH (c:Ceremony) RETURN c.id, c.name, c.hostSun, c.cycle, c.phase',
        repo: repo.name,
      });
      if (result?.rows) ceremonies = result.rows;
    } catch { /* No ceremonies yet */ }

    const lines: string[] = [
      '# Wisdom Ledger',
      '',
      `repo: "${repo.name}"`,
      '',
      'inquiries:',
    ];

    if (inquiries.length === 0) {
      lines.push('  # No inquiries registered yet. Populate via .rsis/config.json or graph ingestion.');
    } else {
      for (const inq of inquiries) {
        lines.push(`  - name: "${inq['i.name'] || ''}"`, `    sun: "${inq['i.sun'] || ''}"`, `    status: "${inq['i.status'] || ''}"`);
      }
    }

    lines.push('', 'ceremonies:');
    if (ceremonies.length === 0) {
      lines.push('  # No ceremonies registered yet.');
    } else {
      for (const cer of ceremonies) {
        lines.push(`  - name: "${cer['c.name'] || ''}"`, `    sun: "${cer['c.hostSun'] || ''}"`, `    cycle: "${cer['c.cycle'] || ''}"`);
      }
    }

    return lines.join('\n');
  } catch (err: any) {
    return `error: ${err.message}`;
  }
}

/**
 * Steward's Compass — accumulated directional teachings and patterns
 */
async function getStewardsCompassResource(_backend: LocalBackend, _repoName?: string): Promise<string> {
  const lines: string[] = [
    "# Steward's Compass",
    '',
    'directions:',
    '  east:',
    '    focus: "Vision, intention, emergence"',
    '    guidance: "What wants to emerge? What seeds are being planted?"',
    '  south:',
    '    focus: "Architecture, structure, planning"',
    '    guidance: "What structures support the vision? What patterns serve advancement?"',
    '  west:',
    '    focus: "Implementation, creation, manifestation"',
    '    guidance: "What is being built? How does creation serve the inquiries?"',
    '  north:',
    '    focus: "Reflection, integration, wisdom"',
    '    guidance: "What has been learned? What reciprocity needs tending?"',
  ];

  return lines.join('\n');
}

/**
 * Kinship Graph — full kinship hubs and relations
 */
async function getKinshipResource(backend: LocalBackend, repoName?: string): Promise<string> {
  try {
    const repo = await backend.resolveRepo(repoName);

    // Query kinship hubs
    let hubs: any[] = [];
    try {
      const result = await backend.callTool('cypher', {
        query: 'MATCH (k:KinshipHub) RETURN k.id, k.name, k.filePath, k.identity, k.lineage',
        repo: repo.name,
      });
      if (result?.rows) hubs = result.rows;
    } catch { /* No kinship hubs yet */ }

    // Query kinship relations
    let relations: any[] = [];
    try {
      const result = await backend.callTool('cypher', {
        query: 'MATCH (a:KinshipHub)-[r:RSISRelation {type: "KINSHIP_OF"}]->(b:KinshipHub) RETURN a.name, b.name, r.reason',
        repo: repo.name,
      });
      if (result?.rows) relations = result.rows;
    } catch { /* No relations yet */ }

    const lines: string[] = [
      '# Kinship Graph',
      '',
      `repo: "${repo.name}"`,
      '',
      'hubs:',
    ];

    if (hubs.length === 0) {
      lines.push('  # No kinship hubs discovered. Add KINSHIP.md files to your repo.');
    } else {
      for (const hub of hubs) {
        lines.push(`  - name: "${hub['k.name'] || ''}"`, `    path: "${hub['k.filePath'] || ''}"`, `    identity: "${hub['k.identity'] || ''}"`);
      }
    }

    lines.push('', 'relations:');
    if (relations.length === 0) {
      lines.push('  # No kinship relations established yet.');
    } else {
      for (const rel of relations) {
        lines.push(`  - from: "${rel['a.name'] || ''}" to: "${rel['b.name'] || ''}" reason: "${rel['r.reason'] || ''}"`);
      }
    }

    return lines.join('\n');
  } catch (err: any) {
    return `error: ${err.message}`;
  }
}

/**
 * Medicine Wheel View — JSON data feed for Medicine Wheel UI
 */
async function getMedicineWheelViewResource(_backend: LocalBackend, _repoName?: string): Promise<string> {
  // Return a structured JSON view (empty by default, populated as data is ingested)
  const view = {
    suns: [
      { name: 'NovelEmergence', inquiryCount: 0 },
      { name: 'CreativeActualization', inquiryCount: 0 },
      { name: 'WovenMeaning', inquiryCount: 0 },
      { name: 'FirstCause', inquiryCount: 0 },
      { name: 'EmbodiedPractice', inquiryCount: 0 },
      { name: 'SustainedPresence', inquiryCount: 0 },
    ],
    directions: {
      east: { count: 0, recent: [] },
      south: { count: 0, recent: [] },
      west: { count: 0, recent: [] },
      north: { count: 0, recent: [] },
    },
    reciprocity: { flows: [], balance: [] },
    kinship: { hubs: [], relations: [] },
  };

  return JSON.stringify(view, null, 2);
}
