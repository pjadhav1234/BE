import React from "react";
import { useSearchParams } from "react-router-dom";
import VideoCallSystem from "../components/VideoCall";
import PatientTranscript from "../components/patTranscriptSystem";

const PatientVideoCall = () => {
  const [searchParams] = useSearchParams();
  const room = searchParams.get("room") || "defaultRoom";

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <div className="container p-4">
      <h3 className="text-2xl font-bold mb-4">
        Patient Consultation Room: {room}
      </h3>

      {/* Video call */}
      <VideoCallSystem room={room} role="patient" userId={user?.id} />

      {/* Real-time transcription + translation */}
      <PatientTranscript room={room} />
    </div>
  );
};

export default PatientVideoCall;
