// src/components/TaskListStates.jsx
import "../styles/TaskListStates.css";

/**
 * Trạng thái đang tải dữ liệu.
 */
export function LoadingState() {
  return (
    <div className="state-container">
      <p className="state-loading">⏳ Loading tasks...</p>
    </div>
  );
}

/**
 * Trạng thái không có task nào.
 * @param {{ onCreate?: () => void }} props
 */
export function EmptyState({ onCreate }) {
  return (
    <div className="state-container">
      <div className="state-icon">📭</div>
      <p className="state-text">No tasks found.</p>
      <button className="btn-state" onClick={onCreate}>Create your first task</button>
    </div>
  );
}

/**
 * Trạng thái lỗi khi tải dữ liệu.
 * @param {{ message: string, onRetry: () => void }} props
 */
export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-container">
      <div className="state-icon">❌</div>
      <p className="state-text-error">{message}</p>
      <button className="btn-state" onClick={onRetry}>Try Again</button>
    </div>
  );
}
