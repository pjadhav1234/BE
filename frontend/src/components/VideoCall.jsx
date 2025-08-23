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
  const [callStatus, setCallStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [roomId, setRoomId] = useState(`appointment-${appointmentId}`);
  const [callDuration, setCallDuration] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callTimerRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      console.log('Connected to server with ID:', newSocket.id);
      
      // Join the room for this appointment
      newSocket.emit('join-room', roomId, user.id, user.name, userRole);
    });
    
    // Handle user joined event
    newSocket.on('user-joined', (userId, userName) => {
      console.log('User joined:', userName);
      
      if (userRole === 'doctor' && callStatus === 'idle') {
        // Doctor should wait for patient to initiate call
        setCallStatus('waiting');
      } else if (userRole === 'patient') {
        // Patient should initiate call when doctor joins
        initiateCall();
      }
    });
    
    // Handle incoming call
    newSocket.on('incoming-call', (data) => {
      console.log('Incoming call from:', data.fromUserName);
      setIncomingCall(data);
      setIsRinging(true);
      setCallStatus('ringing');
    });
    
    // Handle call accepted - FIXED: This event doesn't contain an offer
    newSocket.on('call-accepted', (data) => {
      console.log('Call accepted by:', data.userName);
      setCallStatus('connecting');
      // Doctor has accepted, no need to create answer here
    });
    
    // Handle WebRTC offer
    newSocket.on('offer', async (data) => {
      console.log('Received offer from:', data.fromUserName);
      if (userRole === 'doctor') {
        await handleOffer(data.offer);
      }
    });
    
    // Handle WebRTC answer
    newSocket.on('answer', async (data) => {
      console.log('Received answer from:', data.fromUserName);
      if (userRole === 'patient') {
        await handleAnswer(data.answer);
      }
    });
    
    // Handle ICE candidate
    newSocket.on('ice-candidate', async (data) => {
      console.log('Received ICE candidate');
      await handleIceCandidate(data.candidate);
    });
    
    // Handle call ended
    newSocket.on('call-ended', () => {
      console.log('Call ended by remote user');
      setCallStatus('ended');
      cleanup();
      if (onCallEnd) onCallEnd();
    });
    
    // Handle errors
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setError(error.message);
    });
    
    return () => {
      newSocket.disconnect();
    };
  }, [roomId, userRole]);
  
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
  
  // Initialize media stream
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Failed to access camera/microphone. Please check your permissions.');
      throw err;
    }
  };
  
  // Create peer connection
  const createPeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
    
    const pc = new RTCPeerConnection(configuration);
    
    // Add local stream to connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }
    
    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote stream');
      const remoteStream = event.streams[0];
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          roomId: roomId
        });
      }
    };
    
    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
        setIsCallActive(true);
      } else if (pc.connectionState === 'disconnected' || 
                 pc.connectionState === 'failed') {
        setCallStatus('ended');
        cleanup();
      }
    };
    
    setPeerConnection(pc);
    return pc;
  };
  
  // Initiate call (patient)
  const initiateCall = async () => {
    try {
      setCallStatus('calling');
      await initializeMedia();
      const pc = createPeerConnection();
      
      // Send call notification to doctor
      if (socket) {
        socket.emit('incoming-call', {
          roomId: roomId,
          fromUserId: user.id,
          fromUserName: user.name,
          fromUserRole: userRole
        });
      }
      
      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      if (socket) {
        socket.emit('offer', {
          offer: offer,
          roomId: roomId,
          fromUserId: user.id,
          fromUserName: user.name
        });
      }
    } catch (err) {
      console.error('Error initiating call:', err);
      setError('Failed to initiate call');
    }
  };
  
  // Accept incoming call (doctor)
  const acceptCall = async () => {
    try {
      setIsRinging(false);
      setCallStatus('connecting');
      await initializeMedia();
      await createPeerConnection();
      
      if (socket) {
        socket.emit('accept-call', {
          roomId: roomId,
          fromUserId: incomingCall.fromUserId
        });
      }
      
      // After accepting, the doctor will handle the offer when it arrives
      setIncomingCall(null);
    } catch (err) {
      console.error('Error accepting call:', err);
      setError('Failed to accept call');
    }
  };
  
  // Reject incoming call
  const rejectCall = () => {
    if (socket) {
      socket.emit('reject-call', {
        roomId: roomId,
        fromUserId: incomingCall.fromUserId
      });
    }
    
    setIsRinging(false);
    setIncomingCall(null);
    setCallStatus('idle');
  };
  
  // Handle WebRTC offer (doctor handles patient's offer)
  const handleOffer = async (offer) => {
    try {
      if (!peerConnection) {
        await initializeMedia();
        await createPeerConnection();
      }
      
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      if (socket) {
        socket.emit('answer', {
          answer: answer,
          roomId: roomId,
          fromUserId: user.id,
          fromUserName: user.name
        });
      }
    } catch (err) {
      console.error('Error handling offer:', err);
      setError('Failed to handle call request');
    }
  };
  
  // Handle WebRTC answer (patient handles doctor's answer)
  const handleAnswer = async (answer) => {
    try {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
    } catch (err) {
      console.error('Error handling answer:', err);
      setError('Failed to establish connection');
    }
  };
  
  // Handle ICE candidate
  const handleIceCandidate = async (candidate) => {
    try {
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);
      }
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
    }
  };
  
  // End call
  const endCall = () => {
    if (socket) {
      socket.emit('end-call', { roomId });
    }
    setCallStatus('ended');
    cleanup();
    if (onCallEnd) onCallEnd();
  };
  
  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !audioTracks[0].enabled;
        setIsAudioMuted(!audioTracks[0].enabled);
      }
    }
  };
  
  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !videoTracks[0].enabled;
        setIsVideoMuted(!videoTracks[0].enabled);
      }
    }
  };
  
  // Cleanup function
  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }
    
    setLocalStream(null);
    setRemoteStream(null);
    setPeerConnection(null);
    setIsCallActive(false);
    setCallDuration(0);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    setIsRinging(false);
    setIncomingCall(null);
  };
  
  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="video-call-system">
      {/* Incoming Call Modal */}
      {isRinging && incomingCall && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Incoming Video Call</h5>
              </div>
              <div className="modal-body text-center">
                <div className="mb-3">
                  <i className="fas fa-video fa-3x text-primary mb-2"></i>
                  <h4>{incomingCall.fromUserName}</h4>
                  <p>is calling you for a video consultation</p>
                </div>
                <div className="d-flex gap-2 justify-content-center">
                  <button className="btn btn-success" onClick={acceptCall}>
                    <i className="fas fa-phone me-1"></i> Accept
                  </button>
                  <button className="btn btn-danger" onClick={rejectCall}>
                    <i className="fas fa-phone-slash me-1"></i> Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Video Interface */}
      <div className="video-interface">
        <div className="video-container position-relative bg-dark rounded">
          {/* Remote Video */}
          <div className="remote-video-container">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="remote-video w-100"
              style={{ 
                height: '400px', 
                borderRadius: '8px'
              }}
            />
            {!remoteStream && (
              <div className="position-absolute top-50 start-50 translate-middle text-center text-white">
                <i className="fas fa-user fa-3x mb-2"></i>
                <p>
                  {callStatus === 'calling' ? 'Calling...' : 
                   callStatus === 'connecting' ? 'Connecting...' : 
                   callStatus === 'waiting' ? 'Waiting for participant...' : 
                   'No video available'}
                </p>
              </div>
            )}
          </div>
          
          {/* Local Video */}
          {localStream && (
            <div className="local-video-container position-absolute" style={{ 
              bottom: '20px', 
              right: '20px',
              width: '160px',
              height: '120px'
            }}>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="local-video w-100 h-100"
                style={{ 
                  border: '2px solid white',
                  borderRadius: '8px'
                }}
              />
            </div>
          )}
        </div>
        
        {/* Call Controls */}
        <div className="call-controls d-flex gap-2 justify-content-center mt-3">
          {callStatus === 'idle' && userRole === 'patient' && (
            <button className="btn btn-success" onClick={initiateCall}>
              <i className="fas fa-video me-1"></i> Start Call
            </button>
          )}
          
          {(callStatus === 'calling' || callStatus === 'connecting' || callStatus === 'connected') && (
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

              <button className="btn btn-danger" onClick={endCall}>
                <i className="fas fa-phone-slash me-1"></i> End Call
              </button>
            </>
          )}
        </div>
        
        {/* Call Status */}
        {callStatus !== 'idle' && (
          <div className="call-status text-center mt-2">
            <div className={`badge ${
              callStatus === 'calling' ? 'bg-warning' :
              callStatus === 'connecting' ? 'bg-info' :
              callStatus === 'connected' ? 'bg-success' : 
              callStatus === 'waiting' ? 'bg-secondary' : 'bg-danger'
            }`}>
              {callStatus === 'calling' && 'Calling...'}
              {callStatus === 'connecting' && 'Connecting...'}
              {callStatus === 'connected' && `Connected - ${formatDuration(callDuration)}`}
              {callStatus === 'waiting' && 'Waiting for participant...'}
              {callStatus === 'ended' && 'Call Ended'}
            </div>
          </div>
        )}
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="alert alert-danger mt-3">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
    </div>
  );
};

export default VideoCall;