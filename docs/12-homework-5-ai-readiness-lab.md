# 12 - Homework 5: AI Readiness Laboratory

**Course:** New Technologies in Software Engineering  
**Milestone:** Homework 5 — AI Readiness Laboratory  
**Artifact Directory:** [`ai-lab/`](file:///d:/HCMUTE/2627S1/New_Technologies_In_Software_Engineering/MTSE_Project/ai-lab)  
**Evidence Results:** [`ai-lab/outputs/results.json`](file:///d:/HCMUTE/2627S1/New_Technologies_In_Software_Engineering/MTSE_Project/ai-lab/outputs/results.json)  
**Primary Report & Guide:** [`ai-lab/README.md`](file:///d:/HCMUTE/2627S1/New_Technologies_In_Software_Engineering/MTSE_Project/ai-lab/README.md)  

---

## 1. Requirement Checklist & Evidence Summary

| HW5 Requirement | Status | Summary Evidence |
|---|---|---|
| **1. Call one approved hosted/open-source LLM** | ✅ Complete | Google Gen AI Hosted API (`gemini-3.1-flash-lite`) via `@google/genai` Interactions API. |
| **2. Request normal text & structured JSON output** | ✅ Complete | Tests 1, 3, 4, 5 returned text; Test 2 returned schema-enforced JSON (`JSON VALID`). |
| **3. Test five prompts (including ambiguous & difficult)** | ✅ Complete | 5 test cases executed in [`ai-lab/prompts/test-cases.js`](file:///d:/HCMUTE/2627S1/New_Technologies_In_Software_Engineering/MTSE_Project/ai-lab/prompts/test-cases.js). |
| **4. Record model, configuration, latency, and quality** | ✅ Complete | Latencies ranged from 4,254.46 ms to 6,546.87 ms (average 5,438.23 ms). Persisted in `results.json`. |
| **5. Record one failure or hallucination** | ✅ Complete | In Test 4 (Ambiguous prompt), model fabricated an unsupported claim: *"90% of performance issues fall into one of these five categories."* |
| **6. Compare two models when access permits** | ⚠️ Documented | Full comparison incomplete due to daily quota exhaustion (20 requests/day) on `gemini-3.6-flash`. No data fabricated. |
| **7. Identify private or confidential data** | ✅ Complete | Prohibited: Supabase service keys, student PII (MSSV, names), database credentials, private grading rubrics. |

---

## 2. Test Execution Commands

```bash
# Display test menu without making API calls:
npm run test:llm

# Run specific test cases (1 request per command):
npm run test:llm -- 1    # Normal text explanation
npm run test:llm -- 2    # Structured JSON output
npm run test:llm -- 3    # Text transformation
npm run test:llm -- 4    # Ambiguous prompt
npm run test:llm -- 5    # Hallucination / Unsupported claims trap
```

---

## 3. Results Summary Table

| Test Case | Category | Latency (ms) | Status | Quality Observation |
|---|---|---|---|---|
| **1. Normal Text Explanation** | Explanation | 5,701.27 ms | SUCCESS | Clear distinction between per-request latency vs throughput capacity. |
| **2. Structured JSON Output** | Structured JSON | 4,254.46 ms | SUCCESS | Validated by `JSON.parse()` (`JSON VALID`); strict schema compliance. |
| **3. Text Transformation** | Transformation | 4,318.44 ms | SUCCESS | Converted noisy meeting notes into 3 concise task bullets. |
| **4. Ambiguous Prompt** | Ambiguity | 6,546.87 ms | SUCCESS | Asked clarifying questions, but stated unsupported claim (*"90% of issues..."*). |
| **5. Hallucination Trap** | Hallucination Defense | 6,370.11 ms | SUCCESS | Correctly rejected false premise (HTTP/3 in 1999) rather than hallucinating fake RFC. |
| **Overall Average** | — | **5,438.23 ms** | **100% Pass** | All 5 test cases completed with zero failures. |

---

## 4. Academic Integrity & Confidential Data Notice

1. **Model Comparison Note:** A complete cross-model comparison against `gemini-3.6-flash` was not completed because the project reached its Google AI Studio Free Tier daily quota limit (`limit: 20 requests/day`). In accordance with academic integrity, data was not fabricated.
2. **Confidentiality:** Application secrets (e.g. `SUPABASE_SERVICE_ROLE_KEY`), student identities (`MSSV`), and database credentials must never be passed into hosted model prompts.
