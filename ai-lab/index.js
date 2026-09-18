import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { testCases } from './prompts/test-cases.js';

// Resolve current directory for safe file path handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from ai-lab/.env
dotenv.config({ path: path.join(__dirname, '.env'), quiet: true });

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Checks if the error indicates daily free-tier quota exhaustion.
 */
function isDailyQuotaExhausted(error) {
  const msg = error?.message || '';
  return (
    msg.includes('generate_content_free_tier_requests') ||
    msg.includes('You exceeded your current quota') ||
    msg.includes('limit: 20')
  );
}

/**
 * Checks if the error is a transient rate-limit (429) or stream disruption.
 */
function isTransientRateLimit(error) {
  const msg = error?.message || '';
  return (
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('unusable') ||
    msg.includes('RESOURCE_EXHAUSTED')
  );
}

/**
 * Executes a single API request with strict quota controls:
 * - Daily quota exhaustion errors are NEVER retried.
 * - Other transient 429 errors allow at most ONE retry with a short delay.
 * - Latency measures only the actual API call time.
 */
async function executeApiCall(requestPayload) {
  let attempt = 1;

  while (true) {
    const startTime = performance.now();
    try {
      const ai = new GoogleGenAI({ apiKey });
      const interaction = await ai.interactions.create(requestPayload);
      const endTime = performance.now();
      const latencyMs = Number((endTime - startTime).toFixed(2));
      return { interaction, latencyMs };
    } catch (error) {
      const endTime = performance.now();
      const latencyMs = Number((endTime - startTime).toFixed(2));

      // 1. Fail immediately on daily quota exhaustion
      if (isDailyQuotaExhausted(error)) {
        throw {
          originalError: error,
          isQuotaExhausted: true,
          latencyMs,
          message: error.message,
        };
      }

      // 2. Allow at most ONE retry for other transient 429 / socket errors
      if (isTransientRateLimit(error) && attempt === 1) {
        attempt++;
        let waitMs = 5000;
        const match = error.message?.match(/retry in\s+([0-9.]+)\s*s/i);
        if (match && match[1]) {
          const secs = parseFloat(match[1]);
          // Only retry if requested wait is short (<= 15s); avoid long 30-60s loops
          if (secs <= 15) {
            waitMs = Math.ceil(secs + 1) * 1000;
          } else {
            throw {
              originalError: error,
              isQuotaExhausted: false,
              latencyMs,
              message: error.message,
            };
          }
        }
        console.log(`[Transient 429: Retrying once in ${(waitMs / 1000).toFixed(1)}s...]`);
        await delay(waitMs);
        continue;
      }

      // 3. Fail immediately on other errors or after 1 retry
      throw {
        originalError: error,
        isQuotaExhausted: false,
        latencyMs,
        message: error.message,
      };
    }
  }
}

/**
 * Prints the menu of available test cases when no ID is provided.
 */
function printHelpMenu() {
  console.log('====================================================');
  console.log(' MTSE Homework 5: LLM Experiment Runner');
  console.log('====================================================');
  console.log('Please select a test case to run (1 case per command).\n');
  console.log('Available Test Cases:');
  for (const tc of testCases) {
    console.log(`  [${tc.id}] ${tc.name}`);
    console.log(`      Category: ${tc.category}`);
    console.log(`      Prompt  : "${tc.prompt.slice(0, 70)}${tc.prompt.length > 70 ? '...' : ''}"`);
    console.log('');
  }
  console.log('Usage Examples:');
  console.log('  npm run test:llm -- 1    # Normal text explanation');
  console.log('  npm run test:llm -- 2    # Structured JSON output');
  console.log('  npm run test:llm -- 3    # Text transformation');
  console.log('  npm run test:llm -- 4    # Ambiguous prompt');
  console.log('  npm run test:llm -- 5    # Unsupported/hallucination test\n');
  console.log('Note: Each command sends exactly ONE request to protect Free Tier quota.');
  console.log('====================================================\n');
}

/**
 * Persists or updates the single test result in ai-lab/outputs/results.json.
 */
function saveResult(resultEntry) {
  const outputsDir = path.join(__dirname, 'outputs');
  if (!fs.existsSync(outputsDir)) {
    fs.mkdirSync(outputsDir, { recursive: true });
  }

  const outputPath = path.join(outputsDir, 'results.json');
  let existingData = {
    timestamp: new Date().toISOString(),
    model: modelName,
    summary: {},
    results: [],
  };

  if (fs.existsSync(outputPath)) {
    try {
      const raw = fs.readFileSync(outputPath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.results)) {
        existingData = parsed;
      }
    } catch {
      // Fall back to clean structure
    }
  }

  // Update existing result for this testId or append new one
  const existingIdx = existingData.results.findIndex((r) => r.testId === resultEntry.testId);
  if (existingIdx >= 0) {
    existingData.results[existingIdx] = resultEntry;
  } else {
    existingData.results.push(resultEntry);
  }

  // Sort by testId (1 to 5)
  existingData.results.sort((a, b) => a.testId - b.testId);

  // Calculate summary: exclude quota-exhausted requests from average latency
  const validLatencies = existingData.results.filter(
    (r) => r.status === 'SUCCESS' && typeof r.latencyMs === 'number' && !r.quotaExhausted
  );
  const averageLatencyMs =
    validLatencies.length > 0
      ? Number(
          (validLatencies.reduce((acc, r) => acc + r.latencyMs, 0) / validLatencies.length).toFixed(2)
        )
      : 0;

  existingData.timestamp = new Date().toISOString();
  existingData.model = modelName;
  existingData.summary = {
    totalCompleted: existingData.results.length,
    succeeded: existingData.results.filter((r) => r.status === 'SUCCESS').length,
    failed: existingData.results.filter((r) => r.status === 'FAILURE').length,
    averageLatencyMs,
  };

  fs.writeFileSync(outputPath, JSON.stringify(existingData, null, 2), 'utf8');
}

