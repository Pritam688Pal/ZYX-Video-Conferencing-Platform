import { Server } from "socket.io";

let connections = {};
let messageHistory = {};
let timeOnline = {};

const connectSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      // Prioritize your deployed environment production domain variable
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {

    socket.on("joinRoom", ({ roomId, name }) => {
      if (timeOnline[socket.id]) {
        return io.to(socket.id).emit("join_failed", {
          message: "You are already connected to a room.",
        });
      }
      
      if (!connections[roomId]) {
        connections[roomId] = [];
      }
      connections[roomId].push({ id: socket.id, name });
      timeOnline[socket.id] = Date.now();

      // Standardize room joining
      socket.join(roomId);

      // Broadcast to everyone in the room that a user has joined
      io.to(roomId).emit("userJoined", {
        userId: socket.id,
        currentUsers: connections[roomId],
      });

      // Send the chat message log history back to the single peer who just connected
      io.to(socket.id).emit("joined", messageHistory[roomId] || []);
    });

    // FIXED: Route signaling packets directly to the targeted individual user ID, not the room string name
    socket.on("signal", (targetUserId, message) => {
      io.to(targetUserId).emit("signal", socket.id, message);
    });

    socket.on("chatMessage", ({ message, roomId }) => {
      if (!roomId) return;

      if (!messageHistory[roomId]) {
        messageHistory[roomId] = [];
      }
      messageHistory[roomId].push({
        message,
        senderId: socket.id,
        timestamp: Date.now(),
      });

      const userInRoom = connections[roomId]?.find((m) => m.id === socket.id);

      io.to(roomId).emit("chatMessage", {
        message,
        sender: userInRoom ? userInRoom.name : "Unknown",
        timestamp: Date.now(),
      });
    });

    socket.on("disconnect", () => {
      let key = Object.keys(connections).find((roomKey) =>
        connections[roomKey].some((member) => member.id === socket.id)
      );
      
      let username;
      if (key) {
        connections[key] = connections[key].filter((member) => {
          if (member.id === socket.id) {
            username = member.name;
          }
          return member.id !== socket.id;
        });

        // Notify the remaining room participants
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

      delete timeOnline[socket.id];
    });
  });

  return io;
};

export default connectSocketServer;