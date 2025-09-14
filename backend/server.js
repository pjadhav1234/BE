// backend/server.js
import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorsRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import { initializeSocket } from "./socket.js";
import speechRoutes from "./routes/speechRoutes.js";
import transcriptRoutes from "./routes/transcriptRoutes.js";

// Load environment variables
dotenv.config();
connectDB();

const app = express();

// Define allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean); // .filter(Boolean) removes any falsy values (e.g., if FRONTEND_URL is not set)

// Apply CORS middleware once
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Body parsing middleware
// express.json() is the modern replacement for bodyParser.json()
app.use(express.json({ limit: "10mb" })); // Increased limit for base64 audio data
app.use(express.urlencoded({ extended: true }));

// Create HTTP Server to attach Socket.IO
const server = http.createServer(app);
initializeSocket(server);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/speech", speechRoutes);
app.use("/api", transcriptRoutes);

// Root route
app.get("/", (req, res) =>
  res.send("🩺 Doctor-Patient Backend Running with Video Call Support")
);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);