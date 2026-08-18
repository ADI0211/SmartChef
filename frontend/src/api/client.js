// Small wrapper around fetch(): builds the full URL, attaches the login
// token, and turns non-2xx responses into a thrown Error with a readable message.

const API_BASE_URL = "http://127.0.0.1:8000";

async function request(path, { method = "GET", body, isFormData = false } = {}) {
  const token = localStorage.getItem("smartchef_token");

  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  // No content responses (e.g. DELETE) have nothing to parse.
  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.detail || "Something went wrong. Please try again.";
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
  postForm: (path, formData) => request(path, { method: "POST", body: formData, isFormData: true }),
};
