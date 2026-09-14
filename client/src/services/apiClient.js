// src/services/apiClient.js

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

/**
 * Standardized HTTP API client for communication with Express backend.
 */
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/${endpoint.replace(/^\/+/, "")}`;
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    const config = {
      ...options,
      headers,
    };

    let response;
    try {
      response = await fetch(url, config);
    } catch (networkError) {
      throw new Error(
        `Network error: Unable to reach backend server at ${this.baseUrl}.`,
        { cause: networkError }
      );
    }

    if (response.status === 204) {
      return null;
    }

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      let errorMessage = "Request failed.";
      if (data && typeof data === "object") {
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }

        if (data.errors && typeof data.errors === "object") {
          const detailStrings = Object.entries(data.errors).map(
            ([field, msg]) => `${field}: ${msg}`
          );
          if (detailStrings.length > 0) {
            errorMessage += ` (${detailStrings.join(", ")})`;
          }
        }
      } else if (typeof data === "string" && data.trim()) {
        errorMessage = data.trim();
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient(BASE_URL);
export default apiClient;
