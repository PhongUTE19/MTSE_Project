// src/components/taskDetail/TaskActions.jsx
import { useState } from "react";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";

export default function TaskActions({ onDeleteTask, taskTitle = "" }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleConfirm = () => {
    setIsConfirmOpen(false);
    onDeleteTask();
  };

  return (
    <div className="task-actions-section">
      <div className="info-label">Actions</div>
      <button
        type="button"
        onClick={() => setIsConfirmOpen(true)}
        className="btn-sidebar btn-danger btn-sidebar-full"
      >
        <Trash2 size={18} aria-hidden="true" /> Delete Task
      </button>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Task"
        message={`Are you sure you want to delete task "${taskTitle}"? This action cannot be undone.`}
        confirmText="Delete Task"
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
