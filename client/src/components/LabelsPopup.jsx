import { Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { mockApi } from "../services/mockApi";
import EditLabelModal from "./EditLabelModal";
import "../styles/LabelsPopup.css";

export default function LabelsPopup({ projectId, selectedLabelNames = [], onToggleLabel, onLabelsChanged, onClose }) {
  const [labels, setLabels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingLabel, setEditingLabel] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const refreshLabels = async () => {
    const freshLabels = await mockApi.getLabels(projectId);
    setLabels(freshLabels);
  };

  useEffect(() => {
    let isMounted = true;
    mockApi.getLabels(projectId)
      .then((freshLabels) => {
        if (isMounted) setLabels(freshLabels);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      });
    return () => { isMounted = false; };
  }, [projectId]);

  const handleCreateLabel = async (data) => {
    await mockApi.createLabel(projectId, data);
    await refreshLabels();
    onLabelsChanged?.();
  };

  const handleSaveLabel = async (data) => {
    const oldName = editingLabel.name;
    const updatedLabel = await mockApi.updateLabel(projectId, editingLabel.id, data);
    await refreshLabels();
    onLabelsChanged?.({ oldName, newName: updatedLabel.name });
  };

  const handleDeleteLabel = async () => {
    const deletedName = editingLabel.name;
    await mockApi.deleteLabel(projectId, editingLabel.id);
    await refreshLabels();
    onLabelsChanged?.({ deletedName });
  };

  const filteredLabels = labels.filter((label) => label.name.toLowerCase().includes(searchQuery.trim().toLowerCase()));

  return (
    <div className="labels-popup">
      <header className="labels-popup-header">
        <h3>Labels</h3>
        <button type="button" onClick={onClose} aria-label="Close"><X size={18} aria-hidden="true" /></button>
      </header>
      <div className="labels-search">
        <input placeholder="Search labels..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} autoFocus />
      </div>
      <div className="labels-list-title">Labels</div>
      <div className="labels-list">
        {filteredLabels.map((label) => {
          const isSelected = selectedLabelNames.includes(label.name);
          return (
            <div key={label.id} className={`label-row ${isSelected ? "selected" : ""}`}>
              <input type="checkbox" checked={isSelected} onChange={() => onToggleLabel(label.name)} />
              <span className="popup-label-badge" style={{ "--label-color": label.color }}>{label.name}</span>
              <button type="button" className="btn-edit-label" onClick={() => setEditingLabel(label)} title="Edit label"><Pencil size={18} aria-hidden="true" /></button>
            </div>
          );
        })}
        {!filteredLabels.length && <div className="labels-empty">No labels found.</div>}
      </div>
      {error && <p className="labels-popup-error">{error}</p>}
      <button type="button" className="btn-create-label" onClick={() => setIsCreating(true)}>Create a new label</button>
      {editingLabel && (
        <EditLabelModal
          label={editingLabel}
          onSave={handleSaveLabel}
          onDelete={handleDeleteLabel}
          onClose={() => setEditingLabel(null)}
        />
      )}
      {isCreating && (
        <EditLabelModal
          label={null}
          onSave={handleCreateLabel}
          onClose={() => setIsCreating(false)}
        />
      )}
    </div>
  );
}
