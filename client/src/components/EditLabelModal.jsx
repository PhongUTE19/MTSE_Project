import { useState } from "react";
import { getLabelColor } from "../utils/constants";
import "../styles/EditLabelModal.css";

const COLOR_PALETTE = [
  "#baf3db", "#f8e6a0", "#f5cd47", "#fedec8", "#eac7f0",
  "#4bce97", "#e2b203", "#f87462", "#9f8fef", "#1f845a",
  "#946f00", "#b38600", "#ae2e24", "#5e4db2", "#cce0ff",
  "#c1e5ff", "#fdd0ec", "#dcdfe4", "#579dff", "#94c748",
  "#e774bb", "#8590a2", "#0c66e4", "#5b7f24", "#44546f",
];

export default function EditLabelModal({ label, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(label?.name || "");
  const [color, setColor] = useState(label?.color || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (title.trim().length < 2) {
      setError("Label name must be at least 2 characters.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await onSave({ name: title.trim(), color: color || getLabelColor(title) });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this label? It will be removed from all tasks.")) return;
    setIsSaving(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  return (
    <div className="edit-label-overlay" onClick={onClose}>
      <div className="edit-label-modal" onClick={(event) => event.stopPropagation()}>
        <header className="edit-label-header">
          <button type="button" onClick={onClose}>←</button>
          <h3>{label ? "Edit label" : "Create label"}</h3>
          <button type="button" onClick={onClose}>✕</button>
        </header>
        <div className="label-preview">
          <span className="label-badge large" style={{ background: color || "#dfe1e6" }}>
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
            {COLOR_PALETTE.map((paletteColor) => (
              <button
                key={paletteColor}
                type="button"
                className={`color-swatch ${paletteColor === color ? "selected" : ""}`}
                style={{ background: paletteColor }}
                onClick={() => setColor(paletteColor)}
                title={paletteColor}
              >
                {paletteColor === color && <span className="checkmark">✓</span>}
              </button>
            ))}
          </div>
        </div>
        {color && <button type="button" className="btn-remove-color" onClick={() => setColor("")}>✕ Remove color</button>}
        {error && <p className="edit-label-error">{error}</p>}
        <div className="edit-label-actions">
          <button type="button" className="btn-save" onClick={handleSave} disabled={!title.trim() || isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
          {label && <button type="button" className="btn-delete" onClick={handleDelete} disabled={isSaving}>Delete</button>}
        </div>
      </div>
    </div>
  );
}
