// src/components/taskDetail/TaskDescription.jsx
import { AlignLeft } from "lucide-react";
import { useState } from "react";

export default function TaskDescription({ description, onSaveDescription }) {
  const [isEditing, setIsEditing] = useState(false);
  const [descInput, setDescInput] = useState("");

  const handleStartEdit = () => {
    setDescInput(description || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    onSaveDescription(descInput);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div>
      <h3 className="section-title">
        <div className="section-title-left">
          <AlignLeft size={18} aria-hidden="true" /> Description
        </div>
      </h3>

      {isEditing ? (
        <div>
          <textarea
            value={descInput}
            onChange={(e) => setDescInput(e.target.value)}
            autoFocus
            className="desc-textarea"
            placeholder="Add a more detailed description..."
          />
          <div className="desc-actions">
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn-text"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleStartEdit}
          className="desc-display"
          title="Click to edit description"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleStartEdit();
            }
          }}
        >
          {description || "Add a more detailed description..."}
        </div>
      )}
    </div>
  );
}
