import { Server } from "socket.io";
import cors from "cors";

let connections = {};
let messageHistory = {};
let timeOnline = {};

const connectSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      allowHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // console.log("A user connected: " + socket.id);

    socket.on("joinRoom", ({ roomId, name }) => {
      // console.log(socket.id + 'joined room : ' + roomId);

      if (timeOnline[socket.id]) {
        io.to(socket.id).emit("join_failed", {
          message: "You are already connected to a room.",
        });
      }
      if (!connections[roomId]) {
        connections[roomId] = [];
      }
      connections[roomId].push({ id: socket.id, name });
      timeOnline[socket.id] = Date.now();

      connections[roomId].forEach((member) => {
        io.to(member.id).emit("userJoined", {
          userId: socket.id,
          currentUsers: connections[roomId],
        });
      });

      socket.join(roomId);
      // console.log(connections);

      io.to(socket.id).emit("joined", messageHistory[roomId] || []);
    });

    socket.on("signal", (roomId, message) => {
      io.to(roomId).emit("signal", socket.id, message);
    });

    socket.on("chatMessage", ({ message,roomId }) => {
      // roomId = Object.keys(connections).find((key) =>
      //   connections[key].some((member) => member.id === socket.id),
      // );

      if (!messageHistory[roomId]) {
        messageHistory[roomId] = [];
      }
      messageHistory[roomId].push({
        message,
        senderId: socket.id,
        timestamp: Date.now(),
      });
      io.to(roomId).emit("chatMessage", {
        message,
        sender:
          connections[roomId].find((m) => m.id === socket.id)?.name ||
          "Unknown",
        timestamp: Date.now(),
      });
    });

    socket.on("disconnect", () => {
      let diffTime = Math.abs(Date.now() - timeOnline[socket.id]);
      let key = Object.keys(connections).find((key) =>
        connections[key].some((member) => member.id === socket.id),
      );
      let username;
      if (key) {
        connections[key] = connections[key].filter(
          (member) => {
            if (member.id == socket.id) {
              username = member.name;
            }
            return member.id !== socket.id
          }
        );
        io.to(key).emit("userLeft", {
          userId: socket.id,
          username,
          currentUsers: connections[key],
        });
        if (connections[key].length === 0) {
          delete connections[key];
          delete messageHistory[key];
        }
      }
      // console.log(
      //   "A user disconnected: " +
      //     socket.id +
      //     " Time online: " +
      //     diffTime +
      //     "ms",
      // );
      // console.log(connections);

      delete timeOnline[socket.id];
    });
  });

  return io;
};

export default connectSocketServer;
