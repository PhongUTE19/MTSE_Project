# Homework 6B – Baseline AI Project Feature: AI Task Assistant

**Feature Name:** MANA AI Task Assistant  
**Milestone:** MTSE Homework 6B  
**Author / Team:** MANA Team (Bùi Duy Phong, Trần Thị Tố Như, Văn Phạm Thảo Nhi)  
**Target Capability:** Natural language task description → Structured task creation with review-before-save  

---

## 1. Feature Architecture & Request Flow

```
+-------------------------------------------------------------+
| CLIENT (React 19)                                           |
|   1. User enters natural language prompt in CreateTask modal|
|   2. User clicks "Auto-Fill with AI" (or Ctrl+Enter)        |
+------------------------------+------------------------------+
                               | POST /api/v1/ai/parse-task
                               v
+-------------------------------------------------------------+
| BACKEND (Express 5 REST API)                                |
|   3. Middleware: requestLogger, validate(parseTaskInput)    |
|   4. Controller: aiController.parseTask                     |
|   5. Prompt Builder: task-assistant.v1.js                   |
|   6. AI Service: aiService.parseTaskPrompt                  |
+------------------------------+------------------------------+
                               | Secure API call (Promise.race 30s)
                               v
+-------------------------------------------------------------+
| LLM INFERENCE (Google Gemini API: gemini-3.5-flash-lite)    |
|   7. Process system instructions & JSON schema              |
|   8. Returns structured JSON string                         |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| BACKEND VALIDATION & ERROR HANDLING                         |
|   9. JSON parser & field normalizer                         |
|  10. Zod Schema: aiTaskResponseSchema                       |
|  11. Returns { success: true, data: validatedTask, meta }   |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| CLIENT REVIEW-BEFORE-SAVE (UI Native Flow)                  |
|  12. UI transitions to SUCCESS banner                       |
|  13. Values populate standard form (Title, Date, Checklist) |
|  14. User inspects, edits any field                         |
|  15. User clicks "Create Task" -> Persisted to Supabase DB  |
+-------------------------------------------------------------+
```

### Key Architectural Constraints Satisfied
- **Backend-Only LLM Calling:** No Gemini credentials (`GEMINI_API_KEY`) or AI SDKs are exposed to the client.
- **Strict Output Validation:** Raw LLM outputs are never trusted directly; they pass through Zod schema validation (`server/src/validators/aiValidator.js`).
- **Prompt Management:** Versioned prompt module at `server/src/prompts/task-assistant.v1.js` separates prompt engineering from controller logic.
- **Review-Before-Save:** The LLM does not write to the database. The client pre-fills the form for human review and confirmation.
- **Non-blocking Fallback:** If the AI service times out, is unavailable, or outputs invalid data, the standard manual task creation form remains 100% usable.

---

## 2. Seven Explicit UI States

The frontend component [`AiTaskAssistant.jsx`](file:///d:/HCMUTE/2627S1/New_Technologies_In_Software_Engineering/MTSE_Project/client/src/components/AiTaskAssistant.jsx) implements all 7 explicit states required by Homework 6B:

1. **`IDLE`**: Clean input prompt box, sample example pills, "Auto-Fill with AI" button.
2. **`LOADING`**: Disabled textarea, animated loading spinner, descriptive status message ("Extracting structured task details...").
3. **`SUCCESS`**: Green feedback banner with checkmark, itemization of inferred elements (title, priority, deadline, checklist count), pre-fills the form fields.
4. **`TIMEOUT`**: Amber alert box with clock icon ("AI request timed out. You can retry with a shorter prompt or continue creating your task manually."), "Retry" and "Continue manually" buttons.
5. **`UNAVAILABLE`**: Orange alert box with offline icon ("AI assistant is currently unavailable... Normal task creation is fully available below.") and "Dismiss" button.
6. **`INVALID_OUTPUT`**: Red/amber alert with warning icon ("Could not recognize a valid task... Please refine your description or fill in details manually.") and "Dismiss" button.
7. **`ERROR`**: Red alert with error icon ("An unexpected error occurred..."), "Retry" and "Continue manually" buttons.

---

## 3. API Contract

### POST `/api/v1/ai/parse-task`

**Request Headers:**
`Content-Type: application/json`

**Request Body:**
```json
{
  "prompt": "Fix responsive navigation bar by Friday 5 PM, high priority, checklist: test on Safari and Chrome Android",
  "context": {
    "nowIso": "2026-10-15T10:00:00.000Z",
    "availableLabels": ["Frontend", "Bug", "Mobile"],
    "projectId": "650e8400-e29b-41d4-a716-446655440001"
  }
}
```

**Success Response (HTTP 200):**
```json
{
  "success": true,
  "data": {
    "isTask": true,
    "title": "Fix responsive navigation bar",
    "description": "Fix responsive navigation bar by Friday 5 PM.",
    "priority": "high",
    "dueAt": "2026-10-16T17:00:00.000Z",
    "labels": ["Frontend", "Bug", "Mobile"],
    "checklist": [
      "Test on Safari",
      "Test on Chrome Android"
    ],
    "confidence": 1.0,
    "rejectionReason": null
  },
  "meta": {
    "model": "gemini-3.5-flash-lite",
    "promptVersion": "v1.0.0",
    "latencyMs": 3450
  }
}
```

**Error Responses:**
- `400 Bad Request` (`ValidationError`): Missing or invalid prompt (< 2 characters or > 2000 characters).
- `422 Unprocessable Entity` (`INVALID_OUTPUT`): LLM returned invalid JSON or violated schema.
- `429 Too Many Requests` (`QUOTA_EXCEEDED`): Gemini API rate limit or quota exceeded.
- `503 Service Unavailable` (`MODEL_UNAVAILABLE` / `AI_NOT_CONFIGURED`): Model unreachable or server API key missing.
- `504 Gateway Timeout` (`MODEL_TIMEOUT`): Upstream model took longer than 30,000ms.

---

## 4. Evaluation & Verification

- Evaluation Runner: [`ai-lab/evaluations/run-evaluation.js`](file:///d:/HCMUTE/2627S1/New_Technologies_In_Software_Engineering/MTSE_Project/ai-lab/evaluations/run-evaluation.js)
- Evaluation Results: [`ai-lab/evaluations/hw6b-task-assistant-eval.json`](file:///d:/HCMUTE/2627S1/New_Technologies_In_Software_Engineering/MTSE_Project/ai-lab/evaluations/hw6b-task-assistant-eval.json)
- Evaluation Report: [`ai-lab/evaluations/hw6b-evaluation-report.md`](file:///d:/HCMUTE/2627S1/New_Technologies_In_Software_Engineering/MTSE_Project/ai-lab/evaluations/hw6b-evaluation-report.md)

### Test Execution Summary
- **Backend Tests:** `server/tests/aiEndpoints.test.js`, `server/tests/aiValidator.test.js`, `server/tests/api.test.js` -> **27 / 27 PASS**
- **Client Tests:** `client/tests/aiTaskAssistant.test.js`, `client/tests/createTaskRefactor.test.js`, etc. -> **122 / 122 PASS**
- **Client Lint:** `npm run lint` -> **0 errors, 0 warnings**
