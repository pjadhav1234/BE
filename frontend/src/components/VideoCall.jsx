// src/components/VideoCall.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Backend URL

const VideoCall = ({ role }) => {
  const { id: roomId } = useParams(); // appointment ID as room ID
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnection = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const initCall = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;

      peerConnection.current = new RTCPeerConnection();
      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });

      peerConnection.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { roomId, candidate: event.candidate });
        }
      };

      socket.emit("join-room", roomId);

      socket.on("user-joined", async () => {
        if (role === "doctor") {
          const offer = await peerConnection.current.createOffer();
          await peerConnection.current.setLocalDescription(offer);
          socket.emit("offer", { roomId, offer, sender: role });
        }
      });

      socket.on("offer", async (offer) => {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("answer", { roomId, answer });
      });

      socket.on("answer", async (answer) => {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        setConnected(true);
      });

      socket.on("ice-candidate", async (candidate) => {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      });
    };

    initCall();
  }, [roomId, role]);

  return (
    <div className="container mt-4">
      <h2>{role === "doctor" ? "Doctor Video Call" : "Patient Video Call"}</h2>
      <div className="d-flex gap-3">
        <video ref={localVideoRef} autoPlay muted playsInline width="300" className="border" />
        <video ref={remoteVideoRef} autoPlay playsInline width="300" className="border" />
      </div>
      {connected && <p className="text-success mt-3">Connected!</p>}
    </div>
  );
};

export default VideoCall;
