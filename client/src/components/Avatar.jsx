// src/components/Avatar.jsx
import { getAvatarInitial } from "../utils/avatar";

/**
 * Standardized Avatar component that displays user initial derived from their Firstname.
 * Consistent across Task board, Task details, Member lists, Popups, and Settings.
 */
export default function Avatar({
  name = "",
  className = "avatar",
  size,
  title,
  style = {},
  ...props
}) {
  const initial = getAvatarInitial(name);
  const sizeStyle = size
    ? {
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
        fontSize: typeof size === "number" ? `${Math.round(size * 0.5)}px` : undefined,
      }
    : {};

  return (
    <div
      className={className}
      title={title !== undefined ? title : name}
      style={{ ...sizeStyle, ...style }}
      {...props}
    >
      {initial}
    </div>
  );
}
