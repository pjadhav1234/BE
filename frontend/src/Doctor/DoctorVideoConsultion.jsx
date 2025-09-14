import React from "react";
import { useSearchParams } from "react-router-dom";
import VideoCallSystem from "../components/VideoCall";
import DrTranscriptSystem from "../components/drTranscript.jsx";

const DoctorVideoConsultation = () => {
  const [searchParams] = useSearchParams();
  const room = searchParams.get("room") || "defaultRoom";

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <div className="container p-4">
      <h3 className="text-2xl font-bold mb-4">
        Doctor Consultation Room: {room}
      </h3>

      {/* Video Call */}
      <VideoCallSystem room={room} role="doctor" userId={user?.id} />

      {/* Transcript System */}
      <DrTranscriptSystem room={room} role="doctor" />
    </div>
  );
};

export default DoctorVideoConsultation;
