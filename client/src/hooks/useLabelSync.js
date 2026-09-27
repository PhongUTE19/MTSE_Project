// src/hooks/useLabelSync.js
import { useCallback } from "react";
import { taskService } from "../services/taskService";
import { useToast } from "../context/ToastContext";

/**
 * Hook that provides a function to refresh label‑related data after a label is
 * renamed or deleted. It fetches the full board data for the given project and
 * returns it to the caller, which can then update its local state.
 *
 * @param {string} projectId The current project identifier.
 * @returns {{ handleLabelsChanged: (change: object) => Promise<any> }}
 */
export default function useLabelSync(projectId) {
  const { showError } = useToast();

  const handleLabelsChanged = useCallback(
    async (change) => {
      if (!projectId) return null;
      try {
        const boardData = await taskService.getBoardData(projectId);
        // Caller is responsible for applying the new data to its state.
        return boardData;
      } catch (err) {
        showError(
          "Failed to refresh board after label change: " + (err?.message || err)
        );
        return null;
      }
    },
    [projectId, showError]
  );

  return { handleLabelsChanged };
}
