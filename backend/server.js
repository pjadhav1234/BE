// backend/server.js
import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import doctorRoutes from "./routes/doctorsRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import { initializeSocket } from "./socket.js";
import speechRoutes from "./routes/speechRoutes.js";
import axios from "axios";

dotenv.config();
connectDB();

const app = express();

// ✅ CORS setup
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.json());

// Create HTTP + Socket.IO server
const server = http.createServer(app);
initializeSocket(server);

// REST routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/speech", speechRoutes);

app.get("/", (req, res) =>
  res.send("🩺 Doctor-Patient Backend Running with Video Call Support")
);

app.post("/api/parse-transcript", async (req, res) => {
  try {
    const { transcript } = req.body;

    const response = await axios.post("http://localhost:8000/parse-transcript", {
      transcript,
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "AI service failed", details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
