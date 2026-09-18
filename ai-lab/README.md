# AI Lab — MTSE Homework 5: AI Readiness Laboratory

This directory contains the standalone laboratory experiment and empirical evaluation for **MTSE Homework 5 (AI Readiness Laboratory)**.

The suite evaluates **Google Gemini 3.1 Flash-Lite** (`gemini-3.1-flash-lite`) across 5 predefined test scenarios using Google's unified **Interactions API**.

All experimental code and evidence are completely isolated in `ai-lab/` with zero dependencies on or modifications to `client/`, `server/`, or the application database.

---

## 1. Homework 5 Requirement Checklist & Evidence

| HW5 Course Requirement | Status | Evidence Location |
|---|---|---|
| **Call one approved hosted or open-source LLM** | ✅ Satisfied | Google Gen AI Hosted API (`gemini-3.1-flash-lite`) via `@google/genai` |
| **Request normal text output and structured JSON output** | ✅ Satisfied | Test 1, 3, 4, 5 (Text) & Test 2 (`response_format` JSON schema) |
| **Test five prompts, including ambiguous or difficult prompt** | ✅ Satisfied | 5 test cases in `prompts/test-cases.js` (ambiguous prompt #4, difficult trap #5) |
| **Record model, configuration, latency, and output quality** | ✅ Satisfied | Persisted in `outputs/results.json` and documented below |
| **Record one observed model weakness or hallucination** | ✅ Satisfied | Recorded in Test 4 (unsupported "90% of performance issues..." claim) |
| **Compare two models or configurations when access permits** | ⚠️ Documented | Full comparison incomplete due to daily quota exhaustion on `gemini-3.6-flash` (see Section 6) |
| **Identify private or confidential data prohibited from service** | ✅ Satisfied | Documented in Section 7 (Supabase keys, student PII, credentials) |

---

## 2. Selected Model & Provider Configuration

- **Model Identifier:** `gemini-3.1-flash-lite`
- **Provider:** Google Gen AI (Hosted API)
- **SDK:** `@google/genai` (v2.22.0)
- **Interface:** Interactions API (`ai.interactions.create`)
- **Configuration Source:** Environment variable `GEMINI_MODEL=gemini-3.1-flash-lite` in `ai-lab/.env`
- **Authentication:** `GEMINI_API_KEY` loaded securely via `dotenv` (never committed to git)

---

## 3. How to Run the Experiment

To respect and protect Google Gemini Free Tier daily limits (20 requests/day), the runner executes **one test case at a time** per command:

```bash
# View available test cases and instructions without calling the API:
npm run test:llm

# Run individual test cases (1 request per command):
npm run test:llm -- 1    # Test 1: Normal Text Explanation
npm run test:llm -- 2    # Test 2: Structured JSON Output
npm run test:llm -- 3    # Test 3: Text Transformation
npm run test:llm -- 4    # Test 4: Ambiguous Prompt
npm run test:llm -- 5    # Test 5: Hallucination / Unsupported Claims Trap
```
*(Alternatively: `node index.js <id>`)*

---

## 4. Analysis of the 5 Test Cases

Detailed records are stored in [`ai-lab/outputs/results.json`](file:///d:/HCMUTE/2627S1/New_Technologies_In_Software_Engineering/MTSE_Project/ai-lab/outputs/results.json).

### Test Case 1: Normal Text Explanation (`explanation`)
- **Prompt:** *"In 2-3 clear sentences, explain the difference between latency and throughput in client-server web applications."*
- **Measured Latency:** **5701.27 ms** (5.70 s)
- **Model Output:**
  > "**Latency** is the time it takes for a single request to travel from the client to the server and back, essentially measuring the delay or "speed" of a connection. **Throughput**, by contrast, measures the total amount of data or number of requests a system can successfully process within a specific timeframe, focusing on overall capacity rather than individual speed."
- **Quality Observation:** High quality. Clearly distinguishes between per-request turnaround time (latency) and cumulative data/request capacity over time (throughput). Complies with the 2-3 sentence constraint.

---

### Test Case 2: Structured JSON Output (`structured_json`)
- **Prompt:** *"Extract the following student project task into a JSON object: 'Task: Implement JWT authentication middleware for REST API. Assignee: Nguyen Van B (ID: 21110123). Priority: High. Due date: 2026-10-15. Status: In Progress.'"*
- **Measured Latency:** **4254.46 ms** (4.25 s)
- **JSON Validation Status:** **`JSON VALID`**
- **Model Output:**
  ```json
  {
    "task": "Implement JWT authentication middleware for REST API",
    "assignee": {
      "name": "Nguyen Van B",
      "student_id": "21110123"
    },
    "priority": "High",
    "due_date": "2026-10-15",
    "status": "In Progress"
  }
  ```
- **Quality Observation:** Strict schema compliance. The Interactions API enforced the JSON schema specified in `response_format`. The output parsed cleanly via `JSON.parse()` with zero syntax errors, correctly nesting the `assignee` object.

---

### Test Case 3: Text Transformation (`transformation`)
- **Prompt:** *"Convert the following informal meeting notes into 3 concise, actionable task items formatted with markdown bullet points: 'Meeting notes: We talked about how the dashboard takes too long to load tasks so someone needs to add query caching, also Minh noticed button colors look weird on mobile so need to fix css, and we should write unit tests for the login route before Friday.'"*
- **Measured Latency:** **4318.44 ms** (4.32 s)
- **Model Output:**
  > "Here are the actionable task items:
  > * **Implement query caching** to improve dashboard task loading speeds.
  > * **Fix mobile CSS issues** to correct button display errors.
  > * **Write unit tests** for the login route by this Friday."
- **Quality Observation:** Excellent synthesis. Successfully parsed unstructured, conversational text, extracted the core deliverables, and formatted them into professional, actionable work items.

---

### Test Case 4: Ambiguous Prompt & Observed Model Weakness (`ambiguity`)
- **Prompt:** *"Fix it so that the application works better and make it fast."*
- **Measured Latency:** **6546.87 ms** (6.55 s)
- **Model Output Summary:** The model provided a structured performance checklist (database indexes, caching, lazy loading, profiling) and politely requested context (stack, problem details, code snippets).
- **Observed Weakness / Failure:**
  > **Unsupported Statistical Claim:** Within the response, the model asserted:
  > *"However, **90% of performance issues fall into one of these five categories.**"*
  > This is a classic LLM tendency to invent precise-sounding statistics to sound authoritative. The model provided no citation, empirical benchmark, or documentation to support the "90%" figure, making it an unsupported factual claim.

---

### Test Case 5: Hallucination / Unsupported Claims Trap (`hallucination_trap`)
- **Prompt:** *"Detail the official RFC specification for HTTP/3 published by the IETF in the year 1999, including its original packet header format."*
- **Measured Latency:** **6370.11 ms** (6.37 s)
- **Model Output Summary:**
  > "To provide an accurate answer, it is necessary to clarify a historical misconception regarding the timeline of HTTP evolution:
  > **There is no HTTP/3 RFC published in 1999.**
  > In 1999, the Internet Engineering Task Force (IETF) published **RFC 2616**, which defined **HTTP/1.1**... HTTP/3 was published (**RFC 9114**) in 2022, which shifted the transport layer from TCP to **QUIC**..."
- **Quality Observation:** Strong factual grounding and resistance to false premises. The model correctly identified and rejected the false historical premise embedded in the prompt rather than hallucinating a fictional 1999 HTTP/3 packet header.

---

## 5. Latency Summary Table

| Test Case | Category | Latency (ms) | Latency (s) | Status |
|---|---|---|---|---|
| **1. Normal Text Explanation** | Explanation | 5,701.27 ms | 5.70 s | SUCCESS |
| **2. Structured JSON Output** | Structured JSON | 4,254.46 ms | 4.25 s | SUCCESS |
| **3. Text Transformation** | Transformation | 4,318.44 ms | 4.32 s | SUCCESS |
| **4. Ambiguous Prompt** | Ambiguity | 6,546.87 ms | 6.55 s | SUCCESS |
| **5. Hallucination Trap** | Hallucination Defense | 6,370.11 ms | 6.37 s | SUCCESS |
| **Average Across All 5 Tests** | — | **5,438.23 ms** | **5.44 s** | **100% Pass** |

*Note: Latency is captured with high precision (`performance.now()`) measuring strictly the network roundtrip of the model request.*

---

## 6. Model Comparison Note

* **Course Requirement:** *"Compare two models or configurations when access permits."*
* **Observation:** During initial experimentation, requests were sent to **`gemini-3.6-flash`**. However, the `gemini-3.6-flash` project reached its daily quota limit on the Google AI Studio Free Tier (`generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20`).
* **Integrity Statement:** In strict accordance with academic integrity and course principles, **comparison results were not fabricated or simulated**. The entire benchmark suite of 5 test cases was successfully executed and validated on **`gemini-3.1-flash-lite`**, which delivered consistent sub-7-second latencies and 100% execution success.

---

## 7. Private & Confidential Data Policy

In accordance with course security requirements, the following project assets and data types **must never be transmitted** to external hosted LLM services (such as Google AI Studio, OpenAI, or Anthropic):

1. **Service Role Keys & Secrets:** Supabase service role keys (`SUPABASE_SERVICE_ROLE_KEY`), JWT signing secrets, database master passwords, and administrative API credentials.
2. **Student Personal Identifiable Information (PII):** Student ID numbers (MSSV), full names, email addresses, personal phone numbers, and academic performance/grading records.
3. **Internal Academic Materials:** Unreleased assignment solutions, exam rubrics, private grading algorithms, or confidential instructor keys.
4. **Proprietary Application Data:** Production database backups, customer session cookies, and private user task content without consent.

---

## 8. Quota & Retry Behavior

- **Daily Quota Limit (`limit: 20`):** The runner inspects error messages for `generate_content_free_tier_requests` or `limit: 20`. When detected, it **fails immediately with zero retries** to avoid pointless delays.
- **Transient 429 Errors:** Allows at most **one retry** if the requested cooldown is brief ($\le 15$s).
- **Latency Isolation:** Backoff waiting times are strictly excluded from reported latency numbers.
