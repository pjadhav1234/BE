import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const VideoCall = ({ appointmentId, doctorId, patientId, onCallEnd, userRole }) => {
  const [socket, setSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState('initializing');
  const [error, setError] = useState(null);
  const [roomId, setRoomId] = useState(`appointment-${appointmentId}`);
  const [callDuration, setCallDuration] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callTimerRef = useRef(null);
  const pcRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // ICE servers configuration
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };
  
  // Initialize socket connection and media on component mount
  useEffect(() => {
    initializeVideoCall();
    return () => {
      cleanup();
    };
  }, []);
  
  // Call timer
  useEffect(() => {
    if (callStatus === 'connected') {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    }
    
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [callStatus]);
  
  const initializeVideoCall = async () => {
    try {
      setCallStatus('initializing');
      
      // Initialize media first
      const stream = await initializeMedia();
      if (!stream) return;
      
      // Then initialize socket
      await initializeSocket();
      
      setCallStatus('ready');
    } catch (err) {
      console.error('Failed to initialize video call:', err);
      setError('Failed to initialize video call. Please check your camera and microphone permissions.');
      setCallStatus('error');
    }
  };
  
  const initializeSocket = () => {
    return new Promise((resolve, reject) => {
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });
      
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setSocket(newSocket);
        
        // Join room
        newSocket.emit('join-room', roomId, user.id, user.name, userRole);
        
        setupSocketListeners(newSocket);
        resolve(newSocket);
      });
      
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setError('Failed to connect to server');
        reject(error);
      });
    });
  };
  
  const setupSocketListeners = (socket) => {
    // User events
    socket.on('user-joined', (userId, userName) => {
      console.log(`User joined: ${userName} (${userId})`);
      setConnectedUsers(prev => [...prev.filter(u => u.id !== userId), { id: userId, name: userName }]);
      
      // Auto-start call when both users are present
      if (userRole === 'patient') {
        setTimeout(() => initiateCall(), 1000);
      }
    });
    
    socket.on('user-left', (userId, userName) => {
      console.log(`User left: ${userName}`);
      setConnectedUsers(prev => prev.filter(u => u.id !== userId));
    });
    
    // Call signaling events
    socket.on('incoming-call', (data) => {
      console.log('Incoming call from:', data.fromUserName);
      setIncomingCall(data);
      setIsRinging(true);
      setCallStatus('ringing');
    });
    
    socket.on('call-accepted', (data) => {
      console.log('Call accepted by:', data.userName);
      setIsRinging(false);
      setCallStatus('connecting');
    });
    
    socket.on('call-rejected', (data) => {
      console.log('Call rejected by:', data.userName);
      setCallStatus('rejected');
      setTimeout(() => setCallStatus('ready'), 3000);
    });
    
    // WebRTC signaling events
    socket.on('offer', async (data) => {
      console.log('Received offer from:', data.fromUserName);
      await handleOffer(data.offer, data.fromUserId);
    });
    
    socket.on('answer', async (data) => {
      console.log('Received answer from:', data.fromUserName);
      await handleAnswer(data.answer);
    });
    
    socket.on('ice-candidate', async (data) => {
      console.log('Received ICE candidate');
      await handleIceCandidate(data.candidate);
    });
    
    socket.on('call-ended', () => {
      console.log('Call ended by remote user');
      endCall(false);
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setError(error.message);
    });
  };
  
  const initializeMedia = async () => {
    try {
      console.log('Requesting media access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });
      
      console.log('Media access granted:', stream.getTracks().map(t => `${t.kind}: ${t.label}`));
      
      setLocalStream(stream);
      
      // Set local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.onloadedmetadata = () => {
          localVideoRef.current.play().catch(e => console.log('Local video play failed:', e));
        };
      }
      
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      let errorMessage = 'Failed to access camera/microphone. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera and microphone permissions.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera or microphone found.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera or microphone is being used by another application.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
      throw err;
    }
  };
  
  const createPeerConnection = () => {
    console.log('Creating peer connection...');
    
    const pc = new RTCPeerConnection(iceServers);
    pcRef.current = pc;
    
    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log('Adding track:', track.kind);
        pc.addTrack(track, localStream);
      });
    }
    
    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.onloadedmetadata = () => {
          remoteVideoRef.current.play().catch(e => console.log('Remote video play failed:', e));
        };
      }
    };
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        console.log('Sending ICE candidate');
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          roomId: roomId
        });
      }
    };
    
    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state changed:', pc.connectionState);
      
      switch (pc.connectionState) {
        case 'connected':
          setCallStatus('connected');
          setIsCallActive(true);
          break;
        case 'disconnected':
          setCallStatus('disconnected');
          break;
        case 'failed':
          setCallStatus('failed');
          setError('Connection failed. Please try again.');
          break;
        case 'closed':
          setCallStatus('ended');
          break;
      }
    };
    
    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
    };
    
    setPeerConnection(pc);
    return pc;
  };
  
  const initiateCall = async () => {
    try {
      console.log('Initiating call...');
      setCallStatus('calling');
      
      const pc = createPeerConnection();
      
      // Create and send offer
      const offer = await pc.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true
      });
      
      await pc.setLocalDescription(offer);
      console.log('Created offer, sending to remote peer');
      
      // Send call notification
      socket.emit('incoming-call', {
        roomId: roomId,
        fromUserId: user.id,
        fromUserName: user.name,
        fromUserRole: userRole
      });
      
      // Send offer
      socket.emit('offer', {
        offer: offer,
        roomId: roomId,
        fromUserId: user.id,
        fromUserName: user.name
      });
      
    } catch (err) {
      console.error('Error initiating call:', err);
      setError('Failed to initiate call');
      setCallStatus('ready');
    }
  };
  
  const acceptCall = async () => {
    try {
      console.log('Accepting call...');
      setIsRinging(false);
      setCallStatus('connecting');
      
      if (!peerConnection) {
        createPeerConnection();
      }
      
      socket.emit('accept-call', {
        roomId: roomId,
        fromUserId: user.id,
        fromUserName: user.name,
        fromUserRole: userRole
      });
      
      setIncomingCall(null);
    } catch (err) {
      console.error('Error accepting call:', err);
      setError('Failed to accept call');
    }
  };
  
  const rejectCall = () => {
    console.log('Rejecting call...');
    
    socket.emit('reject-call', {
      roomId: roomId,
      fromUserId: user.id,
      fromUserName: user.name
    });
    
    setIsRinging(false);
    setIncomingCall(null);
    setCallStatus('ready');
  };
  
  const handleOffer = async (offer, fromUserId) => {
    try {
      console.log('Handling offer from:', fromUserId);
      
      let pc = peerConnection;
      if (!pc) {
        pc = createPeerConnection();
      }
      
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('Set remote description (offer)');
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('Created answer, sending to remote peer');
      
      socket.emit('answer', {
        answer: answer,
        roomId: roomId,
        fromUserId: user.id,
        fromUserName: user.name
      });
      
    } catch (err) {
      console.error('Error handling offer:', err);
      setError('Failed to handle incoming call');
    }
  };
  
  const handleAnswer = async (answer) => {
    try {
      console.log('Handling answer');
      
      if (peerConnection && peerConnection.signalingState === 'have-local-offer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('Set remote description (answer)');
      }
    } catch (err) {
      console.error('Error handling answer:', err);
      setError('Failed to establish connection');
    }
  };
  
  const handleIceCandidate = async (candidate) => {
    try {
      if (peerConnection && peerConnection.remoteDescription) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('Added ICE candidate');
      }
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
    }
  };
  
  const endCall = (notifyRemote = true) => {
    console.log('Ending call...');
    
    if (notifyRemote && socket) {
      socket.emit('end-call', { roomId });
    }
    
    cleanup();
    setCallStatus('ended');
    
    if (onCallEnd) {
      onCallEnd();
    }
  };
  
  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const enabled = !audioTracks[0].enabled;
        audioTracks[0].enabled = enabled;
        setIsAudioMuted(!enabled);
        console.log('Audio', enabled ? 'unmuted' : 'muted');
      }
    }
  };
  
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const enabled = !videoTracks[0].enabled;
        videoTracks[0].enabled = enabled;
        setIsVideoMuted(!enabled);
        console.log('Video', enabled ? 'enabled' : 'disabled');
      }
    }
  };
  
  const cleanup = () => {
    console.log('Cleaning up...');
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      setLocalStream(null);
    }
    
    // Close peer connection
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
      pcRef.current = null;
    }
    
    // Clear remote stream
    setRemoteStream(null);
    
    // Clear timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    
    // Disconnect socket
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    
    // Reset states
    setIsCallActive(false);
    setCallDuration(0);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    setIsRinging(false);
    setIncomingCall(null);
    setConnectedUsers([]);
  };
  
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'success';
      case 'connecting': case 'calling': return 'info';
      case 'ready': return 'secondary';
      case 'error': case 'failed': return 'danger';
      case 'rejected': return 'warning';
      default: return 'secondary';
    }
  };
  
  const getStatusText = () => {
    switch (callStatus) {
      case 'initializing': return 'Initializing...';
      case 'ready': return `Ready (${connectedUsers.length} users)`;
      case 'calling': return 'Calling...';
      case 'ringing': return 'Incoming call...';
      case 'connecting': return 'Connecting...';
      case 'connected': return `Connected - ${formatDuration(callDuration)}`;
      case 'disconnected': return 'Disconnected';
      case 'rejected': return 'Call rejected';
      case 'ended': return 'Call ended';
      case 'failed': return 'Connection failed';
      case 'error': return 'Error occurred';
      default: return status;
    }
  };
  
  return (
    <div className="video-call-system h-100">
      {/* Incoming Call Modal */}
      {isRinging && incomingCall && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="fas fa-video me-2"></i>
                  Incoming Video Call
                </h5>
              </div>
              <div className="modal-body text-center">
                <div className="mb-4">
                  <div className="avatar-circle bg-primary text-white mb-3" style={{ width: '80px', height: '80px', margin: '0 auto' }}>
                    <i className="fas fa-user fa-2x" style={{ lineHeight: '80px' }}></i>
                  </div>
                  <h4>{incomingCall.fromUserName}</h4>
                  <p className="text-muted">is calling you for a video consultation</p>
                </div>
                
                <div className="d-flex gap-3 justify-content-center">
                  <button 
                    className="btn btn-success btn-lg px-4"
                    onClick={acceptCall}
                  >
                    <i className="fas fa-phone me-2"></i>
                    Accept
                  </button>
                  <button 
                    className="btn btn-danger btn-lg px-4"
                    onClick={rejectCall}
                  >
                    <i className="fas fa-phone-slash me-2"></i>
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Video Interface */}
      <div className="video-interface h-100 d-flex flex-column">
        {/* Status Bar */}
        <div className="bg-light p-2 d-flex justify-content-between align-items-center">
          <div>
            <span className={`badge bg-${getStatusColor(callStatus)} me-2`}>
              {getStatusText()}
            </span>
            {connectedUsers.length > 0 && (
              <small className="text-muted">
                Users: {connectedUsers.map(u => u.name).join(', ')}
              </small>
            )}
          </div>
          <div>
            <span className="text-muted">{user.name} ({userRole})</span>
          </div>
        </div>
        
        {/* Video Container */}
        <div className="video-container flex-grow-1 position-relative bg-dark">
          {/* Remote Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video w-100 h-100"
            style={{ objectFit: 'cover' }}
          />
          
          {/* Remote Video Placeholder */}
          {!remoteStream && (
            <div className="position-absolute top-50 start-50 translate-middle text-center text-white">
              <i className="fas fa-user fa-4x mb-3 opacity-50"></i>
              <h4>
                {callStatus === 'calling' ? 'Calling...' : 
                 callStatus === 'connecting' ? 'Connecting...' : 
                 callStatus === 'ready' ? 'Ready to call' :
                 callStatus === 'initializing' ? 'Initializing...' :
                 'Waiting for video...'}
              </h4>
            </div>
          )}
          
          {/* Local Video */}
          <div 
            className="local-video-container position-absolute"
            style={{ 
              bottom: '20px', 
              right: '20px',
              width: '200px',
              height: '150px',
              zIndex: 10
            }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-100 h-100"
              style={{ 
                border: '2px solid white',
                borderRadius: '8px',
                objectFit: 'cover'
              }}
            />
            {!localStream && (
              <div className="position-absolute top-50 start-50 translate-middle text-white">
                <i className="fas fa-video-slash"></i>
              </div>
            )}
          </div>
        </div>
        
        {/* Controls */}
        <div className="controls bg-light p-3">
          <div className="d-flex justify-content-center gap-2">
            {/* Start Call (Patient) */}
            {callStatus === 'ready' && userRole === 'patient' && connectedUsers.length > 0 && (
              <button 
                className="btn btn-success btn-lg"
                onClick={initiateCall}
              >
                <i className="fas fa-video me-2"></i>
                Start Call
              </button>
            )}
            
            {/* Call Controls */}
            {(['calling', 'connecting', 'connected'].includes(callStatus)) && (
              <>
                <button 
                  className={`btn ${isAudioMuted ? 'btn-danger' : 'btn-outline-primary'}`}
                  onClick={toggleAudio}
                  title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  <i className={`fas fa-microphone${isAudioMuted ? '-slash' : ''}`}></i>
                </button>

                <button 
                  className={`btn ${isVideoMuted ? 'btn-danger' : 'btn-outline-primary'}`}
                  onClick={toggleVideo}
                  title={isVideoMuted ? 'Turn On Video' : 'Turn Off Video'}
                >
                  <i className={`fas fa-video${isVideoMuted ? '-slash' : ''}`}></i>
                </button>

                <button 
                  className="btn btn-danger"
                  onClick={() => endCall(true)}
                >
                  <i className="fas fa-phone-slash me-1"></i>
                  End Call
                </button>
              </>
            )}
            
            {/* Retry button for failed states */}
            {(['error', 'failed', 'rejected'].includes(callStatus)) && (
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                <i className="fas fa-redo me-2"></i>
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Error Alert */}
      {error && (
        <div className="position-fixed bottom-0 end-0 m-3" style={{ zIndex: 1050 }}>
          <div className="alert alert-danger alert-dismissible">
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError(null)}
            ></button>
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;