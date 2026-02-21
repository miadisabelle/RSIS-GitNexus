# Fire Keeper Agent Specification

> **Purpose:** Vision Alignment, not Task Management.
> The Fire Keeper ensures the ceremony stays on track and relationships are honored.
> It is the one holding the Medicine Wheel, checking every sub-agent's work against that wheel.

---

## 1. Identity

| Property | Value |
|----------|-------|
| Agent Role | **Fire Keeper** (Coordinating Agent) |
| Primary Direction | 🌅 East — holds the vision, initiates ceremony |
| Accountability | To the inquiry's relational integrity, not to throughput |
| Metaphor | The person who tends the fire so the ceremony can proceed |

The Fire Keeper does **not** write code, build schemas, or produce artifacts directly. It receives, evaluates, routes, and gates the work of sub-agents.

---

## 2. Message Types

All messages flow through Miadi's A2A Redis broker (`/src/Miadi/lib/a2a-message-broker.ts`). The `type` field in `A2AMessage` uses these values. The `payload` conforms to `importance-unit-schema.json` or the specific envelope described below.

### 2.1 Messages the Fire Keeper **receives**

#### `importance.submitted`

A sub-agent submits a new ImportanceUnit for evaluation.

```json
{
  "type": "importance.submitted",
  "payload": {
    "/* ImportanceUnit as defined in importance-unit-schema.json */"
  }
}
```

**Fire Keeper action:** Evaluate against gating conditions and ceremony state. Accept, request deepening, or hold.

---

#### `circle.return`

A sub-agent signals it has circled back to a previously-visited topic with new depth.

```json
{
  "type": "circle.return",
  "payload": {
    "unitId": "uuid — the ImportanceUnit being circled",
    "newCircleDepth": 3,
    "shift": "What changed or deepened in this pass",
    "direction": "south",
    "source": "code"
  }
}
```

**Fire Keeper action:** Increment `circleDepth` on the unit. Record the refinement. Check if `quadrantsVisited` has expanded — if all four are now present, mark `circleComplete: true`.

---

#### `agent.report`

Periodic status from a working sub-agent.

```json
{
  "type": "agent.report",
  "payload": {
    "agentId": "string",
    "currentDirection": "west",
    "activeUnits": ["uuid", "uuid"],
    "trajectoryConfidence": 0.78,
    "valueDivergenceFlags": []
  }
}
```

**Fire Keeper action:** Compare `trajectoryConfidence` against threshold (see Decision Points). If `valueDivergenceFlags` is non-empty, initiate hold protocol.

---

#### `human.response`

The human responds to a `human.needed` request.

```json
{
  "type": "human.response",
  "payload": {
    "requestId": "uuid — matches the original human.needed request",
    "decision": "string — the human's input",
    "modality": "protocol",
    "additionalContext": "string | null"
  }
}
```

**Fire Keeper action:** Route the decision to the requesting sub-agent. Update ceremony state.

---

### 2.2 Messages the Fire Keeper **sends**

#### `importance.accepted`

The submitted ImportanceUnit passes gating conditions.

```json
{
  "type": "importance.accepted",
  "payload": {
    "unitId": "uuid",
    "assignedDirection": "south",
    "gatingStatus": "all-satisfied"
  }
}
```

---

#### `importance.held`

The unit cannot proceed — a gating condition is unsatisfied.

```json
{
  "type": "importance.held",
  "payload": {
    "unitId": "uuid",
    "reason": "Research Is Ceremony context not yet gathered for this thread",
    "unsatisfiedConditions": [
      { "condition": "Research Is Ceremony context gathered", "satisfied": false }
    ],
    "suggestedAction": "Gather foundational context before proceeding"
  }
}
```

---

#### `deepen.requested`

The Fire Keeper asks a sub-agent to circle back — the unit needs more relational depth before it can advance.

```json
{
  "type": "deepen.requested",
  "payload": {
    "unitId": "uuid",
    "currentCircleDepth": 2,
    "missingQuadrants": ["west", "north"],
    "guidance": "This unit has vision and analysis but lacks validation and grounded action"
  }
}
```

---

