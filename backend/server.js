import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

// import videoRoutes from './routes/videoRoutes.js';
import cors from 'cors';
import doctorRoutes from './routes/doctorsRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';


// import { initializeSocket } from './socket.js';
// import http from 'http';
// import { Server } from 'socket.io';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());


// // ✅ Create server before using it
// const server = http.createServer(app);

app.use('/api/auth', authRoutes);
// app.use('/api/appointments', appointmentRoutes);
// app.use('/api/video', videoRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

app.get('/', (req, res) => res.send('Doctor-Patient Backend Running'));
// // Socket
// initializeSocket(server);





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
