// src/pages/TaskList.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { tasks as mockTasks } from "../data/mockData";
import { LoadingState, EmptyState, ErrorState } from "../components/TaskListStates";
import "../styles/TaskList.css";

export default function TaskList() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectName = location.state?.projectName || "Team Workboard";

  const [state, setState] = useState({
    status: "loading",
    data: null,
    error: null,
  });

  // Giả lập fetch API
  useEffect(() => {
    const timer = setTimeout(() => {
      
      try {
        setState({ status: "success", data: mockTasks, error: null });
      } catch (error) {
        setState({
          status: "error",
          data: null,
          error: { message: "Unable to load tasks." },
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // ----- Loading -----
  if (state.status === "loading") {
    return <LoadingState />;
  }

  // ----- Error -----
  if (state.status === "error") {
    return (
      <ErrorState
        message={state.error.message}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // ----- Empty -----
  if (state.data.length === 0) {
    return <EmptyState onCreate={() => navigate("/tasks/new")} />;
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

  // Helper to get color for labels
  const getLabelColor = (label) => {
    const colors = ["#4bce97", "#e2b203", "#f87168", "#9f8fef", "#579dff"];
    let hash = 0;
    for (let i = 0; i < label.length; i++) hash += label.charCodeAt(i);
    return colors[hash % colors.length];
  };

  return (
    <div className="board-container">
      <div className="board-header">
        <h1 className="board-title">{projectName}</h1>
        <Link to="/tasks/new" className="btn-add-task">+ Add Task</Link>
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
                  const isAllChecked = task.checklist && task.checklist.length > 0 && checklistText.split('/')[0] === checklistText.split('/')[1];
                  const isOverdue = new Date(task.dueAt) < new Date();

                  return (
                    <Link
                      key={task.id}
                      to={`/tasks/${task.id}`}
                      className="task-card"
                    >
                      {/* Labels */}
                      {task.labels && task.labels.length > 0 && (
                        <div className="task-labels">
                          {task.labels.map((l) => (
                            <span key={l} className="task-label" style={{ background: getLabelColor(l) }}>
                              {l}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title */}
                      <strong className="task-title">{task.title}</strong>

                      {/* Badges */}
                      <div className="task-badges">
                        {task.dueAt && (
                          <span className={`task-badge ${task.status === "done" ? "done" : (isOverdue ? "overdue" : "")}`}>
                            📅 {new Date(task.dueAt).toLocaleDateString("en-GB").slice(0, 5)}
                          </span>
                        )}
                        {checklistText && (
                          <span className={`task-badge ${isAllChecked ? "all-checked" : ""}`}>
                            ☑️ {checklistText}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Add Card Button */}
              <Link to="/tasks/new" state={{ status: colKey }} className="btn-add-card">
                + Add a card
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
