// backend/socket.js
import { Server } from "socket.io";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        process.env.FRONTEND_URL,
      ].filter(Boolean),
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // Doctor/Patient joins the appointment room
    socket.on("join-room", ({ roomId, userId, role }) => {
      socket.join(roomId);
      console.log(`${role} (${userId}) joined room: ${roomId}`);
      io.to(roomId).emit("user-joined", { userId, role });
    });

    // Doctor starts call
    socket.on("start-call", ({ roomId }) => {
      io.to(roomId).emit("incoming-call");
    });

    // Patient accepts call
    socket.on("accept-call", ({ roomId }) => {
      io.to(roomId).emit("call-accepted");
    });

    // WebRTC signaling (offer/answer/ICE)
    socket.on("offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("offer", offer);
    });

    socket.on("answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("answer", answer);
    });

    socket.on("ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("ice-candidate", candidate);
    });

    // End call
    socket.on("end-call", ({ roomId }) => {
      io.to(roomId).emit("call-ended");
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return io;
};
