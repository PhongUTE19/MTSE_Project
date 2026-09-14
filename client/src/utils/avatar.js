// src/utils/avatar.js

/**
 * Extracts the first/given name from a full name.
 * In Vietnamese and standard full-name conventions, the given name is the last word.
 * Example: "Bùi Duy Phong" -> "Phong", "Trần Thị Tố Như" -> "Như"
 *
 * @param {string} fullName
 * @returns {string}
 */
export function getFirstName(fullName) {
  if (!fullName || typeof fullName !== "string") return "";
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] || "";
}

/**
 * Gets the standardized uppercase initial of the user's Firstname.
 * Example: "Bùi Duy Phong" -> "P"
 *
 * @param {string} nameOrId
 * @returns {string}
 */
export function getAvatarInitial(nameOrId) {
  if (!nameOrId || typeof nameOrId !== "string") return "?";
  const firstName = getFirstName(nameOrId);
  if (!firstName) return "?";
  return firstName.charAt(0).toUpperCase();
}
