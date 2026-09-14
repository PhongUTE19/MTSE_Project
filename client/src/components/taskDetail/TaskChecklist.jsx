// src/components/taskDetail/TaskChecklist.jsx
import { Check, ListChecks, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "../ConfirmDialog";

export default function TaskChecklist({
  checklist = [],
  onToggleItem,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onDeleteChecklist,
}) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemTitle, setEditingItemTitle] = useState("");
  const [isDeleteAllConfirmOpen, setIsDeleteAllConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const totalChecks = checklist ? checklist.length : 0;
  const doneChecks = checklist ? checklist.filter((c) => c.completed).length : 0;
  const progressPercent =
    totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0;

  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setEditingItemTitle(item.title);
  };

  const handleSaveEdit = (itemId) => {
    if (editingItemTitle.trim() !== "") {
      onEditItem(itemId, editingItemTitle.trim());
    }
    setEditingItemId(null);
    setEditingItemTitle("");
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingItemTitle("");
  };

  const handleStartAdd = () => {
    setIsAddingItem(true);
    setNewItemTitle("");
  };

  const handleCancelAdd = () => {
    setIsAddingItem(false);
    setNewItemTitle("");
  };

  const handleSubmitAdd = (e) => {
    if (e) e.preventDefault();
    if (newItemTitle.trim() === "") return;
    onAddItem(newItemTitle.trim());
    setNewItemTitle("");
    setIsAddingItem(false);
  };

  const handleConfirmDeleteAll = () => {
    setIsDeleteAllConfirmOpen(false);
    onDeleteChecklist();
  };

  const handleConfirmDeleteSingleItem = () => {
    if (itemToDelete) {
      onDeleteItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <div>
      <h3 className="section-title">
        <div className="section-title-left">
          <ListChecks size={18} aria-hidden="true" /> Acceptance Criteria
        </div>
        {totalChecks > 0 && (
          <button
            type="button"
            onClick={() => setIsDeleteAllConfirmOpen(true)}
            className="btn-secondary"
          >
            Delete
          </button>
        )}
      </h3>

      {totalChecks > 0 && (
        <div className="progress-container">
          <span className="progress-text">{progressPercent}%</span>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progressPercent}%`,
                background:
                  progressPercent === 100
                    ? "var(--success-text)"
                    : "var(--periwinkle)",
              }}
            />
          </div>
        </div>
      )}

      {totalChecks > 0 && (
        <ul className="checklist-items">
          {checklist.map((item) => (
            <li key={item.id} className="checklist-item">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => onToggleItem(item.id)}
                className="checklist-checkbox"
                aria-label={`Mark "${item.title}" as ${item.completed ? "incomplete" : "complete"}`}
              />

              {editingItemId === item.id ? (
                <div className="checklist-edit-row">
                  <input
                    type="text"
                    value={editingItemTitle}
                    onChange={(e) => setEditingItemTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveEdit(item.id);
                      } else if (e.key === "Escape") {
                        handleCancelEdit();
                      }
                    }}
                    autoFocus
                    className="checklist-edit-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(item.id)}
                    className="btn-primary checklist-btn"
                  >
                    <Check size={14} aria-hidden="true" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn-text checklist-btn"
                  >
                    <X size={14} aria-hidden="true" /> Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span
                    onClick={() => onToggleItem(item.id)}
                    className={`checklist-title ${
                      item.completed ? "completed" : "active"
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onToggleItem(item.id);
                      }
                    }}
                  >
                    {item.title}
                  </span>
                  <div className="checklist-item-actions">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className="btn-secondary btn-icon-xs"
                      title="Edit item"
                    >
                      <Pencil size={18} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      className="btn-secondary btn-icon-xs"
                      title="Delete item"
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {isAddingItem ? (
        <div className="add-checklist-item-form">
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmitAdd(e);
              } else if (e.key === "Escape") {
                handleCancelAdd();
              }
            }}
            placeholder="Add an item..."
            autoFocus
            className="add-checklist-input"
          />
          <div className="add-checklist-actions">
            <button
              type="button"
              onClick={handleSubmitAdd}
              className="btn-primary"
              disabled={!newItemTitle.trim()}
            >
              Add
            </button>
            <button
              type="button"
              onClick={handleCancelAdd}
              className="btn-text"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleStartAdd}
          className="btn-add-item"
        >
          + Add an item
        </button>
      )}

      {/* In-app confirmation for deleting entire checklist */}
      <ConfirmDialog
        isOpen={isDeleteAllConfirmOpen}
        title="Delete Checklist"
        message="Are you sure you want to delete the entire checklist? All items will be removed."
        confirmText="Delete Checklist"
        onConfirm={handleConfirmDeleteAll}
        onCancel={() => setIsDeleteAllConfirmOpen(false)}
      />

      {/* In-app confirmation for deleting a single checklist item */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${itemToDelete?.title}"?`}
        confirmText="Delete Item"
        onConfirm={handleConfirmDeleteSingleItem}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
