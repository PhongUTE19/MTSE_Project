import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const REQUEST_TIMEOUT_MS = 30_000;
const SUPPORTED_FILE_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown"
]);
const SYSTEM_INSTRUCTION = `You are MAMA, a friendly AI assistant in a standalone
laboratory prototype for university students. Help with general study planning,
task organization, deadlines, and uploaded material. Do not claim access to the
student's real project, calendar, database, or private records. Ask a concise
clarifying question when information is missing. Never invent facts or deadlines.`;

function getPublicError(error) {
  const detail = String(error?.message || "");
  const normalized = detail.toLowerCase();

  if (detail === "MODEL_TIMEOUT") {
    return { status: 504, message: "The model took too long to respond. Please try again." };
  }
  if (normalized.includes("api key") || normalized.includes("permission") || normalized.includes("unauthenticated")) {
    return { status: 401, message: "Gemini rejected the API key. Check GEMINI_API_KEY in ai-lab/.env." };
  }
  if (normalized.includes("model") && (normalized.includes("not found") || normalized.includes("not supported"))) {
    return { status: 503, message: `The configured Gemini model (${MODEL}) is unavailable. Check GEMINI_MODEL in ai-lab/.env.` };
  }
  if (normalized.includes("quota") || normalized.includes("resource_exhausted") || normalized.includes("429")) {
    return { status: 429, message: "Gemini quota or rate limit has been reached. Please wait and try again." };
  }
  if (normalized.includes("fetch failed") || normalized.includes("network") || normalized.includes("enotfound")) {
    return { status: 503, message: "The server cannot reach Gemini. Check your Internet connection, VPN, or firewall, then retry." };
  }
  return { status: 502, message: "The model is currently unavailable. Please try again shortly." };
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("MAMA Chatbot server is running");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    model: MODEL,
    configured: Boolean(process.env.GEMINI_API_KEY)
  });
});

app.post(
  "/api/chat",
  upload.array("files", 5),
  async (req, res) => {
    try {
      const message = req.body.message || "";
      const files = req.files || [];

      if (!message.trim() && files.length === 0) {
        return res.status(400).json({
          error: "Message or file is required"
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: "Gemini API key is not configured. Copy .env.example to .env and add GEMINI_API_KEY."
        });
      }

      const parts = [{ text: SYSTEM_INSTRUCTION }];

      if (message.trim()) {
        parts.push({
          text: message
        });
      }

      for (const file of files) {
        if (file.mimetype.startsWith("image/")) {
          parts.push({
            inlineData: {
              mimeType: file.mimetype,
              data: file.buffer.toString("base64")
            }
          });

          continue;
        }

        if (file.mimetype === "application/pdf") {
          parts.push({
            inlineData: {
              mimeType: file.mimetype,
              data: file.buffer.toString("base64")
            }
          });

          continue;
        }

        if (SUPPORTED_FILE_TYPES.has(file.mimetype)) {
          parts.push({
            text: `
File name: ${file.originalname}

File content:
${file.buffer.toString("utf8")}
`
          });

          continue;
        }

        return res.status(400).json({
          error: `Unsupported file type: ${file.originalname}`
        });
      }

      const start = Date.now();
      let timeoutId;
      let response;

      try {
        response = await Promise.race([
          ai.models.generateContent({
            model: MODEL,
            contents: [{ role: "user", parts }]
          }),
          new Promise((_, reject) => {
            timeoutId = setTimeout(
              () => reject(new Error("MODEL_TIMEOUT")),
              REQUEST_TIMEOUT_MS
            );
          })
        ]);
      } finally {
        clearTimeout(timeoutId);
      }

      const latency = Date.now() - start;

      if (!response.text?.trim()) {
        return res.status(502).json({
          error: "Gemini returned an empty response. Please try again."
        });
      }

      res.json({
        reply: response.text,
        latency,
        model: MODEL
      });
    } catch (error) {
      console.error("Gemini request failed:", error.message);
      const publicError = getPublicError(error);
      res.status(publicError.status).json({ error: publicError.message });
    }
  }
);

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      error:
        error.code === "LIMIT_FILE_SIZE"
          ? "File must be smaller than 10 MB"
          : error.message
    });
  }

  next(error);
});

app.listen(PORT, () => {
  console.log(
    `MAMA server running at http://localhost:${PORT}`
  );
});
