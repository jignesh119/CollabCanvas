import express from "express";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static("dist"));
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
  next();
});

const io = new Server(server, {
  cors: { origin: "*" },
});
const actions = JSON.parse(fs.readFileSync("./src/Actions.json", "utf8"));

const userSocketMap = {};
function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    },
  );
}

io.on("connection", (socket) => {
  socket.on(actions.JOIN, ({ roomId, username }) => {
    console.log(`user ${username} joining ${roomId}`);
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    // socket.in(roomId).emit(actions.USER_JOINED, { clients, username });
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(actions.USER_JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
      io.to(socketId).emit("get-canvas-state", { socketId: socket.id });
    });
  });
  socket.on("canvas-state", ({ socketId, state }) => {
    io.to(socketId).emit("canvas-state-from-server", state);
  });
  socket.on("draw-line", ({ roomId, prevPoint, currentPoint, color }) => {
    //emit to everyone excvept sender
    // socket.broadcast.emit("draw-line", { prevPoint, currentPoint, color });
    socket.in(roomId).emit("draw-line", { prevPoint, currentPoint, color });
  });
  socket.on("clear-canvas", ({ roomId }) => {
    //io.emit()->emits to each including sender
    socket.in(roomId).emit("clear-canvas");
  });
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(actions.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
      socket.leave(roomId);
    });
    delete userSocketMap[socket.id];
  });

  //HOLD:
  socket.on(actions.SKETCH_CHANGE, ({ roomId, code }) => {
    //NOTE: .in means-> sending to all except the orign sender
    //.to means direct broadcasting
    socket.in(roomId).emit(actions.SKETCH_CHANGE, { code });
  });
  socket.on(actions.SYNC_SKETCH, ({ code, socketId }) => {
    io.to(socketId).emit(actions.SKETCH_CHANGE, { code });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`server started at http://localhost:${PORT}`);
});