#### `human.needed`

A decision point has been reached that requires the human in the loop.

```json
{
  "type": "human.needed",
  "payload": {
    "requestId": "uuid",
    "reason": "Value divergence detected — trajectory no longer strengthens Spirit-Body relationship",
    "decisionType": "value-conflict | modality-choice | permission-escalation | circle-completion-review",
    "context": {
      "unitId": "uuid",
      "summary": "string describing the situation",
      "options": ["string array of possible paths if applicable"]
    },
    "suggestedModality": "protocol | ui-design | database | narrative"
  }
}
```

---

#### `ceremony.state.update`

Broadcast to all sub-agents when ceremony state changes materially.

```json
{
  "type": "ceremony.state.update",
  "payload": {
    "inquiryRef": "inquiry::RCH-Wilson-...",
    "activeQuadrant": "south",
    "quadrantsCompleted": ["east"],
    "totalUnits": 12,
    "completedCircles": 3,
    "overallTrajectoryConfidence": 0.82,
    "activeGatingConditions": [
      { "condition": "Research Is Ceremony context gathered", "satisfied": true }
    ]
  }
}
```

---

#### `stopwork.order`

Emergency halt — a sub-agent's trajectory has diverged from core values.

```json
{
  "type": "stopwork.order",
  "payload": {
    "targetAgentId": "string",
    "reason": "Trajectory violates relational accountability — implicit values overruled by explicit task",
    "unitId": "uuid | null",
    "resumeCondition": "Human review required via human.needed"
  }
}
```

---

## 3. Decision Points — Human-in-the-Loop

The Fire Keeper decides autonomously **except** at these decision points, where `human.needed` is mandatory:

| # | Decision Point | Trigger Condition | `decisionType` |
|---|---------------|-------------------|-----------------|
| 1 | **Value Divergence** | A sub-agent's `trajectoryConfidence` drops below **0.65** OR a `valueDivergenceFlag` is raised | `value-conflict` |
| 2 | **Permission Escalation** | An agent requests action beyond read-only exploration (code generation, commit, deploy) | `permission-escalation` |
| 3 | **Circle Completion Review** | An ImportanceUnit reaches `circleComplete: true` (all 4 quadrants visited) — human confirms before archival/pruning | `circle-completion-review` |
| 4 | **Modality Choice** | Work reaches a point requiring skills-specific contribution (UI design, database schema, protocol work) — Fire Keeper identifies which modality and invites human | `modality-choice` |
| 5 | **Gating Condition Override** | A sub-agent requests proceeding despite an unsatisfied gating condition | `value-conflict` |
| 6 | **New Inquiry Thread** | Material emerges that doesn't belong to any existing inquiry — creating a new one requires human intent | `modality-choice` |

### Permission Tiers (for escalation decisions)

| Tier | Scope | Human Required |
|------|-------|---------------|
| 🟢 **Observe** | Read files, read GitHub, gather context | No |
| 🟡 **Analyze** | Produce analysis, create ImportanceUnits, circle topics | No |
| 🟠 **Propose** | Draft artifacts, suggest schemas, write specs | No (but Fire Keeper reviews) |
| 🔴 **Act** | Generate code, create commits, modify infrastructure | **Yes** |

---

## 4. Ceremony State Tracking

The Fire Keeper maintains a **Ceremony State Object** per active inquiry:

