# Quick Reference: Indigenous Paradigm-Aware QA System

**Print this page for your desk**

---

## 7 Paradigm Directions at a Glance

| # | Direction | Icon | Best For | Key Constraint |
|---|-----------|------|----------|-----------------|
| 1 | **Relational Ontology** | 🔗 | Default; relationships | Honor all perspectives |
| 2 | **Land-Based Knowing** | 🌍 | Territory/ecology | Ground in place |
| 3 | **Ceremonial Knowledge** | 🎭 | Protocols/ceremonies | Respect timing |
| 4 | **Oral Tradition** | 📖 | Stories/narratives | Preserve continuity |
| 5 | **Governance & Sovereignty** | ⚖️ | Institutions/community | Honor authority |
| 6 | **Healing & Wholeness** | 💚 | Wellness/trauma | Support integration |
| 7 | **Knowledge Sovereignty** | 🗣️ | Epistemology/decolonial | Validate pluralism |

---

## API Quick Calls

### Basic Request
```bash
curl -X POST https://beagle-emerging-gnu.ngrok-free.app/api/v1/prediction/92b3d7ce-0eef-4be8-ad5b-b5d731cabf80 \
  -H "Content-Type: application/json" \
  -d '{"question":"YOUR_QUESTION","paradigmDirection":"DIRECTION_ID"}'
```

### Replace DIRECTION_ID with:
```
relational_ontology
land_based_knowing
ceremonial_knowledge
oral_tradition
governance_sovereignty
healing_wholeness
knowledge_sovereignty_epistemology
```

---

## Python Quick Start

```python
import json, requests

config = json.load(open('indigenous_paradigm_prompt_variations.json'))
direction = 'relational_ontology'

response = requests.post(
  'https://beagle-emerging-gnu.ngrok-free.app/api/v1/prediction/92b3d7ce-0eef-4be8-ad5b-b5d731cabf80',
  json={'question': 'your question', 'paradigmDirection': direction}
)
print(response.json()['text'])
```

---

## Node.js Quick Start

```javascript
const config = require('./indigenous_paradigm_prompt_variations.json');
const direction = 'relational_ontology';

const response = await fetch(
  'https://beagle-emerging-gnu.ngrok-free.app/api/v1/prediction/92b3d7ce-0eef-4be8-ad5b-b5d731cabf80',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'your question', paradigmDirection: direction })
  }
);
console.log((await response.json()).text);
```

---

## Bash Terminal Loop

```bash
#!/bin/bash
BASE_URL="https://beagle-emerging-gnu.ngrok-free.app/api/v1/prediction/92b3d7ce-0eef-4be8-ad5b-b5d731cabf80"
DIRECTION=${1:-relational_ontology}

while read -p "Question: " question; do
  curl -s -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "{\"question\":\"$question\",\"paradigmDirection\":\"$DIRECTION\"}" | \
    jq -r '.text'
done
```

---

## JSON Config Structure

```json
{
  "paradigm_directions": {
    "DIRECTION_ID": {
      "name": "Direction Name",
      "core_principle": "...",
      "practices": ["...", "..."],
      "rephraser_prompt": "{question} {chat_history}",
      "responder_prompt": "{context}"
    }
  }
}
```

---

## Extract Prompts from JSON

```bash
# Get rephraser for a direction
jq -r '.paradigm_directions.relational_ontology.rephraser_prompt' indigenous_paradigm_prompt_variations.json

# Get responder for a direction
jq -r '.paradigm_directions.land_based_knowing.responder_prompt' indigenous_paradigm_prompt_variations.json

# List all directions
jq '.paradigm_directions | keys[]' indigenous_paradigm_prompt_variations.json
```

---

## FloWise UI Integration

1. **Add Direction Selector**
   - Dropdown or radio buttons with 7 options
   - Default: `relational_ontology`

2. **Load Prompts**
   - When direction selected, load from JSON
   - Override FloWise system prompts

3. **Display Direction**
   - Show in chat UI
   - Allow mid-conversation switching

4. **Store History**
   - Log which direction was used
   - Enable direction-aware continuity

---

## Common Error Fixes

| Error | Fix |
|-------|-----|
| `INVALID_PARADIGM_DIRECTION` | Check spelling; use IDs from table above |
| `MISSING_QUESTION` | Provide non-empty `question` field |
| `404 Not Found` | Verify chatbot ID: `92b3d7ce-0eef-4be8-ad5b-b5d731cabf80` |
| `MALFORMED_PROMPT` | Ensure `{chat_history}`, `{question}`, `{context}` present |
| Rate Limited (429) | Wait; implement exponential backoff retry |

---

## Response Validation

✅ **Good Response Should Have:**
- Text content with [1] [2] citations
- APPENDIX with APA7 references
- Under 150 words
- No apologies ("I apologize...")
- No framing ("Let me introduce...", "In summary...")
- Grounded in provided context

---

## Testing Each Direction

```bash
for dir in relational_ontology land_based_knowing ceremonial_knowledge \
           oral_tradition governance_sovereignty healing_wholeness \
           knowledge_sovereignty_epistemology; do
  echo "Testing: $dir"
  curl -s -X POST "..." \
    -d "{\"question\":\"test\",\"paradigmDirection\":\"$dir\"}" | \
    jq '.paradigmDirection'
done
```

---

## Monitoring Usage

```bash
# Count direction usage
jq -r '.direction' query-logs.jsonl | sort | uniq -c

# Find errors
jq 'select(.error != null)' query-logs.jsonl

# Average response time by direction
jq 'group_by(.direction) | map({direction: .[0].direction, avg_time: (map(.time) | add/length)})' query-logs.jsonl
```

---

## Implementation Checklist

- [ ] JSON config file present
- [ ] FloWise instance accessible
- [ ] Direction selector implemented in UI
- [ ] Prompts loaded correctly (test with `jq`)
- [ ] API calls tested for each direction
- [ ] Response validation working
- [ ] Error handling for invalid directions
- [ ] Logging active
- [ ] Team documentation ready

---

## Critical Constraints (MAINTAIN)

✅ **NEVER include:**
- Apologies ("I apologize...", "I'm sorry...")
- Introductions ("Here is...", "Let me explain...")
- Conclusions ("In summary...", "As you can see...")
- Meta-commentary ("As I mentioned...", "This shows...")

✅ **ALWAYS include:**
- Numbered citations [1], [2]
- APA7 reference appendix
- Response under 150 words (unless specified)
- Grounding in provided context
- Paradigm-appropriate framing

---

## File Locations

| File | Format | Use |
|------|--------|-----|
| `indigenous_paradigm_prompt_variations.json` | JSON | Load in your app |
| `indigenous_paradigm_prompts_guide.md` | Markdown | Read for deep understanding |
| `api_specification.md` | Markdown | API reference |
| `quick_reference.md` | Markdown | This page; print it |

---

## Support Commands

```bash
# Validate JSON syntax
jq empty indigenous_paradigm_prompt_variations.json

# Show one direction's metadata
jq '.paradigm_directions.relational_ontology' indigenous_paradigm_prompt_variations.json

# Count total directions
jq '.paradigm_directions | length' indigenous_paradigm_prompt_variations.json

# Extract just names
jq '.paradigm_directions | to_entries[] | .key + ": " + .value.name' indigenous_paradigm_prompt_variations.json
```

---

**Version: 1.0 | Status: Production Ready | Generated: 2026-01-03**

*Laminate this card for reference during development*
