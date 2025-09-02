import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import VideoCallSystem from "../components/VideoCall";

const VideoCall = () => {
  const [searchParams] = useSearchParams();
  const room = searchParams.get("room");

  useEffect(() => {
    if (room) {
      VideoCallSystem.joinRoom(room); // auto-join
    }
  }, [room]);

  return (
    <div className="container-fluid p-0">
      <h4>Video Consultation Room: {room}</h4>
      <VideoCallSystem room={room} />
    </div>
  );
};

export default VideoCall;
