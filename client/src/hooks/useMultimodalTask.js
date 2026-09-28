import { useCallback, useState } from "react";
import {
  parseTaskFromImage,
  recordMultimodalAudit,
  validateImageFile,
} from "../services/multimodalService";

export function useMultimodalTask({ projectId, labels, showError }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [previewDraft, setPreviewDraft] = useState(null);

  const selectFile = useCallback((file) => {
    try {
      validateImageFile(file);
      setSelectedFile(file);
    } catch (error) {
      setSelectedFile(null);
      showError(error.message);
    }
  }, [showError]);

  const clearPreview = useCallback(() => setPreviewDraft(null), []);

  const parseSelectedImage = useCallback(async () => {
    if (!selectedFile || isParsing) return;
    setIsParsing(true);

    try {
      const availableLabels = (labels || []).map((label) => label?.name || label).filter(Boolean);
      const result = await parseTaskFromImage(selectedFile, { projectId, availableLabels });
      recordMultimodalAudit("parse_succeeded", {
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        model: result.meta?.model,
        latencyMs: result.meta?.latencyMs,
      });
      setPreviewDraft(result);
    } catch (error) {
      recordMultimodalAudit("parse_failed", {
        code: error.code,
        status: error.status,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      });
      showError(error.message || "Could not process the image. Please continue manually.");
    } finally {
      setIsParsing(false);
    }
  }, [isParsing, labels, projectId, selectedFile, showError]);

  return {
    selectedFile,
    isParsing,
    previewDraft,
    selectFile,
    parseSelectedImage,
    clearPreview,
  };
}
