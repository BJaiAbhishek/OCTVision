const BASE_URL = import.meta.env.VITE_API_URL || "";
let authToken = null;

function getHeaders(headers = {}, isFormData = false) {
  const result = { ...headers };
  const contentTypePresent = result["Content-Type"] || result["content-type"];
  // Let the browser set multipart/form-data (including its boundary) for uploads.
  if (!isFormData && !contentTypePresent) {
    result["Content-Type"] = "application/json";
  }
  if (authToken) {
    result.Authorization = `Bearer ${authToken}`;
  }
  return result;
}

async function parseResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || data?.error || response.statusText);
  }
  return data;
}

export const api = {
  setToken(token) {
    authToken = token;
  },
  clearToken() {
    authToken = null;
  },
  async request(path, options = {}) {
    const isFormData = options.body instanceof FormData;
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: getHeaders(options.headers || {}, isFormData),
    });
    return parseResponse(response);
  },
  get(path) {
    return this.request(path);
  },
  post(path, body, options = {}) {
    if (body instanceof FormData) {
      return this.request(path, {
        method: "POST",
        body,
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        ...options,
      });
    }
    return this.request(path, { method: "POST", body: JSON.stringify(body), ...options });
  },
  put(path, body, options = {}) {
    return this.request(path, { method: "PUT", body: JSON.stringify(body), ...options });
  },
  delete(path, options = {}) {
    return this.request(path, { method: "DELETE", ...options });
  },
};
