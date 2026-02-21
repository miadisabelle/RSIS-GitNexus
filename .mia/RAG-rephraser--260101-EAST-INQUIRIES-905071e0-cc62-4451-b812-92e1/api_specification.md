# API Specification: Indigenous Paradigm-Aware QA Chain

**Version:** 1.0  
**Status:** Production-Ready

---

## Overview

This API enables the Indigenous Paradigm-Aware Conversational Retrieval QA Chain via REST endpoints. It extends FloWise prediction endpoints with paradigm-direction selection and dynamic prompt injection.

---

## Core Endpoint

### POST /api/v1/prediction/{chatbotId}

Execute a query with specified Indigenous paradigm direction.

#### Request

```json
{
  "question": "How do we understand knowledge in networked systems?",
  "paradigmDirection": "relational_ontology"
}
```

#### Valid Paradigm Directions

| Direction | Focus | Use Case |
|-----------|-------|----------|
| `relational_ontology` | Interconnected relationships | Default; universal baseline |
| `land_based_knowing` | Place/ecological specificity | Territory-focused research |
| `ceremonial_knowledge` | Structured practices/timing | Community protocols |
| `oral_tradition` | Narrative continuity | Storytelling/documentation |
| `governance_sovereignty` | Collective authority | Institutional research |
| `healing_wholeness` | Integrated wellness | Health/trauma-informed inquiry |
| `knowledge_sovereignty_epistemology` | Epistemological pluralism | Decolonial research |

#### Response

```json
{
  "text": "Networked systems reflect relational principles where knowledge emerges through interconnection rather than hierarchy. Each perspective holds validity within its relational context...",
  "sourceDocuments": [
    {
      "pageContent": "...",
      "metadata": {
        "source": "document_id",
        "loc": { "lines": { "from": 10, "to": 20 } }
      }
    }
  ],
  "paradigmDirection": "relational_ontology",
  "responseMetadata": {
    "rephraseUsed": true,
    "wordCount": 145,
    "references": [1, 2]
  }
}
```

#### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Response object with text and sources |
| 400 | Bad Request | Invalid question or paradigm direction |
| 401 | Unauthorized | Missing/invalid authentication |
| 404 | Not Found | Chatbot ID doesn't exist |
| 422 | Unprocessable Entity | Malformed payload or prompt syntax error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal FloWise error |

#### Examples

**cURL - Relational Ontology**

```bash
curl -X POST https://beagle-emerging-gnu.ngrok-free.app/api/v1/prediction/92b3d7ce-0eef-4be8-ad5b-b5d731cabf80 \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What frameworks guide knowledge integration?",
    "paradigmDirection": "relational_ontology"
  }'
```

**cURL - Land-Based Knowing**

```bash
curl -X POST https://beagle-emerging-gnu.ngrok-free.app/api/v1/prediction/92b3d7ce-0eef-4be8-ad5b-b5d731cabf80 \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How does territory shape research practice?",
    "paradigmDirection": "land_based_knowing"
  }'
```

**JavaScript/Fetch**

```javascript
const response = await fetch(
  'https://beagle-emerging-gnu.ngrok-free.app/api/v1/prediction/92b3d7ce-0eef-4be8-ad5b-b5d731cabf80',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question: 'Your question here',
      paradigmDirection: 'relational_ontology'
    })
  }
);
const result = await response.json();
console.log(result.text);
```

**Python/Requests**

```python
import requests

response = requests.post(
  'https://beagle-emerging-gnu.ngrok-free.app/api/v1/prediction/92b3d7ce-0eef-4be8-ad5b-b5d731cabf80',
  json={
    'question': 'Your question here',
    'paradigmDirection': 'relational_ontology'
  }
)
print(response.json()['text'])
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "INVALID_PARADIGM_DIRECTION",
    "message": "Unknown paradigm direction: 'invalid_name'",
    "details": {
      "requested": "invalid_name",
      "valid_options": [
        "relational_ontology",
        "land_based_knowing",
        "ceremonial_knowledge",
        "oral_tradition",
        "governance_sovereignty",
        "healing_wholeness",
        "knowledge_sovereignty_epistemology"
      ]
    },
    "timestamp": "2026-01-03T05:11:00Z"
  }
}
```

### Common Error Codes

| Code | HTTP | Cause | Solution |
|------|------|-------|----------|
| `INVALID_PARADIGM_DIRECTION` | 400 | Unknown direction | Use valid direction from list above |
| `MISSING_QUESTION` | 400 | Empty question | Provide non-empty `question` field |
| `UNAUTHORIZED` | 401 | Invalid API key | Provide valid authentication |
| `CHATBOT_NOT_FOUND` | 404 | Invalid chatbot ID | Verify chatbot ID is correct |
| `MALFORMED_PROMPT` | 422 | Syntax error | Verify template variables |
| `RATE_LIMITED` | 429 | Too many requests | Implement exponential backoff |
| `BACKEND_ERROR` | 500 | FloWise service error | Check FloWise logs; retry |

---

## Request/Response Patterns

### Chat History Format

```json
{
  "question": "Follow-up question",
  "chatHistory": "User: First question\nAssistant: First response\nUser: Second question"
}
```

### Context Variable

The `{context}` variable in responder prompts is populated from retrieval:

```
Context:
[Document 1 excerpt]
[Document 2 excerpt]
[Document 3 excerpt]
```

### Citation Format

Responses use numbered citations with APA7 appendix:

```
Text with citation [1] and another [2].

APPENDIX - References
[1] Author, A. (Year). Title. Journal.
[2] Author, B. (Year). Title. Publisher.
```

---

## Rate Limiting

- **Standard:** 100 requests/minute
- **Burst:** 150 requests/10 seconds
- **Headers:**
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 87
  X-RateLimit-Reset: 1704200400
  ```

---

## Implementation Checklist

- [ ] FloWise instance accessible
- [ ] Chatbot ID verified
- [ ] Direction selector implemented
- [ ] Request/response validation working
- [ ] Error handling implemented
- [ ] Rate limiting understood
- [ ] Logging active
- [ ] All 7 directions tested

---

**Status: Production Ready | Version: 1.0 | Last Updated: 2026-01-03**
