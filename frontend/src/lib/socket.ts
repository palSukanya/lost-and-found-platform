// src/lib/socket.ts
import { io, Socket } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId"); // optional: store after login

    socket = io(API_BASE, {
      auth: { token, userId },
    });
  }
  return socket;
}
