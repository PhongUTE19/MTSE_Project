import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MULTIMODAL_PROMPT_VERSION,
  MULTIMODAL_RESPONSE_SCHEMA,
  MULTIMODAL_SYSTEM_INSTRUCTION,
  buildMultimodalPrompt,
} from "../src/prompts/multimodal-task-extract.v1.js";

test("exports the versioned multimodal prompt and builds default context", () => {
  assert.equal(MULTIMODAL_PROMPT_VERSION, "v1.0.0");
  assert.equal(typeof MULTIMODAL_SYSTEM_INSTRUCTION, "string");
  assert.equal(typeof buildMultimodalPrompt, "function");
  assert.match(buildMultimodalPrompt(), /Current Reference Time \(ISO\): \d{4}-\d{2}-\d{2}T/);
  assert.match(buildMultimodalPrompt(), /Available Project Labels: None specified/);
});

test("includes supplied trusted time and available labels in multimodal context", () => {
  const prompt = buildMultimodalPrompt({
    nowIso: "2026-10-15T10:00:00.000Z",
    availableLabels: ["Frontend", "Bug", "Mobile"],
  });

  assert.match(prompt, /2026-10-15T10:00:00.000Z/);
  assert.match(prompt, /Frontend, Bug, Mobile/);
});

test("system instruction covers safety, bilingual support, and the one-task policy", () => {
  assert.match(MULTIMODAL_SYSTEM_INSTRUCTION, /Never invent or assume a deadline/i);
  assert.match(MULTIMODAL_SYSTEM_INSTRUCTION, /untrusted data/i);
  assert.match(MULTIMODAL_SYSTEM_INSTRUCTION, /Vietnamese and English/i);
  assert.match(MULTIMODAL_SYSTEM_INSTRUCTION, /multiple independent tasks/i);
  assert.match(MULTIMODAL_SYSTEM_INSTRUCTION, /credentials/i);
});

test("response schema represents every application field and nullable scalars", () => {
  const expectedFields = [
    "isTask", "title", "description", "priority", "dueAt", "labels",
    "checklist", "confidence", "rejectionReason",
  ];

  assert.deepEqual(MULTIMODAL_RESPONSE_SCHEMA.required, expectedFields);
  assert.deepEqual(Object.keys(MULTIMODAL_RESPONSE_SCHEMA.properties), expectedFields);
  assert.equal(MULTIMODAL_RESPONSE_SCHEMA.properties.priority.nullable, true);
  assert.equal(MULTIMODAL_RESPONSE_SCHEMA.properties.dueAt.nullable, true);
  assert.equal(MULTIMODAL_RESPONSE_SCHEMA.properties.rejectionReason.nullable, true);
  assert.deepEqual(MULTIMODAL_RESPONSE_SCHEMA.properties.priority.enum, ["low", "medium", "high"]);
});
