// src/lib/api.ts

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

/* ================= API CORE ================= */

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  // JSON only if not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] =
      headers["Content-Type"] || "application/json";
  }

  // JWT
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body,
  });

  if (!res.ok) {
    let msg = "Request failed";

    try {
      const data = await res.json();
      msg = data.message || msg;
    } catch {
      msg = await res.text();
    }

    throw new Error(msg);
  }

  return res.json();
}

/* ================= AUTH ================= */

export const login = (email: string, password: string) =>
  apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const signup = (
  name: string,
  email: string,
  password: string
) =>
  apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      username: name,
      email,
      password,
    }),
  });

export const getUserProfile = () =>
  apiFetch("/api/auth/me");

/* ================= PROFILE ================= */

export const getProfile = () =>
  apiFetch("/api/profile");

export const updateProfile = (data: any) =>
  apiFetch("/api/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const changePassword = (data: any) =>
  apiFetch("/api/profile/password", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const uploadAvatar = (avatar: string) =>
  apiFetch("/api/profile/avatar", {
    method: "PUT",
    body: JSON.stringify({ avatar }),
  });

/* ================= ITEMS ================= */

export interface CreateItemPayload {
  title: string;
  description: string;
  category: string;
  type: "lost" | "found";
  location?: string;
  image?: File;
  verificationQuestions?: string[];
  reward?: string;
  timeLost?: string;
  timeFound?: string;
}

export async function createItem(
  payload: CreateItemPayload
) {
  const fd = new FormData();

  fd.append("type", payload.type);
  fd.append("title", payload.title);
  fd.append("description", payload.description);
  fd.append("category", payload.category);

  fd.append(
    "verificationQuestions",
    JSON.stringify(payload.verificationQuestions || [])
  );

  if (payload.location) fd.append("location", payload.location);
  if (payload.reward) fd.append("reward", payload.reward);
  if (payload.timeLost) fd.append("timeLost", payload.timeLost);
  if (payload.timeFound) fd.append("timeFound", payload.timeFound);

  if (payload.image) fd.append("image", payload.image);

  return apiFetch("/api/items", {
    method: "POST",
    body: fd,
  });
}

export const getItems = (
  type?: "lost" | "found",
  category?: string
) => {
  const p = new URLSearchParams();

  if (type) p.append("type", type);
  if (category) p.append("category", category);

  return apiFetch(`/api/items?${p.toString()}`);
};

export const getItem = (id: string) =>
  apiFetch(`/api/items/${id}`);
export function useItem(id: string) {
  return useQuery({
    queryKey: ["item", id],
    queryFn: () => getItem(id),
    enabled: !!id,
  });
}

/* ================= CLAIM FLOW ================= */

export const submitClaim = (data: any) =>
  apiFetch(`/api/items/${data.itemId}/claim`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const approveClaim = (itemId: string) =>
  apiFetch(`/api/items/${itemId}/approve`, {
    method: "POST",
    body: JSON.stringify({ itemId }),
  });

export const rejectClaim = (itemId: string) =>
  apiFetch(`/api/items/${itemId}/reject`, {
    method: "POST",
    body: JSON.stringify({ itemId }),
  });

/* ================= MESSAGES ================= */
// Send claim message
export const sendClaimMessage = (data: any) =>
  apiFetch("/api/messages", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Send found message
export const sendFoundMessage = (data: any) =>
  apiFetch("/api/messages", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getMessages = () =>
  apiFetch("/api/messages");

export const sendMessage = (data: any) =>
  apiFetch("/api/messages", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const markConversationRead = (otherUsername: string) =>
  apiFetch("/api/messages/read", {
    method: "PATCH",
    body: JSON.stringify({ otherUsername }),
  });

/* ================= COMMUNITY ================= */

export const createPost = (data: any) =>
  apiFetch("/api/community", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getPosts = (type?: string) => {
  const p = new URLSearchParams();
  if (type) p.append("type", type);

  return apiFetch(`/api/community?${p.toString()}`);
};

/* ================= NOTIFICATIONS ================= */

export const getNotifications = () =>
  apiFetch("/api/notifications");

export const markNotificationAsRead = (id: string) =>
  apiFetch(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });

/* ================= REACT QUERY HOOKS ================= */

// Auth
export function useLogin() {
  return useMutation({ mutationFn: login });
}

export function useSignup() {
  return useMutation({ mutationFn: signup });
}

// Profile
export function useUserProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });
}

// Items
export function useCreateItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
    },
  });
}

export function useItems(
  type?: "lost" | "found",
  category?: string
) {
  return useQuery({
    queryKey: ["items", type, category],
    queryFn: () => getItems(type, category),
  });
}

// Claims
export function useSubmitClaim() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: submitClaim,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useApproveClaim() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: approveClaim,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useRejectClaim() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: rejectClaim,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

// Messages
export function useSendClaimMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: sendClaimMessage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useSendFoundMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: sendFoundMessage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useMessages() {
  return useQuery({
    queryKey: ["messages"],
    queryFn: getMessages,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useMarkConversationRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: markConversationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// Community
export function usePosts(type?: string) {
  return useQuery({
    queryKey: ["posts", type],
    queryFn: () => getPosts(type),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

// Notifications
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });
}
