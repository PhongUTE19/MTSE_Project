// src/components/ConfirmDialog.jsx
import { AlertTriangle } from "lucide-react";
import "../styles/ConfirmDialog.css";

/**
 * Reusable in-app confirmation modal dialog.
 * Replaces browser-native window.confirm() with consistent design system UI.
 */
export default function ConfirmDialog({
  isOpen,
  title = "Confirm Action",
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="confirm-dialog-overlay"
      onClick={() => !isLoading && onCancel()}
    >
      <div
        className="confirm-dialog-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <h3 id="confirm-dialog-title" className="confirm-dialog-title">
          <AlertTriangle size={18} aria-hidden="true" /> {title}
        </h3>
        <div className="confirm-dialog-body">
          {message}
        </div>
        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="btn-confirm-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={isDestructive ? "btn-confirm-danger" : "btn-primary"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
