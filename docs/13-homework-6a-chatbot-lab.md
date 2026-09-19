# 13 - Homework 6A: Chatbot Model Deployment Laboratory

**Course:** New Technologies in Software Engineering
**Milestone:** Homework 6A — Model deployment experiment
**Artifact directory:** [`ai-lab/`](../ai-lab/)
**5A experiment evidence:** [`ai-lab/outputs/results.json`](../ai-lab/outputs/results.json)

---

## 1. Purpose and scope

MAMA is a standalone Gemini chatbot used to test a stable AI integration before Homework 6B. It is intentionally restricted to `ai-lab/`: it has no connection to the main application's client, server, database, calendar, or accounts. Therefore it cannot access or update real tasks, members, reminders, or deadlines.

The chatbot offers general study planning, task organisation, deadline guidance, and uploaded-material assistance. Its UI includes welcome prompts, message copy/delete/regenerate actions, file previews, loading feedback, automatic scrolling, and model/latency metadata.

## 2. Setup and run

Requirements: Node.js 20.19+ and a Gemini API key from Google AI Studio.

```powershell
cd ai-lab
npm install
Copy-Item .env.example .env
```

Set the values below in the ignored `ai-lab/.env` file. Never commit this file.

```dotenv
GEMINI_API_KEY=your_real_key_here
GEMINI_MODEL=gemini-3.6-flash
PORT=3001
```

Run these commands in two terminals:

```powershell
# Terminal 1
npm run server

# Terminal 2
npm run dev
```

Open the localhost address printed by Vite (normally `http://localhost:5173`). The backend health endpoint is `http://localhost:3001/api/health`; it exposes only configuration status and model name, not the key.

## 3. Architecture and safeguards

| Area | Implementation |
|---|---|
| Model call | `ai-lab/server.js` invokes Google Gemini through `@google/genai`. |
| Credential protection | Only the Express backend reads `GEMINI_API_KEY`; the React browser code never receives it. |
| Files | PNG/JPEG/WebP, PDF, TXT, Markdown; maximum five files and 10 MB each. Files are kept in memory only during the request. |
| Failure states | Missing key, unsupported files, empty model responses, unavailable model, and a 30-second timeout return user-visible feedback. |
| Model behavior | The MAMA instruction asks for concise clarification when context is missing and forbids claims of access to project data. |

## 4. Reproducible verification

```powershell
cd ai-lab
npm run check       # builds the production React UI
npm run test:6a     # verifies the 6A files and saved evidence
npm run test:5a -- 1 # optional live request; consumes Gemini quota
```

`npm run check` and `npm run test:6a` completed successfully after this implementation. The 6A check confirms the standalone frontend/backend, prompt suite, results evidence, and verification script exist.

## 5. Existing LLM evidence from Homework 5A

The saved evidence uses Google Gemini Flash-Lite configurations through the Google Gen AI Interactions API. Five recorded requests succeeded, with a mean latency of **6,313.92 ms**. The most recent recorded request used `gemini-3.6-flash`; the remaining earlier evidence identifies its own model in `outputs/results.json`. Live results can vary with quota, network, provider availability, and the selected model.

| 6A requirement | Evidence |
|---|---|
| Hosted model deployment | Gemini call boundary in `ai-lab/server.js`. |
| Five results and latency | Five successes in `ai-lab/outputs/results.json`. |
| Structured output | Test 2 in `ai-lab/prompts/test-cases.js` has a JSON schema and recorded valid JSON. |
| Problematic input | Test 4 is ambiguous; Test 5 contains a false HTTP/3 historical premise. |
| Model/setup/limits | This report, `.env.example`, code, and saved results. |

## 6. Quality, privacy, cost, and operational limitations

- Gemini can be wrong or overly confident. The ambiguous-input evidence contains an unsupported percentage claim, so users must verify important answers.
- Never upload API keys, passwords, JWT/session tokens, production database content, grades, student identifiers, private documents, or confidential course materials.
- Hosted API access can be limited by quota, billing, rate limits, availability, or model changes. The UI reports failures and timeouts, but no automatic retry is used for chatbot requests.
- This lab does not store chat history or uploads. It is not yet integrated with the main product; that work belongs to Homework 6B.
