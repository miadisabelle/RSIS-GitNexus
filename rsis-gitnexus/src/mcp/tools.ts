/**
 * MCP Tool Definitions
 * 
 * Defines the tools that GitNexus exposes to external AI agents.
 * All tools support an optional `repo` parameter for multi-repo setups.
 */

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
      default?: any;
      items?: { type: string };
      enum?: string[];
    }>;
    required: string[];
  };
}

export const GITNEXUS_TOOLS: ToolDefinition[] = [
  {
    name: 'list_repos',
    description: `List all indexed repositories available to GitNexus.

Returns each repo's name, path, indexed date, last commit, and stats.

WHEN TO USE: First step when multiple repos are indexed, or to discover available repos.
AFTER THIS: READ rsis-gitnexus://repo/{name}/context for the repo you want to work with.

When multiple repos are indexed, you MUST specify the "repo" parameter
on other tools (query, context, impact, etc.) to target the correct one.`,
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'query',
    description: `Query the code knowledge graph for execution flows related to a concept.
Returns processes (call chains) ranked by relevance, each with its symbols and file locations.

WHEN TO USE: Understanding how code works together. Use this when you need execution flows and relationships, not just file matches. Complements grep/IDE search.
AFTER THIS: Use context() on a specific symbol for 360-degree view (callers, callees, categorized refs).

Returns results grouped by process (execution flow):
- processes: ranked execution flows with relevance priority
- process_symbols: all symbols in those flows with file locations
- definitions: standalone types/interfaces not in any process

Hybrid ranking: BM25 keyword + semantic vector search, ranked by Reciprocal Rank Fusion.`,
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Natural language or keyword search query' },
        task_context: { type: 'string', description: 'What you are working on (e.g., "adding OAuth support"). Helps ranking.' },
        goal: { type: 'string', description: 'What you want to find (e.g., "existing auth validation logic"). Helps ranking.' },
        limit: { type: 'number', description: 'Max processes to return (default: 5)', default: 5 },
        max_symbols: { type: 'number', description: 'Max symbols per process (default: 10)', default: 10 },
        include_content: { type: 'boolean', description: 'Include full symbol source code (default: false)', default: false },
        repo: { type: 'string', description: 'Repository name or path. Omit if only one repo is indexed.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'cypher',
    description: `Execute Cypher query against the code knowledge graph.

WHEN TO USE: Complex structural queries that search/explore can't answer. READ rsis-gitnexus://repo/{name}/schema first for the full schema.
AFTER THIS: Use context() on result symbols for deeper context.

SCHEMA:
- Nodes: File, Folder, Function, Class, Interface, Method, CodeElement, Community, Process
- RSIS Nodes: Person, Inquiry, Sun, Ceremony, Direction, KinshipHub
- Multi-language nodes (use backticks): \`Struct\`, \`Enum\`, \`Trait\`, \`Impl\`, etc.
- Code edges via CodeRelation table with 'type' property
- RSIS edges via RSISRelation table with 'type' property
- Code edge types: CONTAINS, DEFINES, CALLS, IMPORTS, EXTENDS, IMPLEMENTS, MEMBER_OF, STEP_IN_PROCESS
- RSIS edge types: STEWARDS, BORN_FROM, SERVES, GIVES_BACK_TO, ALIGNED_WITH, KINSHIP_OF
- Edge properties: type (STRING), confidence (DOUBLE), reason (STRING), step (INT32)

EXAMPLES:
• Find callers of a function:
  MATCH (a)-[:CodeRelation {type: 'CALLS'}]->(b:Function {name: "validateUser"}) RETURN a.name, a.filePath

• Find community members:
  MATCH (f)-[:CodeRelation {type: 'MEMBER_OF'}]->(c:Community) WHERE c.heuristicLabel = "Auth" RETURN f.name

• Find stewards of a file:
  MATCH (p:Person)-[:RSISRelation {type: 'STEWARDS'}]->(f:File) RETURN p.name, f.filePath

• Find ceremony provenance:
  MATCH (f:File)-[:RSISRelation {type: 'BORN_FROM'}]->(c:Ceremony) RETURN f.name, c.name, c.cycle

TIPS:
- Code relationships use CodeRelation table — filter with {type: 'CALLS'} etc.
- RSIS relationships use RSISRelation table — filter with {type: 'STEWARDS'} etc.
- Community = auto-detected functional area (Leiden algorithm)
- Process = execution flow trace from entry point to terminal
- Use heuristicLabel (not label) for human-readable community/process names`,
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Cypher query to execute' },
        repo: { type: 'string', description: 'Repository name or path. Omit if only one repo is indexed.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'context',
    description: `360-degree view of a single code symbol.
Shows categorized incoming/outgoing references (calls, imports, extends, implements), process participation, and file location.

WHEN TO USE: After query() to understand a specific symbol in depth. When you need to know all callers, callees, and what execution flows a symbol participates in.
AFTER THIS: Use impact() if planning changes, or READ rsis-gitnexus://repo/{name}/process/{processName} for full execution trace.

Handles disambiguation: if multiple symbols share the same name, returns candidates for you to pick from. Use uid param for zero-ambiguity lookup from prior results.`,
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Symbol name (e.g., "validateUser", "AuthService")' },
        uid: { type: 'string', description: 'Direct symbol UID from prior tool results (zero-ambiguity lookup)' },
        file_path: { type: 'string', description: 'File path to disambiguate common names' },
        include_content: { type: 'boolean', description: 'Include full symbol source code (default: false)', default: false },
        repo: { type: 'string', description: 'Repository name or path. Omit if only one repo is indexed.' },
      },
      required: [],
    },
  },
  {
    name: 'detect_changes',
    description: `Analyze uncommitted git changes and find affected execution flows.
Maps git diff hunks to indexed symbols, then traces which processes are impacted.

WHEN TO USE: Before committing — to understand what your changes affect. Pre-commit review, PR preparation.
AFTER THIS: Review affected processes. Use context() on high-risk symbols. READ rsis-gitnexus://repo/{name}/process/{name} for full traces.

Returns: changed symbols, affected processes, and a risk summary.`,
    inputSchema: {
      type: 'object',
      properties: {
        scope: { type: 'string', description: 'What to analyze: "unstaged" (default), "staged", "all", or "compare"', enum: ['unstaged', 'staged', 'all', 'compare'], default: 'unstaged' },
        base_ref: { type: 'string', description: 'Branch/commit for "compare" scope (e.g., "main")' },
        repo: { type: 'string', description: 'Repository name or path. Omit if only one repo is indexed.' },
      },
      required: [],
    },
  },
  {
    name: 'rename',
    description: `Multi-file coordinated rename using the knowledge graph + text search.
Finds all references via graph (high confidence) and regex text search (lower confidence). Preview by default.

WHEN TO USE: Renaming a function, class, method, or variable across the codebase. Safer than find-and-replace.
AFTER THIS: Run detect_changes() to verify no unexpected side effects.

Each edit is tagged with confidence:
- "graph": found via knowledge graph relationships (high confidence, safe to accept)
- "text_search": found via regex text search (lower confidence, review carefully)`,
    inputSchema: {
      type: 'object',
      properties: {
        symbol_name: { type: 'string', description: 'Current symbol name to rename' },
        symbol_uid: { type: 'string', description: 'Direct symbol UID from prior tool results (zero-ambiguity)' },
        new_name: { type: 'string', description: 'The new name for the symbol' },
        file_path: { type: 'string', description: 'File path to disambiguate common names' },
        dry_run: { type: 'boolean', description: 'Preview edits without modifying files (default: true)', default: true },
        repo: { type: 'string', description: 'Repository name or path. Omit if only one repo is indexed.' },
      },
      required: ['new_name'],
    },
  },
  {
    name: 'impact',
    description: `Analyze the blast radius of changing a code symbol.
Returns all symbols affected by modifying the target, grouped by depth with edge types and confidence.

WHEN TO USE: Before making code changes — especially refactoring, renaming, or modifying shared code. Shows what would break.
AFTER THIS: Review d=1 items (WILL BREAK). READ rsis-gitnexus://repo/{name}/processes to check affected execution flows.

Depth groups:
- d=1: WILL BREAK (direct callers/importers)
- d=2: LIKELY AFFECTED (indirect)
- d=3: MAY NEED TESTING (transitive)

EdgeType: CALLS, IMPORTS, EXTENDS, IMPLEMENTS
Confidence: 1.0 = certain, <0.8 = fuzzy match`,
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'Name of function, class, or file to analyze' },
        direction: { type: 'string', description: 'upstream (what depends on this) or downstream (what this depends on)' },
        maxDepth: { type: 'number', description: 'Max relationship depth (default: 3)', default: 3 },
        relationTypes: { type: 'array', items: { type: 'string' }, description: 'Filter: CALLS, IMPORTS, EXTENDS, IMPLEMENTS (default: usage-based)' },
        includeTests: { type: 'boolean', description: 'Include test files (default: false)' },
        minConfidence: { type: 'number', description: 'Minimum confidence 0-1 (default: 0.7)' },
        repo: { type: 'string', description: 'Repository name or path. Omit if only one repo is indexed.' },
      },
      required: ['target', 'direction'],
    },
  },

  // =========================================================================
  // RSIS Relational Science Tools
  // =========================================================================

  {
    name: 'relational_context',
    description: `360-degree relational view of a code symbol — extending context with ceremonial and kinship dimensions.

WHEN TO USE: When you need to understand not just what calls/imports a symbol, but what ceremonies birthed it, who stewards it, what inquiries it serves, and its kinship boundaries.
AFTER THIS: Use ceremony_provenance() for deeper lineage, or kinship_map() for hub relationships.

Returns everything context() returns, plus:
- ceremonies: ceremonies this symbol participated in
- inquiries: inquiries this symbol serves
- stewards: people with stewardship over this symbol
- kinship: kinship hub this symbol belongs to, with boundaries
- direction_alignment: directional tagging of the symbol's creation context`,
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Symbol name (e.g., "validateUser", "AuthService")' },
        repo: { type: 'string', description: 'Repository name or path. Omit if only one repo is indexed.' },
        include: {
          type: 'array',
          items: { type: 'string' },
          description: 'Relational dimensions to include. Options: ceremonies, inquiries, stewards, kinship, directions, reciprocity. Default: all.',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'reciprocity_view',
    description: `Surfaces reciprocity patterns across the codebase — where contributions flow, where giving and taking are balanced or imbalanced.

WHEN TO USE: During ceremony reflection, community health assessment, or when tending relational balance in a codebase.
AFTER THIS: Use relational_context() on specific symbols for deeper understanding.

Results are framed as invitations for ceremonial attention, never as performance evaluations.
Language uses "invites tending" not "underperforming."`,
    inputSchema: {
      type: 'object',
      properties: {
        repo: { type: 'string', description: 'Repository name or path. Omit if only one repo is indexed.' },
        scope: { type: 'string', description: 'Scope: person, community, or kinship_hub. Default: community', enum: ['person', 'community', 'kinship_hub'] },
        period: { type: 'string', description: 'ISO date range. Default: last ceremony cycle' },
      },
      required: [],
    },
  },
  {
    name: 'ceremony_provenance',
    description: `Traces a code artifact back to its ceremonial origins.

WHEN TO USE: When you want to understand the lineage of a module, function, or directory — what ceremonies birthed it, what inquiries shaped it, who stewarded changes.
AFTER THIS: Use relational_context() for current relational view, or direction_alignment() for directional analysis.

Returns:
- lineage: ordered ceremonies, inquiries, and structural tension charts that shaped this artifact
- narrative: human-readable provenance story
- stewardship_chain: who stewarded changes at each point`,
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'File path, function name, or directory to trace' },
        repo: { type: 'string', description: 'Repository name or path. Omit if only one repo is indexed.' },
        depth: { type: 'number', description: 'How many ceremony cycles back to trace. Default: 3', default: 3 },
      },
      required: ['target'],
    },
  },
  {
    name: 'kinship_map',
    description: `Visualizes kinship relationships between directories, repos, and knowledge spaces.

WHEN TO USE: When exploring relational boundaries, understanding which directories are relationally connected, or checking kinship accountabilities.
AFTER THIS: Use relational_context() for a specific symbol's kinship, or governance checks via impact().

Returns:
- hubs: KinshipHub nodes with identity, lineage, accountabilities
- relations: KINSHIP_OF edges between hubs
- boundaries: access and modification boundaries per hub`,
    inputSchema: {
      type: 'object',
      properties: {
        root: { type: 'string', description: 'Starting path. Default: repo root' },
        depth: { type: 'number', description: 'Kinship traversal depth. Default: 2', default: 2 },
        repo: { type: 'string', description: 'Repository name or path. Omit if only one repo is indexed.' },
      },
      required: [],
    },
  },
  {
    name: 'direction_alignment',
    description: `Analyzes recent changes through the Four Directions lens — categorizing work as vision (East 🌸), planning (South 🧠), implementation (West ⚡), or reflection (North 🕸️).

WHEN TO USE: During ceremony reflection, sprint retrospectives, or when assessing directional balance of recent work.
AFTER THIS: Consider a ceremony in the underrepresented direction.

Returns:
- distribution: percentage of work in each direction
- details: per-commit or per-file directional classification
- observation: natural language observation about directional balance`,
    inputSchema: {
      type: 'object',
      properties: {
        repo: { type: 'string', description: 'Repository name or path. Omit if only one repo is indexed.' },
        since: { type: 'string', description: 'ISO date. Default: last 7 days' },
        scope: { type: 'string', description: 'What to classify: commits, files, or processes. Default: commits', enum: ['commits', 'files', 'processes'] },
      },
      required: [],
    },
  },
];
