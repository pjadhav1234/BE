// import React, { useEffect, useRef, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import io from 'socket.io-client';

// const socket = io('http://localhost:5000');

// const VideoCall = () => {
//   const [params] = useSearchParams();
//   const roomName = params.get('room');

//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const peerConnection = useRef(null);
//   const localStream = useRef(null);

//   useEffect(() => {
//     const startCall = async () => {
//       try {
//         localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//         localVideoRef.current.srcObject = localStream.current;

//         peerConnection.current = new RTCPeerConnection();

//         localStream.current.getTracks().forEach(track => {
//           peerConnection.current.addTrack(track, localStream.current);
//         });

//         peerConnection.current.ontrack = (event) => {
//           remoteVideoRef.current.srcObject = event.streams[0];
//         };

//         socket.emit('join-room', roomName);

//         socket.on('offer', async (offer) => {
//           await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//           const answer = await peerConnection.current.createAnswer();
//           await peerConnection.current.setLocalDescription(answer);
//           socket.emit('answer', { answer, room: roomName });
//         });

//         socket.on('answer', async (answer) => {
//           await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
//         });

//         socket.on('candidate', async (candidate) => {
//           if (candidate) {
//             await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//           }
//         });

//         peerConnection.current.onicecandidate = (event) => {
//           if (event.candidate) {
//             socket.emit('candidate', { candidate: event.candidate, room: roomName });
//           }
//         };

//         const offer = await peerConnection.current.createOffer();
//         await peerConnection.current.setLocalDescription(offer);
//         socket.emit('offer', { offer, room: roomName });
//       } catch (err) {
//         console.error('Error starting video call:', err);
//       }
//     };

//     startCall();

//     return () => {
//       localStream.current?.getTracks().forEach(track => track.stop());
//       socket.disconnect();
//     };
//   }, [roomName]);

//   return (
//     <div className="container text-center mt-5">
//       <h3>Video Consultation</h3>
//       <div className="row">
//         <div className="col-md-6">
//           <h5>Your Video</h5>
//           <video ref={localVideoRef} autoPlay muted playsInline width="100%" height="300px" />
//         </div>
//         <div className="col-md-6">
//           <h5>Doctor's Video</h5>
//           <video ref={remoteVideoRef} autoPlay playsInline width="100%" height="300px" />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoCall;
