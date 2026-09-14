// src/pages/TaskDetail.jsx
import { AlertCircle, X } from "lucide-react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import useTaskDetail from "../hooks/useTaskDetail";
import TaskDetailHeader from "../components/taskDetail/TaskDetailHeader";
import TaskQuickInfo from "../components/taskDetail/TaskQuickInfo";
import TaskDescription from "../components/taskDetail/TaskDescription";
import TaskChecklist from "../components/taskDetail/TaskChecklist";
import TaskSidebar from "../components/taskDetail/TaskSidebar";
import Toast from "../components/Toast";
import "../styles/TaskDetail.css";

export default function TaskDetail() {
  const { taskId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    task,
    setTask,
    members,
    labels,
    statuses,
    isLoading,
    isNotFound,
    error,
    toast,
    clearToast,
    projectId,
    projectName,
    handleTitleSave,
    handleDescriptionSave,
    handleToggleChecklistItem,
    handleAddChecklistItem,
    handleEditChecklistItem,
    handleDeleteChecklistItem,
    handleDeleteChecklist,
    handleToggleMember,
    handleToggleLabel,
    handleLabelsChanged,
    handleStatusChange,
    handlePriorityChange,
    handleStartDateChange,
    handleDueDateChange,
    handleReminderChange,
    handleDeleteTask,
  } = useTaskDetail(taskId, location.state);

  const handleTitleChange = (newTitle) => {
    setTask((prev) => (prev ? { ...prev, title: newTitle } : prev));
  };

  const handleTitleBlur = () => {
    if (task) {
      handleTitleSave(task.title);
    }
  };

  const onDeleteTask = async () => {
    try {
      const res = await handleDeleteTask();
      if (res?.success) {
        navigate(projectId ? `/tasks?projectId=${projectId}` : "/tasks", {
          state: {
            projectId,
            projectName,
            toast: {
              message: `Task "${res.taskTitle}" deleted successfully.`,
              type: "success",
            },
          },
        });
      }
    } catch {
      // Toast notification is managed by useTaskDetail
    }
  };

  if (isLoading) {
    return (
      <div className="task-detail-container">
        <div className="task-detail-modal task-detail-modal-center">
          <p style={{ color: "var(--text-secondary)" }}>Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-detail-container">
        <div className="task-detail-modal">
          <div className="task-error-msg">
            <h3 className="task-error-title">
              <AlertCircle size={20} aria-hidden="true" /> Failed to load task
            </h3>
            <p className="task-error-text">{error}</p>
            <div>
              <Link to={projectId ? `/tasks?projectId=${projectId}` : "/tasks"} state={{ projectId, projectName }} className="btn-secondary">
                Back to board
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isNotFound || !task) {
    return (
      <div className="task-detail-container">
        <div className="task-detail-modal">
          <p className="task-not-found-msg">
            Task not found.{" "}
            <Link to={projectId ? `/tasks?projectId=${projectId}` : "/tasks"} state={{ projectId, projectName }}>
              Back to board
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-detail-container">
      <div className="task-detail-modal">
        <div className="btn-close-container">
          <Link
            to={projectId ? `/tasks?projectId=${projectId}` : "/tasks"}
            state={{ projectId, projectName }}
            className="btn-close"
            aria-label="Close"
          >
            <X size={18} aria-hidden="true" />
          </Link>
        </div>

        <TaskDetailHeader
          title={task.title}
          status={task.status}
          statuses={statuses}
          onTitleChange={handleTitleChange}
          onTitleBlur={handleTitleBlur}
        />

        <div className="two-column-layout">
          <div className="main-column">
            <TaskQuickInfo
              assigneeIds={task.assigneeIds}
              taskLabels={task.labels}
              allLabels={labels}
              members={members}
            />

            <TaskDescription
              description={task.description}
              onSaveDescription={handleDescriptionSave}
            />

            <TaskChecklist
              checklist={task.checklist}
              onToggleItem={handleToggleChecklistItem}
              onAddItem={handleAddChecklistItem}
              onEditItem={handleEditChecklistItem}
              onDeleteItem={handleDeleteChecklistItem}
              onDeleteChecklist={handleDeleteChecklist}
            />
          </div>

          <TaskSidebar
            task={task}
            members={members}
            statuses={statuses}
            onToggleMember={handleToggleMember}
            onToggleLabel={handleToggleLabel}
            onLabelsChanged={handleLabelsChanged}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onStartDateChange={handleStartDateChange}
            onDueDateChange={handleDueDateChange}
            onReminderChange={handleReminderChange}
            onDeleteTask={onDeleteTask}
          />
        </div>
      </div>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={clearToast}
      />
    </div>
  );
}
