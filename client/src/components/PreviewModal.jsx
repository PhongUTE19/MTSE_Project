import { AlertTriangle, Check, X } from "lucide-react";

function formatDeadline(value) {
  if (!value) return "No deadline detected";
  return new Date(value).toLocaleString();
}

export default function PreviewModal({ draft, onUseDraft, onClose }) {
  if (!draft) return null;
  const isRejected = !draft.isTask;

  return (
    <div className="preview-backdrop" role="presentation">
      <section className="preview-modal" role="dialog" aria-modal="true" aria-labelledby="task-preview-title">
        <button type="button" className="preview-close" onClick={onClose} aria-label="Close task preview"><X size={18} /></button>
        <h2 id="task-preview-title">{isRejected ? "No task found" : "Review extracted task"}</h2>

        {isRejected ? (
          <p className="preview-warning"><AlertTriangle size={18} aria-hidden="true" /> {draft.rejectionReason || "This image does not contain a task."}</p>
        ) : (
          <div className="preview-content">
            <p><strong>Title</strong>{draft.title}</p>
            <p><strong>Description</strong>{draft.description || "No description detected"}</p>
            <p><strong>Deadline</strong>{formatDeadline(draft.dueAt)}</p>
            <p><strong>Priority</strong>{draft.priority || "Not specified"}</p>
            <p><strong>Labels</strong>{draft.labels.length ? draft.labels.join(", ") : "None"}</p>
            <p><strong>Checklist</strong>{draft.checklist.length ? draft.checklist.join(" • ") : "None"}</p>
            {draft.droppedLabels.length > 0 && <p className="preview-warning"><AlertTriangle size={16} /> Ignored unknown labels: {draft.droppedLabels.join(", ")}</p>}
            {!draft.dueAt && <p className="preview-warning"><AlertTriangle size={16} /> No deadline was detected. Add one before creating the task.</p>}
          </div>
        )}

        <div className="preview-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>{isRejected ? "Return to form" : "Cancel"}</button>
          {!isRejected && <button type="button" className="btn-submit" onClick={onUseDraft}><Check size={16} /> Use draft in form</button>}
        </div>
      </section>
    </div>
  );
}
