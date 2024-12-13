import { io } from "socket.io-client";

export const initSocket = async () => {
  const initOpts = {
    "force new connection": true,
    reconnectionAttempt: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  };
  return io(
    (import.meta.env.VITE_APP_BACKEND_URL as string) || "http://localhost:3001",
    initOpts,
  );
};