```json
{
  "inquiryRef": "inquiry::RCH-Wilson-ElementsOfResearchParadigm-001-...",
  "ceremonyPhase": "gathering | kindling | tending | harvesting | resting",
  "activeDirection": "south",
  "quadrantState": {
    "east": {
      "status": "visited",
      "unitCount": 4,
      "deepestCircle": 2,
      "lastVisited": "2026-02-16T07:33:00Z"
    },
    "south": {
      "status": "active",
      "unitCount": 3,
      "deepestCircle": 1,
      "lastVisited": "2026-02-18T03:00:00Z"
    },
    "west": {
      "status": "pending",
      "unitCount": 0,
      "deepestCircle": 0,
      "lastVisited": null
    },
    "north": {
      "status": "pending",
      "unitCount": 0,
      "deepestCircle": 0,
      "lastVisited": null
    }
  },
  "gatingConditions": [
    {
      "condition": "Research Is Ceremony context gathered",
      "satisfied": true,
      "satisfiedAt": "2026-02-16T07:33:00Z",
      "satisfiedBy": "fire-keeper"
    },
    {
      "condition": "Medicine Wheel alignment verified",
      "satisfied": false,
      "satisfiedAt": null,
      "satisfiedBy": null
    }
  ],
  "relationalMilestones": [
    {
      "milestone": "First full circle on Importance Unit schema",
      "complete": false,
      "quadrantsRequired": ["east", "south", "west", "north"],
      "quadrantsTouched": ["east", "south"]
    }
  ],
  "trajectoryHistory": [
    {
      "timestamp": "2026-02-16T07:33:00Z",
      "confidence": 0.92,
      "direction": "east",
      "note": "Initial PDE decomposition — vision established"
    }
  ]
}
```

### Ceremony Phases

| Phase | Description | Transition Condition |
|-------|------------|---------------------|
| **Gathering** | Reading context, collecting materials, honoring what exists | Foundational gating conditions satisfied |
| **Kindling** | East work — establishing vision and intent | Vision units reach circleDepth >= 2 |
| **Tending** | South/West work — analysis, validation, deepening | Active units being refined across quadrants |
| **Harvesting** | North work — producing grounded artifacts | circleComplete on key units |
| **Resting** | Ceremony pause — integration period | Human initiates or Fire Keeper detects fatigue pattern |

### Quadrant Completion Detection

A quadrant is **visited** when at least one ImportanceUnit with that `direction` reaches `circleDepth >= 1`.

A **Relational Circle is complete** when:
1. All four quadrants have been visited for a given topic/unit
2. The Fire Keeper has verified that the circling deepened (not just touched) each quadrant
3. Human confirms via `circle-completion-review`

Only after circle completion can associated units be archived or pruned. This replaces time-based pruning entirely.

---

## 5. Relational Check-Back Protocol

Before any sub-agent autonomously advances work, the Fire Keeper performs this check:

```
1. RECEIVE agent.report from sub-agent
2. FOR EACH activeUnit in report:
   a. Does this action STRENGTHEN the relationship between
      Spirit (vision/values) and Body (code/implementation)?
      → If uncertain: SEND deepen.requested
   b. Are all gatingConditions satisfied for this unit?
      → If not: SEND importance.held
   c. Is trajectoryConfidence >= 0.65?
      → If not: SEND human.needed (value-conflict)
   d. Does the action stay within the agent's permission tier?
      → If escalation needed: SEND human.needed (permission-escalation)
3. IF all checks pass: allow sub-agent to proceed
4. LOG trajectory checkpoint to ceremonyState.trajectoryHistory
```

---

## 6. Integration with Existing Infrastructure

| Component | Location | Relationship to Fire Keeper |
|-----------|----------|----------------------------|
| A2A Message Broker | `/src/Miadi/lib/a2a-message-broker.ts` | Transport layer — Fire Keeper is the primary consumer of its own queue |
| ImportanceUnit Schema | `importance-unit-schema.json` (this directory) | Defines the `payload` format for most message types |
| iaip-mcp | IAIP MCP server | Fire Keeper consults for direction guidance and relational alignment assessment |
| COAIA Tracing | coaiapy-mcp | Fire Keeper logs ceremony state transitions as observations |
| Medicine Wheel UI | `/src/mcp-medicine-wheel-ui` | Visual representation of ceremony state — consumes `ceremony.state.update` |

---

## 7. What This Spec Does NOT Cover

- **Implementation code** — another session handles that
- **Storage backend choice** (NATS vs Redis vs file) — flagged as ambiguity in PDE decomposition
- **Specific sub-agent definitions** — Fire Keeper coordinates them; their specs are separate
- **Authentication / authorization** — assumed handled at broker level
- **The FloWise/AgentFlow integration model** — flagged as ambiguity; clarification needed on whether the chatbot at `db8a73ac` is consumer, collaborator, or parallel prototype
