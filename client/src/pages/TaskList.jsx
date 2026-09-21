import { Calendar, Flag, ListChecks, Plus } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar";
import { LoadingState, EmptyState } from "../components/TaskListStates";
import { useTaskList } from "../hooks/useTaskList";
import { getChecklistProgress, isTaskOverdue } from "../utils/taskHelpers";
import { formatShortDate } from "../utils/date";
import "../styles/TaskList.css";

export default function TaskList() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    projectId,
    projectName,
    state,
    draggedTaskId,
    dragOverColumnId,
    isAddingStatus,
    setIsAddingStatus,
    newStatusName,
    setNewStatusName,
    isSubmittingStatus,
    columnList,
    retry,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDropTask,
    handleCreateStatus,
    getStudent,
    getLabel,
  } = useTaskList();
  void retry;

  // ----- Loading -----
  if (state.status === "loading") {
    return <LoadingState />;
  }

  // ----- Empty -----
  if (!state.data || state.data.length === 0) {
    return (
      <EmptyState
        onCreate={() =>
          navigate(
            projectId ? `/tasks/new?projectId=${projectId}` : "/tasks/new",
            { state: { projectId, projectName, backgroundLocation: location } }
          )
        }
      />
    );
  }

  // ----- Success / Board View -----
  return (
    <div className="board-container">
      <div className="board-header">
        <h1 className="board-title">{projectName}</h1>
        <Link
          to={projectId ? `/tasks/new?projectId=${projectId}` : "/tasks/new"}
          state={{ projectId, projectName, backgroundLocation: location }}
          className="btn-add-task"
        >
          <Plus size={18} aria-hidden="true" /> Add Task
        </Link>
      </div>

      <div className="board-columns">
        {columnList.map((col) => (
          <div
            key={col.id}
            className={`board-column ${dragOverColumnId === col.id ? "drop-target" : ""}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
            onDrop={(e) => handleDropTask(e, col.id)}
          >
            {/* Column Header */}
            <div className="column-header">
              <h3 className="column-title">{col.title}</h3>
              <span className="column-count">{col.tasks.length}</span>
            </div>

            {/* Column Task Cards */}
            <div className="column-tasks">
              {col.tasks.map((task) => {
                const checklistProgress = getChecklistProgress(task.checklist);
                const overdue = isTaskOverdue(task.dueAt);

                return (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    state={{ projectId, projectName, backgroundLocation: location }}
                    className={`task-card ${draggedTaskId === task.id ? "is-dragging" : ""}`}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* Labels */}
                    {task.labels && task.labels.length > 0 && (
                      <div className="task-labels">
                        {task.labels.map((l) => (
                          <span
                            key={l}
                            className="task-label"
                            style={{ "--label-color": getLabel(l)?.color }}
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <strong className="task-title">{task.title}</strong>

                    {/* Assigned Members */}
                    {task.assigneeIds && task.assigneeIds.length > 0 && (
                      <div className="task-members">
                        {task.assigneeIds.map((id) => {
                          const student = getStudent(id);
                          return (
                            <Avatar
                              key={id}
                              name={student.name || id}
                              className="task-member-avatar"
                              title={`${student.name}${
                                student.mssv ? ` (${student.mssv})` : ""
                              }`}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Badges Footer */}
                    <div className="task-card-footer">
                      <div className="task-badges">
                        {task.priority && (
                          <span className={`task-badge priority-${task.priority.toLowerCase()}`}>
                            <Flag size={12} aria-hidden="true" />
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()}
                          </span>
                        )}
                        {task.dueAt && (
                          <span
                            className={`task-badge ${
                              task.status === "done"
                                ? "done"
                                : overdue
                                ? "overdue"
                                : ""
                            }`}
                          >
                            <Calendar size={18} aria-hidden="true" />{" "}
                            {formatShortDate(task.dueAt)}
                          </span>
                        )}
                        {checklistProgress && (
                          <span
                            className={`task-badge ${
                              checklistProgress.isAllChecked ? "all-checked" : ""
                            }`}
                          >
                            <ListChecks size={18} aria-hidden="true" /> {checklistProgress.text}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Add Card Button */}
            <Link
              to={projectId ? `/tasks/new?projectId=${projectId}` : "/tasks/new"}
              state={{ status: col.id, projectId, projectName, backgroundLocation: location }}
              className="btn-add-card"
            >
              <Plus size={18} aria-hidden="true" /> Add a card
            </Link>
          </div>
        ))}

        {/* Add Column Button / Form */}
        <div className="board-add-column">
          {isAddingStatus ? (
            <form onSubmit={handleCreateStatus} className="add-status-form">
              <input
                type="text"
                value={newStatusName}
                onChange={(e) => setNewStatusName(e.target.value)}
                placeholder="Status column name..."
                className="add-status-input"
                autoFocus
              />
              <div className="add-status-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!newStatusName.trim() || isSubmittingStatus}
                >
                  {isSubmittingStatus ? "Adding..." : "Add Column"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setIsAddingStatus(false);
                    setNewStatusName("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className="btn-add-column"
              onClick={() => setIsAddingStatus(true)}
            >
              <Plus size={18} aria-hidden="true" /> Add Column
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
