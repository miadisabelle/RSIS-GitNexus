---
name: rsis-gitnexus-debugging
description: Trace bugs through call chains using knowledge graph
---

# Debugging with GitNexus

## When to Use
- "Why is this function failing?"
- "Trace where this error comes from"
- "Who calls this method?"
- "This endpoint returns 500"
- Investigating bugs, errors, or unexpected behavior

## Workflow

```
1. rsis-gitnexus_query({query: "<error or symptom>"})            → Find related execution flows
2. rsis-gitnexus_context({name: "<suspect>"})                    → See callers/callees/processes
3. READ rsis-gitnexus://repo/{name}/process/{name}                → Trace execution flow
4. rsis-gitnexus_cypher({query: "MATCH path..."})                 → Custom traces if needed
```

> If "Index is stale" → run `npx rsis-gitnexus analyze` in terminal.

## Checklist

```
- [ ] Understand the symptom (error message, unexpected behavior)
- [ ] rsis-gitnexus_query for error text or related code
- [ ] Identify the suspect function from returned processes
- [ ] rsis-gitnexus_context to see callers and callees
- [ ] Trace execution flow via process resource if applicable
- [ ] rsis-gitnexus_cypher for custom call chain traces if needed
- [ ] Read source files to confirm root cause
```

## Debugging Patterns

| Symptom | GitNexus Approach |
|---------|-------------------|
| Error message | `rsis-gitnexus_query` for error text → `context` on throw sites |
| Wrong return value | `context` on the function → trace callees for data flow |
| Intermittent failure | `context` → look for external calls, async deps |
| Performance issue | `context` → find symbols with many callers (hot paths) |
| Recent regression | `detect_changes` to see what your changes affect |

## Tools

**rsis-gitnexus_query** — find code related to error:
```
rsis-gitnexus_query({query: "payment validation error"})
→ Processes: CheckoutFlow, ErrorHandling
→ Symbols: validatePayment, handlePaymentError, PaymentException
```

**rsis-gitnexus_context** — full context for a suspect:
```
rsis-gitnexus_context({name: "validatePayment"})
→ Incoming calls: processCheckout, webhookHandler
→ Outgoing calls: verifyCard, fetchRates (external API!)
→ Processes: CheckoutFlow (step 3/7)
```

**rsis-gitnexus_cypher** — custom call chain traces:
```cypher
MATCH path = (a)-[:CodeRelation {type: 'CALLS'}*1..2]->(b:Function {name: "validatePayment"})
RETURN [n IN nodes(path) | n.name] AS chain
```

## Example: "Payment endpoint returns 500 intermittently"

```
1. rsis-gitnexus_query({query: "payment error handling"})
   → Processes: CheckoutFlow, ErrorHandling
   → Symbols: validatePayment, handlePaymentError

2. rsis-gitnexus_context({name: "validatePayment"})
   → Outgoing calls: verifyCard, fetchRates (external API!)

3. READ rsis-gitnexus://repo/my-app/process/CheckoutFlow
   → Step 3: validatePayment → calls fetchRates (external)

4. Root cause: fetchRates calls external API without proper timeout
```
