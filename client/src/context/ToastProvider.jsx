// src/context/ToastProvider.jsx
import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Toast from "../components/Toast";
import { ToastContext } from "./ToastContext";

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const location = useLocation();

  // Automatically pick up toasts passed via React Router navigation state:
  // navigate("/path", { state: { toast: { message: "...", type: "success" } } })
  useEffect(() => {
    if (location.state?.toast) {
      const navToast = location.state.toast;
      const timer = setTimeout(() => {
        setToast(navToast);
      }, 0);

      // Clean up history state so reloading or backward navigation doesn't re-trigger
      try {
        const restState = { ...location.state };
        delete restState.toast;
        window.history.replaceState({ ...window.history.state, usr: restState }, "");
      } catch {
        // Safe fallback in test or non-browser environments
      }

      return () => clearTimeout(timer);
    }
  }, [location]);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((message, type = "success", duration = 3000) => {
    if (!message) return;
    if (typeof message === "object" && message.message) {
      setToast({
        message: message.message,
        type: message.type || "success",
        duration: message.duration || duration,
      });
    } else {
      setToast({ message: String(message), type, duration });
    }
  }, []);

  const showError = useCallback((message, duration = 4000) => {
    showToast(message, "error", duration);
  }, [showToast]);

  const showSuccess = useCallback((message, duration = 3000) => {
    showToast(message, "success", duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toast, setToast, showToast, showError, showSuccess, clearToast }}>
      {children}
      <Toast
        message={toast?.message}
        type={toast?.type}
        duration={toast?.duration}
        onClose={clearToast}
      />
    </ToastContext.Provider>
  );
}

export default ToastProvider;
