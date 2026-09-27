import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import request from "supertest";
import { errorHandler } from "../src/middlewares/errorHandler.js";
import {
  MAX_IMAGE_SIZE_BYTES,
  uploadSingleImage,
} from "../src/middlewares/upload.js";

const app = express();

app.post("/upload", uploadSingleImage, (req, res) => {
  res.status(200).json({
    mimetype: req.file.mimetype,
    originalname: req.file.originalname,
    size: req.file.size,
    hasBuffer: Buffer.isBuffer(req.file.buffer),
    bufferContents: req.file.buffer.toString("utf8"),
  });
});

app.use(errorHandler);

async function expectAcceptedUpload({ filename, contentType }) {
  const content = "image-content";
  const response = await request(app)
    .post("/upload")
    .attach("file", Buffer.from(content), { filename, contentType })
    .expect(200);

  assert.equal(response.body.mimetype, contentType);
  assert.equal(response.body.originalname, filename);
  assert.equal(response.body.size, Buffer.byteLength(content));
  assert.equal(response.body.hasBuffer, true);
  assert.equal(response.body.bufferContents, content);
}

test("accepts PNG, JPEG, JPG MIME, and WebP uploads in memory", async () => {
  await expectAcceptedUpload({ filename: "task.png", contentType: "image/png" });
  await expectAcceptedUpload({ filename: "task.jpeg", contentType: "image/jpeg" });
  await expectAcceptedUpload({ filename: "task.jpg", contentType: "image/jpg" });
  await expectAcceptedUpload({ filename: "task.webp", contentType: "image/webp" });
});

test("rejects GIF, PDF, and executable MIME types with UNSUPPORTED_FILE_TYPE", async () => {
  for (const [filename, contentType] of [
    ["animation.gif", "image/gif"],
    ["brief.pdf", "application/pdf"],
    ["program.exe", "application/x-msdownload"],
  ]) {
    const response = await request(app)
      .post("/upload")
      .attach("file", Buffer.from("untrusted-content"), { filename, contentType })
      .expect(400);

    assert.deepEqual(response.body, {
      error: "UNSUPPORTED_FILE_TYPE",
      message: "Unsupported file type. Upload a PNG, JPEG, JPG, or WebP image.",
    });
  }
});

test("rejects files larger than 10 MB with FILE_TOO_LARGE", async () => {
  const response = await request(app)
    .post("/upload")
    .attach("file", Buffer.alloc(MAX_IMAGE_SIZE_BYTES + 1), {
      filename: "large.png",
      contentType: "image/png",
    })
    .expect(413);

  assert.equal(response.body.error, "FILE_TOO_LARGE");
  assert.match(response.body.message, /10 MB/);
});

test("rejects a missing file and more than one file with INVALID_INPUT", async () => {
  const missing = await request(app).post("/upload").expect(400);
  assert.equal(missing.body.error, "INVALID_INPUT");

  const multiple = await request(app)
    .post("/upload")
    .attach("file", Buffer.from("first"), { filename: "first.png", contentType: "image/png" })
    .attach("file", Buffer.from("second"), { filename: "second.png", contentType: "image/png" })
    .expect(400);

  assert.equal(multiple.body.error, "INVALID_INPUT");
  assert.match(multiple.body.message, /one image/i);
});
