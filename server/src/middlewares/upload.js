import multer from "multer";

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

function createUploadError(message, { code, status }) {
  const error = new Error(message);
  error.name = "UploadValidationError";
  error.code = code;
  error.status = status;
  return error;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: MAX_IMAGE_SIZE_BYTES,
  },
  fileFilter(req, file, callback) {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      callback(createUploadError(
        "Unsupported file type. Upload a PNG, JPEG, JPG, or WebP image.",
        { code: "UNSUPPORTED_FILE_TYPE", status: 400 }
      ));
      return;
    }

    callback(null, true);
  },
});

/**
 * Converts Multer's implementation-specific errors to the public API contract.
 */
export function mapUploadError(error) {
  if (!error || error.name === "UploadValidationError") return error;

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return createUploadError(
        "Image file size must not exceed 10 MB.",
        { code: "FILE_TOO_LARGE", status: 413 }
      );
    }

    if (error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE") {
      return createUploadError(
        "Exactly one image file is allowed.",
        { code: "INVALID_INPUT", status: 400 }
      );
    }
  }

  return createUploadError(
    "Invalid image upload.",
    { code: "INVALID_INPUT", status: 400 }
  );
}

/**
 * Parses exactly one `file` field into memory for the future multimodal service.
 * Multer exposes accepted uploads as req.file, including buffer, mimetype,
 * originalname, and size; nothing is persisted to disk.
 */
export function uploadSingleImage(req, res, next) {
  upload.single("file")(req, res, (error) => {
    if (error) {
      next(mapUploadError(error));
      return;
    }

    if (!req.file) {
      next(createUploadError(
        "An image file is required.",
        { code: "INVALID_INPUT", status: 400 }
      ));
      return;
    }

    next();
  });
}
