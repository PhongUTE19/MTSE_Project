import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const multimodalFiles = [
  "../src/controllers/multimodalController.js",
  "../src/services/multimodalService.js",
];

test("multimodal backend has no database or task-creation coupling", () => {
  for (const relativeFile of multimodalFiles) {
    const source = fs.readFileSync(path.resolve(testDirectory, relativeFile), "utf8");

    assert.doesNotMatch(source, /supabase/i);
    assert.doesNotMatch(source, /taskService/i);
    assert.doesNotMatch(source, /\.from\s*\(/);
    assert.doesNotMatch(source, /\.insert\s*\(/);
  }
});
