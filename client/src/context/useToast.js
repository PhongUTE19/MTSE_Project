// src/context/useToast.js
import { useContext } from "react";
import { ToastContext } from "./ToastContext";

export function useToast() {
  return useContext(ToastContext);
}
export default useToast;
