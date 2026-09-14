import { AlertTriangle, Check, X } from "lucide-react";
// src/components/Toast.jsx
import { useEffect } from "react";
import "../styles/Toast.css";

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast-notification ${type}`}>
      <span className="toast-icon">{type === "success" ? <Check size={18} aria-hidden="true" /> : <AlertTriangle size={18} aria-hidden="true" />}</span>
      <span className="toast-message">{message}</span>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Close notification">
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
