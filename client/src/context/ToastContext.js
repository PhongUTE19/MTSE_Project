// src/context/ToastContext.js
import { createContext } from "react";

export const ToastContext = createContext({
  toast: null,
  showToast: () => {},
  showError: () => {},
  showSuccess: () => {},
  clearToast: () => {},
});

export { useToast } from "./useToast";
export { ToastProvider } from "./ToastProvider";
