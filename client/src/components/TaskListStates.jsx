// src/components/TaskListStates.jsx
import { LoaderCircle, Inbox, CircleAlert, RotateCcw } from "lucide-react";
import "../styles/TaskListStates.css";

/**
 * Trạng thái đang tải dữ liệu.
 */
export function LoadingState() {
  return (
    <div className="state-container">
      <LoaderCircle className="state-loading-icon" size={32} />
      <p className="state-loading">Loading tasks...</p>
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
      <div className="state-icon">  <Inbox size={34} /> </div>
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
      <div className="state-icon error"><CircleAlert size={34} /></div>
      <p className="state-text-error">{message}</p>
      <button className="btn-state" onClick={onRetry}><RotateCcw size={16} /> Try Again</button>
    </div>
  );
}
