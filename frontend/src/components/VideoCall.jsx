// VideoCall.jsx - Key fixes for WebRTC issues
import React, { useEffect, useState, useRef } from 'react';

const VideoCall = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [error, setError] = useState(null);
  const [deviceError, setDeviceError] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Clean up function
  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
      });
    }
    if (peerConnection) {
      peerConnection.close();
    }
    setLocalStream(null);
    setRemoteStream(null);
    setPeerConnection(null);
    setIsCallActive(false);
  };

  // Initialize media with better error handling
  const initializeMedia = async () => {
    try {
      setError(null);
      setDeviceError(null);

      // Check if devices are available first
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devices.some(device => device.kind === 'videoinput');
      const hasAudio = devices.some(device => device.kind === 'audioinput');

      if (!hasVideo && !hasAudio) {
        throw new Error('No camera or microphone found');
      }

      // Try to get media with fallbacks
      let constraints = {
        video: hasVideo,
        audio: hasAudio
      };

      let stream;
      try {
        // First try with preferred quality
        stream = await navigator.mediaDevices.getUserMedia({
          video: hasVideo ? { width: 640, height: 480 } : false,
          audio: hasAudio ? { 
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true 
          } : false
        });
      } catch (firstError) {
        console.warn('High quality failed, trying basic constraints:', firstError);
        // Fallback to basic constraints
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (secondError) {
          // Try audio only
          if (hasAudio) {
            console.warn('Video failed, trying audio only:', secondError);
            stream = await navigator.mediaDevices.getUserMedia({ 
              video: false, 
              audio: true 
            });
          } else {
            throw secondError;
          }
        }
      }

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      
      // Provide specific error messages
      if (err.name === 'NotReadableError') {
        setDeviceError('Camera/microphone is being used by another application. Please close other apps using your camera/microphone and try again.');
      } else if (err.name === 'NotAllowedError') {
        setDeviceError('Camera/microphone access was denied. Please allow access and refresh the page.');
      } else if (err.name === 'NotFoundError') {
        setDeviceError('No camera or microphone found. Please connect a device and try again.');
      } else if (err.name === 'AbortError') {
        setDeviceError('Media access was aborted. Please try again.');
      } else {
        setDeviceError(`Media access error: ${err.message}`);
      }
      
      setError(err);
      throw err;
    }
  };

  // Create peer connection with consistent configuration
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    });

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote track');
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'failed') {
        setError(new Error('Connection failed'));
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
    };

    return pc;
  };

  // Create offer with better error handling
  const createOffer = async (pc, stream) => {
    try {
      // Add tracks consistently
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create offer with consistent options
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await pc.setLocalDescription(offer);
      console.log('Created and set local offer');
      return offer;
    } catch (err) {
      console.error('Error creating offer:', err);
      
      if (err.name === 'InvalidAccessError') {
        // Try to recreate the peer connection if SDP order is messed up
        console.log('SDP order issue detected, recreating peer connection...');
        pc.close();
        const newPc = createPeerConnection();
        
        // Re-add tracks
        stream.getTracks().forEach(track => {
          newPc.addTrack(track, stream);
        });
        
        const newOffer = await newPc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        
        await newPc.setLocalDescription(newOffer);
        setPeerConnection(newPc);
        return newOffer;
      }
      
      throw err;
    }
  };

  // Initialize call with comprehensive error handling
  const initializeCall = async () => {
    try {
      console.log('Initializing call...');
      
      // Clean up any existing connections first
      cleanup();
      
      // Get media first
      const stream = await initializeMedia();
      
      // Create peer connection
      const pc = createPeerConnection();
      setPeerConnection(pc);
      
      // Create offer
      await createOffer(pc, stream);
      
      setIsCallActive(true);
      console.log('Call initialized successfully');
      
    } catch (err) {
      console.error('Error initializing call:', err);
      setError(err);
      cleanup();
    }
  };

  // Component cleanup
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Retry function for device errors
  const retryMediaAccess = async () => {
    setDeviceError(null);
    setError(null);
    await initializeCall();
  };

  return (
    <div className="video-call-container">
      <div className="video-section">
        <div className="local-video-container">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="local-video"
          />
          <div className="video-label">You</div>
        </div>

        <div className="remote-video-container">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />
          <div className="video-label">Remote</div>
        </div>
      </div>

      {/* Error Display */}
      {deviceError && (
        <div className="alert alert-warning">
          <div className="d-flex align-items-center">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <div className="flex-grow-1">
              <strong>Device Access Issue:</strong>
              <div>{deviceError}</div>
            </div>
            <button 
              className="btn btn-sm btn-outline-warning"
              onClick={retryMediaAccess}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {error && !deviceError && (
        <div className="alert alert-danger">
          <i className="fas fa-times-circle me-2"></i>
          <strong>Call Error:</strong> {error.message}
        </div>
      )}

      {/* Controls */}
      <div className="call-controls">
        {!isCallActive ? (
          <button 
            className="btn btn-success btn-lg"
            onClick={initializeCall}
            disabled={!!error}
          >
            <i className="fas fa-video me-2"></i>
            Start Call
          </button>
        ) : (
          <button 
            className="btn btn-danger btn-lg"
            onClick={cleanup}
          >
            <i className="fas fa-phone-slash me-2"></i>
            End Call
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-3">
        <small className="text-muted">
          <strong>Troubleshooting:</strong>
          <ul>
            <li>Make sure no other apps are using your camera/microphone</li>
            <li>Close other browser tabs that might be using media devices</li>
            <li>Check that your browser has permission to access camera/microphone</li>
            <li>Try refreshing the page if issues persist</li>
          </ul>
        </small>
      </div>
    </div>
  );
};

export default VideoCall;