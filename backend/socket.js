// backend/socket.js
import { Server } from 'socket.io';

// Store active rooms and users
const activeRooms = new Map();

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.FRONTEND_URL
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a room
    socket.on('join-room', (roomId, userId, userName, userRole) => {
      try {
        socket.join(roomId);
        console.log(`User ${userName} (${userId}) joined room ${roomId}`);
        
        // Store user info
        socket.userId = userId;
        socket.userName = userName;
        socket.userRole = userRole;
        socket.roomId = roomId;
        
        // Initialize room if it doesn't exist
        if (!activeRooms.has(roomId)) {
          activeRooms.set(roomId, {
            users: new Map(),
            callStatus: 'idle'
          });
        }
        
        const room = activeRooms.get(roomId);
        room.users.set(userId, {
          socketId: socket.id,
          userName,
          userRole,
          joinedAt: new Date()
        });
        
        // Notify others in the room
        socket.to(roomId).emit('user-joined', userId, userName);
        
        console.log(`Room ${roomId} now has ${room.users.size} users`);
        
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle incoming call
    socket.on('incoming-call', (data) => {
      try {
        console.log('Incoming call in room:', data.roomId);
        const room = activeRooms.get(data.roomId);
        if (room) {
          room.callStatus = 'ringing';
        }
        socket.to(data.roomId).emit('incoming-call', data);
      } catch (error) {
        console.error('Error handling incoming call:', error);
        socket.emit('error', { message: 'Failed to initiate call' });
      }
    });

    // Handle call acceptance
    socket.on('accept-call', (data) => {
      try {
        console.log('Call accepted in room:', data.roomId);
        const room = activeRooms.get(data.roomId);
        if (room) {
          room.callStatus = 'connected';
        }
        socket.to(data.roomId).emit('call-accepted', {
          userId: socket.userId,
          userName: socket.userName,
          userRole: socket.userRole
        });
      } catch (error) {
        console.error('Error accepting call:', error);
        socket.emit('error', { message: 'Failed to accept call' });
      }
    });

    // Handle call rejection
    socket.on('reject-call', (data) => {
      try {
        console.log('Call rejected in room:', data.roomId);
        const room = activeRooms.get(data.roomId);
        if (room) {
          room.callStatus = 'ended';
        }
        socket.to(data.roomId).emit('call-rejected', {
          userId: socket.userId,
          userName: socket.userName
        });
      } catch (error) {
        console.error('Error rejecting call:', error);
        socket.emit('error', { message: 'Failed to reject call' });
      }
    });

    // Handle WebRTC offer
    socket.on('offer', (data) => {
      try {
        console.log('Offer received in room:', data.roomId);
        socket.to(data.roomId).emit('offer', {
          offer: data.offer,
          fromUserId: socket.userId,
          fromUserName: socket.userName
        });
      } catch (error) {
        console.error('Error handling offer:', error);
        socket.emit('error', { message: 'Failed to send offer' });
      }
    });

    // Handle WebRTC answer
    socket.on('answer', (data) => {
      try {
        console.log('Answer received in room:', data.roomId);
        socket.to(data.roomId).emit('answer', {
          answer: data.answer,
          fromUserId: socket.userId,
          fromUserName: socket.userName
        });
      } catch (error) {
        console.error('Error handling answer:', error);
        socket.emit('error', { message: 'Failed to send answer' });
      }
    });

    // Handle ICE candidate
    socket.on('ice-candidate', (data) => {
      try {
        console.log('ICE candidate received in room:', data.roomId);
        socket.to(data.roomId).emit('ice-candidate', {
          candidate: data.candidate,
          fromUserId: socket.userId
        });
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
        socket.emit('error', { message: 'Failed to send ICE candidate' });
      }
    });

    // Handle call end
    socket.on('end-call', (data) => {
      try {
        console.log('Call ended in room:', data.roomId);
        const room = activeRooms.get(data.roomId);
        if (room) {
          room.callStatus = 'ended';
        }
        socket.to(data.roomId).emit('call-ended');
      } catch (error) {
        console.error('Error ending call:', error);
        socket.emit('error', { message: 'Failed to end call' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      try {
        console.log('User disconnected:', socket.id);
        
        if (socket.roomId) {
          const room = activeRooms.get(socket.roomId);
          if (room && socket.userId) {
            room.users.delete(socket.userId);
            
            // Clean up room if empty
            if (room.users.size === 0) {
              activeRooms.delete(socket.roomId);
              console.log(`Room ${socket.roomId} cleaned up`);
            }
          }
          
          socket.to(socket.roomId).emit('user-left', socket.userId, socket.userName);
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

// Helper function to get room info
export const getRoomInfo = (roomId) => {
  return activeRooms.get(roomId);
};

// Helper function to get all active rooms
export const getAllActiveRooms = () => {
  const rooms = [];
  activeRooms.forEach((room, roomId) => {
    rooms.push({
      roomId,
      userCount: room.users.size,
      callStatus: room.callStatus,
      users: Array.from(room.users.values())
    });
  });
  return rooms;
};