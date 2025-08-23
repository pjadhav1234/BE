// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';
import doctorRoutes from './routes/doctorsRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import { initializeSocket } from './socket.js';

dotenv.config();
connectDB();

const app = express();

// CORS configuration - Allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',  // React default
  'http://localhost:5173',  // Vite default
  'http://localhost:5174',  // Vite alternative
  process.env.FRONTEND_URL  // Production URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/video', videoRoutes);

app.get('/', (req, res) => res.send('🩺 Doctor-Patient Backend Running with Video Call Support'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Socket.IO enabled for video calls`);
});