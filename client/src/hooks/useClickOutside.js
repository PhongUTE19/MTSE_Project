// src/hooks/useClickOutside.js
import { useEffect, useRef } from "react";

/**
 * Hook that invokes a handler callback when a click or touch event occurs outside the referenced DOM element.
 *
 * @param {Function} handler - Callback invoked when an outside click occurs
 * @param {boolean} active - Whether the listener should be currently active
 * @returns {React.RefObject} - Ref to attach to the target container DOM element
 */
export function useClickOutside(handler, active = true) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;

    const listener = (event) => {
      // Do nothing if clicking target container or its descendants
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [handler, active]);

  return ref;
}

export default useClickOutside;
