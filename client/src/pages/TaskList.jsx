import { ArrowLeft, ArrowRight, Calendar, ListChecks, Plus } from "lucide-react";
// src/pages/TaskList.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { mockApi } from "../services/mockApi";
import { getLabelColor } from "../utils/constants";
import Toast from "../components/Toast";
import { LoadingState, EmptyState, ErrorState } from "../components/TaskListStates";
import "../styles/TaskList.css";

export default function TaskList() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = location.state?.projectId;
  const projectName = location.state?.projectName || "Team Workboard";

  const [state, setState] = useState({
    status: "loading",
    data: null,
    error: null,
  });
  const [members, setMembers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [toast, setToast] = useState(location.state?.toast || null);

  // Fetch tasks and student members from mock API
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      mockApi.getTasks(projectId),
      mockApi.getMembers(projectId).catch(() => []),
      mockApi.getLabels(projectId).catch(() => []),
    ])
      .then(([tasks, membersData, labelsData]) => {
        if (isMounted) {
          setMembers(membersData);
          setLabels(labelsData);
          setState({ status: "success", data: tasks, error: null });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setState({
            status: "error",
            data: null,
            error: { message: err.message || "Unable to load tasks." },
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Quick move status directly from board
  const handleMoveStatus = async (e, taskId, nextStatus) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const updated = await mockApi.updateTask(taskId, { status: nextStatus });
      setState((prev) => ({
        ...prev,
        data: prev.data.map((t) => (t.id === taskId ? updated : t)),
      }));
    } catch (err) {
      setToast({
        message: "Failed to update status: " + err.message,
        type: "error",
      });
    }
  };

  // Helper to find student details
  const getStudent = (id) => {
    return (
      members.find((s) => s.id === id) || {
        id,
        name: id,
      }
    );
  };

  const getLabel = (name) => labels.find((label) => label.name.toLowerCase() === name.toLowerCase());

  // ----- Loading -----
  if (state.status === "loading") {
    return <LoadingState />;
  }

  // ----- Error -----
  if (state.status === "error") {
    return (
      <>
        <ErrorState
          message={state.error.message}
          onRetry={() => window.location.reload()}
        />
        <Toast
          message={toast?.message}
          type={toast?.type}
          onClose={() => setToast(null)}
        />
      </>
    );
  }

  // ----- Empty -----
  if (state.data.length === 0) {
    return (
      <>
        <EmptyState
          onCreate={() =>
            navigate("/tasks/new", { state: { projectId, projectName } })
          }
        />
        <Toast
          message={toast?.message}
          type={toast?.type}
          onClose={() => setToast(null)}
        />
      </>
    );
  }

  // ----- Success -----

  // Define board columns
  const columns = {
    todo: { title: "To Do", tasks: [] },
    in_progress: { title: "In Progress", tasks: [] },
    done: { title: "Done", tasks: [] },
  };

  // Group tasks by status
  state.data.forEach((task) => {
    if (columns[task.status]) {
      columns[task.status].tasks.push(task);
    } else {
      columns.todo.tasks.push(task);
    }
  });

  // Helper to get checklist completion text (e.g., "3/5")
  const getChecklistText = (task) => {
    if (!task.checklist || task.checklist.length === 0) return null;
    const completed = task.checklist.filter((c) => c.completed).length;
    return `${completed}/${task.checklist.length}`;
  };

  return (
    <div className="board-container">
      <div className="board-header">
        <h1 className="board-title">{projectName}</h1>
        <Link
          to="/tasks/new"
          state={{ projectId, projectName }}
          className="btn-add-task"
        >
          <Plus size={18} aria-hidden="true" /> Add Task
        </Link>
      </div>

      <div className="board-columns">
        {Object.keys(columns).map((colKey) => {
          const col = columns[colKey];
          return (
            <div key={colKey} className="board-column">
              {/* Column Header */}
              <div className="column-header">
                <h3 className="column-title">{col.title}</h3>
                <span className="column-count">{col.tasks.length}</span>
              </div>

              {/* Column Task Cards */}
              <div className="column-tasks">
                {col.tasks.map((task) => {
                  const checklistText = getChecklistText(task);
                  const isAllChecked =
                    task.checklist &&
                    task.checklist.length > 0 &&
                    checklistText.split("/")[0] === checklistText.split("/")[1];
                  const isOverdue =
                    task.dueAt && new Date(task.dueAt) < new Date();

                  return (
                    <Link
                      key={task.id}
                      to={`/tasks/${task.id}`}
                      state={{ projectId, projectName }}
                      className="task-card"
                    >
                      {/* Labels */}
                      {task.labels && task.labels.length > 0 && (
                        <div className="task-labels">
                          {task.labels.map((l) => (
                            <span
                              key={l}
                              className="task-label"
                              style={{ "--label-color": getLabel(l)?.color || getLabelColor(l) }}
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
                            const initial = student.name
                              ? student.name.split(" ").pop().charAt(0)
                              : id.charAt(0).toUpperCase();
                            return (
                              <div
                                key={id}
                                className="task-member-avatar"
                                title={`${student.name}${
                                  student.mssv ? ` (${student.mssv})` : ""
                                }`}
                              >
                                {initial}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Badges Footer */}
                      <div className="task-card-footer">
                        <div className="task-badges">
                          {task.dueAt && (
                            <span
                              className={`task-badge ${
                                task.status === "done"
                                  ? "done"
                                  : isOverdue
                                  ? "overdue"
                                  : ""
                              }`}
                            >
                              <Calendar size={18} aria-hidden="true" />{" "}
                              {new Date(task.dueAt)
                                .toLocaleDateString("en-GB")
                                .slice(0, 5)}
                            </span>
                          )}
                          {checklistText && (
                            <span
                              className={`task-badge ${
                                isAllChecked ? "all-checked" : ""
                              }`}
                            >
                              <ListChecks size={18} aria-hidden="true" /> {checklistText}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Move Status */}
                      <div
                        className="task-quick-actions"
                        onClick={(e) => e.preventDefault()}
                      >
                        {task.status === "todo" && (
                          <button
                            type="button"
                            className="btn-quick-move"
                            title="Move to In Progress"
                            onClick={(e) =>
                              handleMoveStatus(e, task.id, "in_progress")
                            }
                          >
                            Start <ArrowRight size={18} aria-hidden="true" />
                          </button>
                        )}
                        {task.status === "in_progress" && (
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              type="button"
                              className="btn-quick-move"
                              title="Move back to To Do"
                              onClick={(e) =>
                                handleMoveStatus(e, task.id, "todo")
                              }
                            >
                              <ArrowLeft size={18} aria-hidden="true" /> Todo
                            </button>
                            <button
                              type="button"
                              className="btn-quick-move success"
                              title="Mark as Done"
                              onClick={(e) =>
                                handleMoveStatus(e, task.id, "done")
                              }
                            >
                              Done <ArrowRight size={18} aria-hidden="true" />
                            </button>
                          </div>
                        )}
                        {task.status === "done" && (
                          <button
                            type="button"
                            className="btn-quick-move"
                            title="Reopen to In Progress"
                            onClick={(e) =>
                              handleMoveStatus(e, task.id, "in_progress")
                            }
                          >
                            <ArrowLeft size={18} aria-hidden="true" /> Reopen
                          </button>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Add Card Button */}
              <Link
                to="/tasks/new"
                state={{ status: colKey, projectId, projectName }}
                className="btn-add-card"
              >
                <Plus size={18} aria-hidden="true" /> Add a card
              </Link>
            </div>
          );
        })}
      </div>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
