import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const requiredFiles = [
  "server.js",
  "src/App.jsx",
  "src/components/ChatInput.jsx",
  "src/components/Message.jsx",
  "prompts/test-cases.js",
  "outputs/results.json"
];

const missing = requiredFiles.filter(
  (file) => !fs.existsSync(path.join(__dirname, file))
);

if (missing.length > 0) {
  console.error(`6A setup check failed. Missing: ${missing.join(", ")}`);
  process.exit(1);
}

const results = JSON.parse(
  fs.readFileSync(path.join(__dirname, "outputs/results.json"), "utf8")
);
const completed = results.results?.filter((result) => result.status === "SUCCESS") ?? [];

console.log("Homework 6A setup check passed.");
console.log(`Model evidence: ${results.model}`);
console.log(`Successful recorded requests: ${completed.length}/5`);
console.log("Run `npm run server` and `npm run dev` to use the standalone chatbot.");
