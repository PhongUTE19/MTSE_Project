import { ArrowLeft, Check, X } from "lucide-react";
import { useState } from "react";
import { getLabelColor, LABEL_COLOR_PALETTE } from "../utils/constants";
import { useToast } from "../context/ToastContext";
import ConfirmDialog from "./ConfirmDialog";
import "../styles/EditLabelModal.css";

export default function EditLabelModal({ label, onSave, onDelete, onClose }) {
  const { showError } = useToast();
  const [title, setTitle] = useState(label?.name || "");
  const [color, setColor] = useState(label?.color || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleSave = async () => {
    if (title.trim().length < 2) {
      showError("Label name must be at least 2 characters.");
      return;
    }
    setIsSaving(true);
    try {
      await onSave({ name: title.trim(), color: color || getLabelColor(title) });
      onClose();
    } catch (err) {
      showError(err.message || "Failed to save label.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsSaving(true);
    try {
      await onDelete();
      setShowConfirmDelete(false);
      onClose();
    } catch (err) {
      showError(err.message || "Failed to delete label.");
      setIsSaving(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="edit-label-overlay" onClick={onClose}>
      <div className="edit-label-modal" onClick={(event) => event.stopPropagation()}>
        <header className="edit-label-header">
          <button type="button" onClick={onClose} aria-label="Back"><ArrowLeft size={18} aria-hidden="true" /></button>
          <h3>{label ? "Edit label" : "Create label"}</h3>
          <button type="button" onClick={onClose} aria-label="Close"><X size={18} aria-hidden="true" /></button>
        </header>
        <div className="label-preview">
          <span className="label-badge large" style={{ "--label-color": color || "#dfe1e6" }}>
            {title || "Label preview"}
          </span>
        </div>
        <div className="form-group">
          <label htmlFor="label-title">Title</label>
          <input id="label-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Label name" autoFocus />
        </div>
        <div className="form-group">
          <label>Select a color</label>
          <div className="color-palette">
            {LABEL_COLOR_PALETTE.map((paletteColor) => (
              <button
                key={paletteColor}
                type="button"
                className={`color-swatch ${paletteColor === color ? "selected" : ""}`}
                style={{ "--label-color": paletteColor }}
                onClick={() => setColor(paletteColor)}
                title={paletteColor}
              >
                {paletteColor === color && <Check size={18} aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
        {color && <button type="button" className="btn-remove-color" onClick={() => setColor("")}><X size={18} aria-hidden="true" /> Remove color</button>}
        <div className="edit-label-actions">
          <button type="button" className="btn-save" onClick={handleSave} disabled={!title.trim() || isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
          {label && (
            <button
              type="button"
              className="btn-delete"
              onClick={() => setShowConfirmDelete(true)}
              disabled={isSaving}
            >
              Delete
            </button>
          )}
        </div>

        <ConfirmDialog
          isOpen={showConfirmDelete}
          title="Delete Label"
          message={
            <>
              Are you sure you want to delete label <strong>"{label?.name}"</strong>? It will be removed from all tasks.
            </>
          }
          confirmText="Delete Label"
          isLoading={isSaving}
          onConfirm={handleConfirmDelete}
          onCancel={() => !isSaving && setShowConfirmDelete(false)}
        />
      </div>
    </div>
  );
}
