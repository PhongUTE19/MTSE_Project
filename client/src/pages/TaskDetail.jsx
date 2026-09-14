import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { mockApi } from "../services/mockApi";
import {
  getLabelColor,
  getStudentName as getStudentNameHelper,
} from "../utils/constants";
import Toast from "../components/Toast";
import LabelsPopup from "../components/LabelsPopup";
import { Calendar, Check, Clock3, Flag, X } from "lucide-react";
import "../styles/TaskDetail.css";

export default function TaskDetail() {
  const { taskId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loadedTaskId, setLoadedTaskId] = useState(null);
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [notFound, setNotFound] = useState(false);

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState("");

  const [showMembersPopup, setShowMembersPopup] = useState(false);
  const [showLabelsPopup, setShowLabelsPopup] = useState(false);
  const [toast, setToast] = useState(null);

  // In-app checklist item inputs
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemTitle, setEditingItemTitle] = useState("");

  const projectId = location.state?.projectId || task?.projectId;
  const locationProjectId = location.state?.projectId;
  const projectName = location.state?.projectName || project?.name;

  const loading = loadedTaskId !== taskId;

  // Load task and reference data
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      mockApi.getTaskById(taskId).catch(() => null),
      mockApi.getMembers(locationProjectId).catch(() => []),
      mockApi.getLabels(locationProjectId).catch(() => []),
    ])
      .then(([taskData, membersData, labelsData]) => {
        if (!isMounted) return;

        setLoadedTaskId(taskId);
        if (!taskData) {
          setNotFound(true);
          return;
        }

        setNotFound(false);
        setTask(taskData);
        setDescInput(taskData.description || "");
        setMembers(membersData);
        setLabels(labelsData);

        if (taskData.projectId) {
          mockApi
            .getProjectById(taskData.projectId)
            .then((p) => {
              if (isMounted) setProject(p);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadedTaskId(taskId);
          setNotFound(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [taskId, locationProjectId]);

  useEffect(() => {
    if (!task?.projectId) return undefined;
    let isMounted = true;
    Promise.all([mockApi.getMembers(task.projectId), mockApi.getLabels(task.projectId)])
      .then(([membersData, labelsData]) => {
        if (isMounted) {
          setMembers(membersData);
          setLabels(labelsData);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [task?.projectId]);

  // Persist updates to mock API
  const updateTaskData = useCallback(
    async (updates) => {
      if (!task) return;
      try {
        const updated = await mockApi.updateTask(task.id, updates);
        setTask(updated);
      } catch (err) {
        setToast({
          message: "Failed to update task: " + err.message,
          type: "error",
        });
      }
    },
    [task]
  );

  // Toggle member assignment
  const handleToggleMember = (memberId) => {
    if (!task) return;
    const current = task.assigneeIds || [];
    const updated = current.includes(memberId)
      ? current.filter((id) => id !== memberId)
      : [...current, memberId];
    updateTaskData({ assigneeIds: updated });
  };

  // Toggle label assignment
  const handleToggleLabel = (label) => {
    if (!task) return;
    const current = task.labels || [];
    const updated = current.includes(label)
      ? current.filter((l) => l !== label)
      : [...current, label];
    updateTaskData({ labels: updated });
  };

  const handleLabelsChanged = async (change) => {
    const freshLabels = await mockApi.getLabels(task.projectId);
    setLabels(freshLabels);
    if (change?.oldName && change?.newName) {
      setTask((previous) => ({
        ...previous,
        labels: (previous.labels || []).map((name) => name === change.oldName ? change.newName : name),
      }));
    }
    if (change?.deletedName) {
      setTask((previous) => ({
        ...previous,
        labels: (previous.labels || []).filter((name) => name !== change.deletedName),
      }));
    }
  };

  // Delete task with confirmation
  const handleDeleteTask = async () => {
    if (!task) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete task "${task.title}"?\nThis action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      await mockApi.deleteTask(task.id);
      navigate("/tasks", {
        state: {
          projectId,
          projectName,
          toast: {
            message: `Task "${task.title}" deleted successfully.`,
            type: "success",
          },
        },
      });
    } catch (err) {
      setToast({
        message: "Failed to delete task: " + err.message,
        type: "error",
      });
    }
  };

  // Helper: get student name from ID
  const getStudentName = (id) => {
    return getStudentNameHelper(members, id);
  };

  // Add checklist item
  const handleAddItem = (e) => {
    if (e) e.preventDefault();
    if (newItemTitle.trim() === "") return;
    const newItem = {
      id: `check-${Date.now()}`,
      title: newItemTitle.trim(),
      completed: false,
    };
    updateTaskData({
      checklist: [...(task.checklist || []), newItem],
    });
    setNewItemTitle("");
    setIsAddingItem(false);
  };

  // Save edited checklist item
  const handleSaveEditItem = (itemId) => {
    if (editingItemTitle.trim() !== "") {
      const updatedChecklist = (task.checklist || []).map((c) =>
        c.id === itemId ? { ...c, title: editingItemTitle.trim() } : c
      );
      updateTaskData({ checklist: updatedChecklist });
    }
    setEditingItemId(null);
    setEditingItemTitle("");
  };

  if (loading) {
    return (
      <div className="task-detail-container">
        <div className="task-detail-modal" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#6b778c" }}>Loading task details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !task) {
    return (
      <div className="task-detail-container">
        <div className="task-detail-modal">
          <p style={{ padding: "20px" }}>
            Task not found.{" "}
            <Link to="/tasks" state={{ projectId, projectName }}>
              Back to board
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Calculate checklist progress
  const totalChecks = task.checklist ? task.checklist.length : 0;
  const doneChecks = task.checklist ? task.checklist.filter((c) => c.completed).length : 0;
  const progressPercent =
    totalChecks > 0 ? Math.round((doneChecks / totalChecks) * 100) : 0;

  return (
    <div className="task-detail-container">
      <div className="task-detail-modal">
        {/* Close/Back button */}
        <div className="btn-close-container">
          <Link
            to="/tasks"
            state={{ projectId, projectName }}
            className="btn-close"
          >
            ✕
          </Link>
        </div>

        {/* Header section */}
        <div className="header-section">
          <span className="header-icon">📖</span>
          <div className="header-content">
            <input
              value={task.title}
              onChange={(e) => {
                const newTitle = e.target.value;
                setTask((prev) => ({ ...prev, title: newTitle }));
              }}
              onBlur={() => {
                updateTaskData({ title: task.title });
              }}
              className="title-input"
              onFocus={(e) => {
                e.target.style.background = "#fff";
                e.target.style.border = "2px solid #388bff";
              }}
            />
            <p className="list-info">
              in list{" "}
              <span>
                {task.status === "todo"
                  ? "To Do"
                  : task.status === "in_progress"
                  ? "In Progress"
                  : "Done"}
              </span>
            </p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="two-column-layout">
          {/* Main Column */}
          <div className="main-column">
            {/* Quick Info (Members, Labels) */}
            <div className="quick-info">
              {task.assigneeIds && task.assigneeIds.length > 0 && (
                <div>
                  <div className="info-label">Members</div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {task.assigneeIds.map((id) => (
                      <div
                        key={id}
                        title={getStudentName(id)}
                        className="member-avatar"
                      >
                        {getStudentName(id).split(" ").pop().charAt(0)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {task.labels && task.labels.length > 0 && (
                <div>
                  <div className="info-label">Labels</div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {task.labels.map((l) => {
                      const labelObj = labels.find(label => label.name.toLowerCase() === l.toLowerCase());
                      return (
                      <span
                        key={l}
                        className="label-badge"
                        style={{ background: labelObj?.color || getLabelColor(l) }}
                      >
                        {l}
                      </span>
                    )})}
                  </div>
                </div>
              )}
            </div>

            {/* Description - Directly editable by clicking */}
            <div>
              <h3 className="section-title">
                <div className="section-title-left">
                  <span>≡</span> Description
                </div>
              </h3>

              {isEditingDesc ? (
                <div>
                  <textarea
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    autoFocus
                    className="desc-textarea"
                  />
                  <div className="desc-actions">
                    <button
                      onClick={() => {
                        updateTaskData({ description: descInput });
                        setIsEditingDesc(false);
                      }}
                      className="btn-primary"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setDescInput(task.description || "");
                        setIsEditingDesc(false);
                      }}
                      className="btn-text"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  className="desc-display"
                  title="Click to edit description"
                >
                  {task.description || "Add a more detailed description..."}
                </div>
              )}
            </div>

            {/* Acceptance Criteria / Checklist */}
            <div>
              <h3 className="section-title">
                <div className="section-title-left">
                  <span>☑️</span> Acceptance Criteria
                </div>
                {task.checklist && task.checklist.length > 0 && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete the entire checklist?"
                        )
                      ) {
                        updateTaskData({ checklist: [] });
                      }
                    }}
                    className="btn-secondary"
                  >
                    Delete
                  </button>
                )}
              </h3>

              {/* Progress bar */}
              {task.checklist && task.checklist.length > 0 && (
                <div className="progress-container">
                  <span className="progress-text">{progressPercent}%</span>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${progressPercent}%`,
                        background:
                          progressPercent === 100 ? "#1f845a" : "#579dff",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Items */}
              {task.checklist && task.checklist.length > 0 && (
                <ul className="checklist-items">
                  {task.checklist.map((item) => (
                    <li key={item.id} className="checklist-item">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {
                          const updatedChecklist = task.checklist.map((c) =>
                            c.id === item.id
                              ? { ...c, completed: !c.completed }
                              : c
                          );
                          updateTaskData({ checklist: updatedChecklist });
                        }}
                        className="checklist-checkbox"
                      />
                      {editingItemId === item.id ? (
                        <div style={{ display: "flex", flex: 1, gap: "6px", alignItems: "center" }}>
                          <input
                            type="text"
                            value={editingItemTitle}
                            onChange={(e) => setEditingItemTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveEditItem(item.id);
                              } else if (e.key === "Escape") {
                                setEditingItemId(null);
                                setEditingItemTitle("");
                              }
                            }}
                            autoFocus
                            className="checklist-edit-input"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditItem(item.id)}
                            className="btn-primary"
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                          >
                            <Check size={14} aria-hidden="true" /> Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItemId(null);
                              setEditingItemTitle("");
                            }}
                            className="btn-text"
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                          >
                            <X size={14} aria-hidden="true" /> Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <span
                            onClick={() => {
                              const updatedChecklist = task.checklist.map((c) =>
                                c.id === item.id
                                  ? { ...c, completed: !c.completed }
                                  : c
                              );
                              updateTaskData({ checklist: updatedChecklist });
                            }}
                            className={`checklist-title ${
                              item.completed ? "completed" : "active"
                            }`}
                          >
                            {item.title}
                          </span>
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItemId(item.id);
                                setEditingItemTitle(item.title);
                              }}
                              className="btn-secondary"
                              style={{ margin: 0, padding: "2px 6px" }}
                              title="Edit item"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm("Delete this item?")) {
                                  const updatedChecklist = task.checklist.filter(
                                    (c) => c.id !== item.id
                                  );
                                  updateTaskData({ checklist: updatedChecklist });
                                }
                              }}
                              className="btn-secondary"
                              style={{ margin: 0, padding: "2px 6px" }}
                              title="Delete item"
                            >
                              ❌
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {/* In-app Add an item input UI */}
              {isAddingItem ? (
                <div className="add-checklist-item-form">
                  <input
                    type="text"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddItem(e);
                      } else if (e.key === "Escape") {
                        setIsAddingItem(false);
                        setNewItemTitle("");
                      }
                    }}
                    placeholder="Add an item..."
                    autoFocus
                    className="add-checklist-input"
                  />
                  <div className="add-checklist-actions">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="btn-primary"
                      disabled={!newItemTitle.trim()}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingItem(false);
                        setNewItemTitle("");
                      }}
                      className="btn-text"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingItem(true);
                    setNewItemTitle("");
                  }}
                  className="btn-add-item"
                >
                  + Add an item
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar-column">
            <div>
              <div className="info-label">Add to card</div>
              <div className="sidebar-buttons">
                {/* Members Popup */}
                <div className="sidebar-btn-wrapper">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMembersPopup((prev) => !prev);
                      setShowLabelsPopup(false);
                    }}
                    className="btn-sidebar"
                    style={{ width: "100%" }}
                  >
                    👤 Members
                  </button>

                  {showMembersPopup && (
                    <div className="popover-menu">
                      <div className="popover-header">
                        <span className="popover-title">Assign Members</span>
                        <button
                          type="button"
                          className="popover-close"
                          onClick={() => setShowMembersPopup(false)}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="popover-list">
                        {members.map((member) => {
                          const isSelected = (task.assigneeIds || []).includes(member.id);
                          return (
                            <div
                              key={member.id}
                              className={`popover-item ${isSelected ? "selected" : ""}`}
                              onClick={() => handleToggleMember(member.id)}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className="popover-checkbox"
                              />
                              <div
                                className="member-avatar"
                                style={{
                                  width: "22px",
                                  height: "22px",
                                  fontSize: "11px",
                                }}
                              >
                                {member.name.split(" ").pop().charAt(0)}
                              </div>
                              <span>{member.name} {member.mssv && `(${member.mssv})`}</span>
                            </div>
                          );
                        })}
                        <div className="popover-footer" style={{ borderTop: "1px solid #dfe1e6", padding: "8px", textAlign: "center" }}>
                          <Link to={`/settings?project=${task.projectId}`} state={{ tab: "members" }} style={{ textDecoration: "none", color: "#0052cc", fontSize: "14px", fontWeight: "500" }}>
                            ⚙️ Manage Members
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Labels Popup */}
                <div className="sidebar-btn-wrapper">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLabelsPopup((prev) => !prev);
                      setShowMembersPopup(false);
                    }}
                    className="btn-sidebar"
                    style={{ width: "100%" }}
                  >
                    🏷️ Labels
                  </button>

                  {showLabelsPopup && (
                    <LabelsPopup
                      projectId={task.projectId}
                      selectedLabelNames={task.labels || []}
                      onToggleLabel={handleToggleLabel}
                      onLabelsChanged={handleLabelsChanged}
                      onClose={() => setShowLabelsPopup(false)}
                    />
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="info-label">Task Metadata</div>
              <div className="metadata-grid">
                <strong className="metadata-label"><Flag size={14} aria-hidden="true" /> Status:</strong>
                <select
                  value={task.status}
                  onChange={(e) => {
                    updateTaskData({ status: e.target.value });
                  }}
                  className="metadata-input"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                <strong className="metadata-label"><Flag size={14} aria-hidden="true" /> Priority:</strong>
                <select
                  value={task.priority}
                  onChange={(e) => {
                    updateTaskData({ priority: e.target.value });
                  }}
                  className="metadata-input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                <strong className="metadata-label"><Calendar size={14} aria-hidden="true" /> Start:</strong>
                <input
                  type="date"
                  value={
                    task.startAt
                      ? new Date(task.startAt).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    updateTaskData({
                      startAt: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    });
                  }}
                  className="metadata-input"
                />

                <strong className="metadata-label"><Calendar size={14} aria-hidden="true" /> Due:</strong>
                <input
                  type="date"
                  value={
                    task.dueAt
                      ? new Date(task.dueAt).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => {
                    updateTaskData({
                      dueAt: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    });
                  }}
                  className="metadata-input"
                />

                <strong className="metadata-label"><Clock3 size={14} aria-hidden="true" /> Reminder:</strong>
                <select
                  value={
                    task.reminderMinutesBefore && task.reminderMinutesBefore[0]
                      ? task.reminderMinutesBefore[0]
                      : ""
                  }
                  onChange={(e) => {
                    const mins = parseInt(e.target.value, 10);
                    updateTaskData({
                      reminderMinutesBefore: isNaN(mins) ? [] : [mins],
                    });
                  }}
                  className="metadata-input"
                >
                  <option value="">None</option>
                  <option value="15">15 phút trước</option>
                  <option value="60">1 giờ trước</option>
                  <option value="1440">1 ngày trước</option>
                </select>
              </div>
            </div>

            {/* Actions: Delete Task */}
            <div style={{ marginTop: "12px" }}>
              <div className="info-label">Actions</div>
              <button
                type="button"
                onClick={handleDeleteTask}
                className="btn-sidebar btn-danger"
                style={{ width: "100%" }}
              >
                🗑️ Delete Task
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
