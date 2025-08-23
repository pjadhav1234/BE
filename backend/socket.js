// backend/socket.js
import { Server } from 'socket.io';

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.FRONTEND_URL
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  });

  // Store active rooms and users
  const activeRooms = new Map();
  const userSockets = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user joining a room
    socket.on('join-room', (data) => {
      const { roomId, userRole, userName } = data;
      
      socket.join(roomId);
      socket.roomId = roomId;
      socket.userRole = userRole;
      socket.userName = userName;

      // Store user info
      userSockets.set(socket.id, {
        roomId,
        userRole,
        userName,
        socketId: socket.id
      });

      // Update room info
      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, {
          participants: [],
          createdAt: new Date()
        });
      }

      const room = activeRooms.get(roomId);
      room.participants.push({
        socketId: socket.id,
        userRole,
        userName,
        joinedAt: new Date()
      });

      console.log(`${userName} (${userRole}) joined room ${roomId}`);

      // Notify other users in the room
      socket.to(roomId).emit('user-joined', {
        userName,
        userRole,
        socketId: socket.id
      });

      // If there are 2 participants, initiate call
      if (room.participants.length === 2) {
        // Let the doctor initiate the call (or first person)
        const initiator = room.participants.find(p => p.userRole === 'doctor') || room.participants[0];
        io.to(initiator.socketId).emit('call-offer');
      }

      // Send room info to the joining user
      socket.emit('room-joined', {
        roomId,
        participants: room.participants.filter(p => p.socketId !== socket.id)
      });
    });

    // Handle WebRTC offer
    socket.on('offer', (data) => {
      const { offer, roomId } = data;
      console.log(`Offer received from ${socket.id} for room ${roomId}`);
      
      socket.to(roomId).emit('offer', {
        offer,
        from: socket.id,
        userInfo: userSockets.get(socket.id)
      });
    });

    // Handle WebRTC answer
    socket.on('answer', (data) => {
      const { answer, roomId } = data;
      console.log(`Answer received from ${socket.id} for room ${roomId}`);
      
      socket.to(roomId).emit('answer', {
        answer,
        from: socket.id,
        userInfo: userSockets.get(socket.id)
      });
    });

    // Handle ICE candidates
    socket.on('ice-candidate', (data) => {
      const { candidate, roomId } = data;
      
      socket.to(roomId).emit('ice-candidate', {
        candidate,
        from: socket.id
      });
    });

    // Handle leaving room
    socket.on('leave-room', (roomId) => {
      handleUserLeaving(socket, roomId);
    });

    // Handle chat messages during video call
    socket.on('chat-message', (data) => {
      const { message, roomId } = data;
      const userInfo = userSockets.get(socket.id);
      
      socket.to(roomId).emit('chat-message', {
        message,
        from: userInfo,
        timestamp: new Date()
      });
    });

    // Handle screen sharing
    socket.on('screen-share-start', (roomId) => {
      socket.to(roomId).emit('screen-share-start', {
        from: socket.id,
        userInfo: userSockets.get(socket.id)
      });
    });

    socket.on('screen-share-stop', (roomId) => {
      socket.to(roomId).emit('screen-share-stop', {
        from: socket.id
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      const userInfo = userSockets.get(socket.id);
      
      if (userInfo) {
        handleUserLeaving(socket, userInfo.roomId);
      }
    });

    // Helper function to handle user leaving
    function handleUserLeaving(socket, roomId) {
      if (!roomId) return;

      const userInfo = userSockets.get(socket.id);
      
      // Notify other users in the room
      socket.to(roomId).emit('user-left', {
        socketId: socket.id,
        userInfo: userInfo
      });

      // Update room participants
      if (activeRooms.has(roomId)) {
        const room = activeRooms.get(roomId);
        room.participants = room.participants.filter(p => p.socketId !== socket.id);
        
        // If room is empty, delete it
        if (room.participants.length === 0) {
          activeRooms.delete(roomId);
          console.log(`Room ${roomId} deleted - no participants left`);
        }
      }

      // Remove user from tracking
      userSockets.delete(socket.id);
      
      // Leave the socket room
      socket.leave(roomId);
      
      if (userInfo) {
        console.log(`${userInfo.userName} left room ${roomId}`);
      }
    }
  });

  // API endpoint to get active rooms (for debugging)
  io.engine.on('connection_error', (err) => {
    console.log('Socket connection error:', err.req);
    console.log('Error code:', err.code);
    console.log('Error message:', err.message);
    console.log('Error context:', err.context);
  });

  return io;
};