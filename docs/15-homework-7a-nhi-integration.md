# 15 Homework 7A Nhi MANA Integration

## Scope

This contribution implements the MANA side of the Multimodal track. The backend owned by Như turns one image into a structured task draft. This client integration validates that draft, lets the user review it, and uses the existing task-create workflow only after the user confirms.

## User flow

1. From **Create New Task**, the user selects one PNG, JPEG, or WebP image up to 20 MB.
2. The client rejects an unsupported or oversized file before it is uploaded.
3. The client sends `multipart/form-data` to `POST /api/v1/ai/multimodal-parse`, including project context and the project labels.
4. The returned task draft is normalized defensively. Unknown fields are dropped and labels not belonging to the project are not applied.
5. A preview shows the extracted values and warnings. A deadline that is absent remains absent; the AI never invents one.
6. **Use draft in form** only pre-fills the ordinary MANA task form. The user must still press **Create Task** to write to Supabase.

## Backend contract consumed

```json
{
  "success": true,
  "data": {
    "isTask": true,
    "title": "Fix responsive navigation bar",
    "description": "Navbar breaks on mobile screens.",
    "priority": "high",
    "dueAt": "2026-10-18T17:00:00.000Z",
    "labels": ["Frontend"],
    "checklist": ["Test on iOS Safari"],
    "confidence": 0.95,
    "rejectionReason": null
  },
  "meta": { "model": "gemini-3.5-flash-lite", "promptVersion": "v1.0.0", "latencyMs": 3450 }
}
```

The client supports `UNSUPPORTED_FILE_TYPE`, `FILE_TOO_LARGE`, `INVALID_OUTPUT`, `MODEL_TIMEOUT`, `MODEL_UNAVAILABLE`, `AI_NOT_CONFIGURED`, `QUOTA_EXCEEDED`, and network failures. Every failure leaves the ordinary manual form available.

## Security boundaries

- The browser does not receive a Gemini key.
- The AI request cannot create or modify a task.
- The selected image and its contents are never written to browser storage by this feature.
- Client audit events contain only technical metadata (event, file MIME type/size, code, model and latency); they intentionally exclude image contents and task text.
- Output is treated as untrusted: only expected task fields are accepted, dates must be parseable, priority is allow-listed, and project-unknown labels are removed.

## Evidence and tests

`client/tests/multimodalService.test.js` covers invalid type, maximum size, output filtering, label filtering and malformed output. The browser console contains `[multimodal-audit]` records for successful and failed parse attempts for the demonstration trace.

## Integration checklist for Như

- Register `POST /api/v1/ai/multimodal-parse` on the Express server.
- Accept exactly one `file` plus JSON-string `context` as `multipart/form-data`.
- Return the response shape above and do not persist a task.
- Enforce the same image whitelist and 20 MB maximum on the server.
- Return one of the documented error codes with `{ "error", "message" }` on failure.
