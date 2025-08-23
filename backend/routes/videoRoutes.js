// backend/routes/videoRoutes.js
import express from 'express';
import {protect} from '../middleware/authMiddleware.js';

const router = express.Router();

// Generate a unique room ID for video consultation
router.get('/generate-room/:appointmentId', protect, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const roomId = `consult-${appointmentId}-${Date.now()}`;
    
    res.json({
      roomId,
      message: 'Room created successfully',
      joinUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/video-call?room=${roomId}`
    });
  } catch (error) {
    console.error('Error generating room:', error);
    res.status(500).json({ message: 'Failed to generate room' });
  }
});

// Get room info (for validation)
router.get('/room/:roomId', protect, (req, res) => {
  const { roomId } = req.params;
  
  // Basic room validation
  if (!roomId || !roomId.startsWith('consult-')) {
    return res.status(400).json({ message: 'Invalid room ID' });
  }
  
  res.json({
    roomId,
    isValid: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role
    }
  });
});

// Store call session info (optional - for analytics/logging)
router.post('/session/start', protect, async (req, res) => {
  try {
    const { roomId, appointmentId } = req.body;
    
    // Here you could store call session data in database
    // For now, just acknowledge the session start
    
    console.log(`Call session started - Room: ${roomId}, User: ${req.user.name} (${req.user.role})`);
    
    res.json({
      message: 'Session started',
      sessionId: `session-${Date.now()}`,
      startTime: new Date()
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ message: 'Failed to start session' });
  }
});

// End call session
router.post('/session/end', protect, async (req, res) => {
  try {
    const { roomId, sessionId, duration } = req.body;
    
    // Here you could update call session data in database
    console.log(`Call session ended - Room: ${roomId}, Duration: ${duration}ms`);
    
    res.json({
      message: 'Session ended',
      endTime: new Date()
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ message: 'Failed to end session' });
  }
});

export default router;