async function main() {
  // 1. Parse command-line argument for test ID
  const args = process.argv.slice(2).filter((arg) => arg !== '--');
  const targetIdStr = args[0];

  if (!targetIdStr) {
    printHelpMenu();
    process.exit(0);
  }

  const targetId = parseInt(targetIdStr, 10);
  const testCase = testCases.find((tc) => tc.id === targetId);

  if (!testCase) {
    console.error(`\n[ERROR] Test case ID "${targetIdStr}" not found.`);
    console.error(`Valid test case IDs are: ${testCases.map((tc) => tc.id).join(', ')}\n`);
    printHelpMenu();
    process.exit(1);
  }

  // 2. Validate API key
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    console.error('\n[CONFIGURATION ERROR]');
    console.error('GEMINI_API_KEY is missing or contains the default placeholder value.');
    console.error('\nTo run this experiment:');
    console.error('  1. Duplicate .env.example to .env:');
    console.error('       cp .env.example .env');
    console.error('  2. Get an API key from Google AI Studio: https://aistudio.google.com/');
    console.error('  3. Set GEMINI_API_KEY=<your_key> in ai-lab/.env\n');
    process.exit(1);
  }

  console.log('====================================================');
  console.log(` MTSE Homework 5: Test Case ${testCase.id}`);
  console.log('====================================================');
  console.log(`Provider : Google Gen AI (Interactions API)`);
  console.log(`Model    : ${modelName}`);
  console.log(`Test Name: [${testCase.name}]`);
  console.log(`Category : ${testCase.category}`);
  console.log(`Prompt   : "${testCase.prompt}"`);
  console.log('----------------------------------------------------');
  console.log('Sending single request via Interactions API...');

  const requestPayload = {
    model: modelName,
    input: testCase.prompt,
  };

  if (testCase.responseFormat) {
    requestPayload.response_format = testCase.responseFormat;
  }

  let status = 'SUCCESS';
  let responseText = '';
  let latencyMs = 0;
  let jsonValid = testCase.isJson ? 'N/A' : undefined;
  let parsedJson = null;
  let quotaExhausted = false;
  let errorMessage = null;

  try {
    const result = await executeApiCall(requestPayload);
    latencyMs = result.latencyMs;
    const interaction = result.interaction;

    // Extract text output from interaction
    responseText = interaction.output_text;
    if (!responseText && interaction.outputs && interaction.outputs.length > 0) {
      responseText = interaction.outputs
        .filter((out) => out.type === 'text' || out.text)
        .map((out) => out.text)
        .join('\n');
    }
    responseText = responseText ? responseText.trim() : '[No text response received]';

    // Validate JSON if applicable
    if (testCase.isJson) {
      try {
        parsedJson = JSON.parse(responseText);
        jsonValid = true;
        console.log(`\nJSON Status     : JSON VALID`);
      } catch (jsonErr) {
        jsonValid = false;
        console.log(`\nJSON Status     : JSON INVALID (${jsonErr.message})`);
      }
    }

    console.log('\nModel Response:');
    console.log(responseText);
    console.log('----------------------------------------------------');
    console.log(`Request Latency : ${latencyMs} ms (${(latencyMs / 1000).toFixed(2)} s)`);
    console.log(`Status          : ${status}`);
    console.log('====================================================\n');
  } catch (errInfo) {
    latencyMs = errInfo.latencyMs ?? 0;
    status = 'FAILURE';
    errorMessage = errInfo.message ?? String(errInfo);
    quotaExhausted = Boolean(errInfo.isQuotaExhausted);

    console.error('----------------------------------------------------');
    if (quotaExhausted) {
      console.error('[DAILY QUOTA EXHAUSTED]');
      console.error('Google Gemini Free Tier daily limit reached (limit: 20 requests/day).');
      console.error('This request will NOT be retried.');
      console.error(`Details: ${errorMessage}`);
    } else {
      console.error('[TEST FAILED]');
      console.error(`Error message   : ${errorMessage}`);
    }
    console.error(`Measured Latency: ${latencyMs} ms`);
    console.error(`Status          : ${status}`);
    if (testCase.isJson) {
      jsonValid = 'N/A';
      console.error(`JSON Status     : N/A (Failed before response received)`);
    }
    console.error('====================================================\n');
  }

  // Save/update result entry in results.json
  const resultEntry = {
    timestamp: new Date().toISOString(),
    testId: testCase.id,
    testName: testCase.name,
    category: testCase.category,
    prompt: testCase.prompt,
    model: modelName,
    latencyMs,
    response: responseText || null,
    status,
    ...(errorMessage ? { error: errorMessage } : {}),
    ...(quotaExhausted ? { quotaExhausted: true } : {}),
    ...(testCase.isJson ? { jsonValid, ...(parsedJson ? { parsedJson } : {}) } : {}),
  };

  saveResult(resultEntry);
  console.log(`Saved result to: ai-lab/outputs/results.json\n`);

  if (status !== 'SUCCESS') {
    process.exit(1);
  }
}

main();
