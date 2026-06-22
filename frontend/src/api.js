const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const TOKEN_KEY = "peiling_blog_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }
  return data;
}

export const api = {
  register: (payload) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => apiFetch("/auth/me"),
  siteComments: () => apiFetch("/comments"),
  siteComment: (payload) => apiFetch("/comments", { method: "POST", body: JSON.stringify(payload) }),
  siteCommentLike: (commentId) => apiFetch(`/comments/${commentId}/like`, { method: "POST" }),
  siteCommentDislike: (commentId) => apiFetch(`/comments/${commentId}/dislike`, { method: "POST" }),
  posts: (query = "") => apiFetch(`/posts${query ? `?q=${encodeURIComponent(query)}` : ""}`),
  post: (slug) => apiFetch(`/posts/${slug}`),
  createPost: (payload) => apiFetch("/posts", { method: "POST", body: JSON.stringify(payload) }),
  postComments: (postId) => apiFetch(`/posts/${postId}/comments`),
  postComment: (postId, payload) => apiFetch(`/posts/${postId}/comments`, { method: "POST", body: JSON.stringify(payload) }),
  postLike: (postId) => apiFetch(`/posts/${postId}/like`, { method: "POST" }),
  postDislike: (postId) => apiFetch(`/posts/${postId}/dislike`, { method: "POST" }),
  uploadPdf: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch("/posts/upload-pdf", { method: "POST", body: formData });
  }
};
