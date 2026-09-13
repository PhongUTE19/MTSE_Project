// src/config/index.js
/**
 * Application Configuration
 * Centralizes environment variables with sensible fallbacks.
 */

export const config = {
  appName: import.meta.env.VITE_APP_NAME || "MANA - Student Task & Deadline Manager",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  useMockData: import.meta.env.VITE_USE_MOCK_DATA !== "false",
};

export default config;
