import { Pencil, Trash2, X } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import { taskService } from "../services/taskService";
import EditLabelModal from "./EditLabelModal";
import ConfirmDialog from "./ConfirmDialog";
import "../styles/LabelsPopup.css";

const LabelsPopup = forwardRef(function LabelsPopup(
  { projectId, selectedLabelNames = [], onToggleLabel, onLabelsChanged, onClose },
  ref
) {
  const [labels, setLabels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingLabel, setEditingLabel] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [labelToDelete, setLabelToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const refreshLabels = async () => {
    try {
      const freshLabels = await taskService.getLabels(projectId);
      setLabels(freshLabels || []);
    } catch (err) {
      setError(err?.message || "Failed to refresh labels.");
    }
  };

  useEffect(() => {
    let isMounted = true;
    taskService.getLabels(projectId)
      .then((freshLabels) => {
        if (isMounted) setLabels(freshLabels || []);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      });
    return () => { isMounted = false; };
  }, [projectId]);

  const handleCreateLabel = async (data) => {
    await taskService.createLabel(projectId, data);
    await refreshLabels();
    onLabelsChanged?.();
  };

  const handleSaveLabel = async (data) => {
    const oldName = editingLabel.name;
    const updatedLabel = await taskService.updateLabel(projectId, editingLabel.id, data);
    await refreshLabels();
    onLabelsChanged?.({ oldName, newName: updatedLabel.name });
  };

  const handleDeleteLabel = async () => {
    const deletedName = editingLabel.name;
    await taskService.deleteLabel(projectId, editingLabel.id);
    await refreshLabels();
    onLabelsChanged?.({ deletedName });
  };

  const handleConfirmDeleteRow = async () => {
    if (!labelToDelete) return;
    setIsDeleting(true);
    try {
      const deletedName = labelToDelete.name;
      await taskService.deleteLabel(projectId, labelToDelete.id);
      await refreshLabels();
      onLabelsChanged?.({ deletedName });
      setLabelToDelete(null);
    } catch (err) {
      setError(err.message || "Failed to delete label.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredLabels = labels.filter((label) => label.name.toLowerCase().includes(searchQuery.trim().toLowerCase()));

  return (
    <div className="labels-popup" ref={ref} onClick={(e) => e.stopPropagation()}>
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
              <button type="button" className="btn-edit-label" onClick={() => setEditingLabel(label)} title="Edit label"><Pencil size={16} aria-hidden="true" /></button>
              <button type="button" className="btn-delete-label-row" onClick={() => setLabelToDelete(label)} title="Delete label"><Trash2 size={16} aria-hidden="true" /></button>
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

      <ConfirmDialog
        isOpen={!!labelToDelete}
        title="Delete Label"
        message={
          <>
            Are you sure you want to delete label <strong>"{labelToDelete?.name}"</strong>? It will be removed from all tasks.
          </>
        }
        confirmText="Delete Label"
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteRow}
        onCancel={() => !isDeleting && setLabelToDelete(null)}
      />
    </div>
  );
});

export default LabelsPopup;
