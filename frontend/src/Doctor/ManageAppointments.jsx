// src/Doctor/DoctorDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [scheduling, setScheduling] = useState(null); // store appointment id being scheduled
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // 🚨 Critical symptom keywords
  const emergencyKeywords = [
    "fever",
    "chest pain",
    "breathing difficulty",
    "unconscious",
    "severe headache",
    "bleeding",
    "seizure",
  ];

  // 🔍 Function to check emergency symptoms
  const isEmergency = (symptoms = "") => {
    const lowerSymptoms = symptoms.toLowerCase();
    return emergencyKeywords.some((kw) => lowerSymptoms.includes(kw));
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!user?.id) return;
        const res = await axios.get(
          `http://localhost:5000/api/appointments/doctor/${user.id}`
        );

        // 🚨 Auto-mark emergencies
        const updatedAppointments = res.data.map((a) =>
          isEmergency(a.symptoms) ? { ...a} : a
        );

        setAppointments(updatedAppointments);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };
    fetchAppointments();
  }, [user?.id]);

  const handleStatus = async (id, sAtatus) => {
  try {
    const payload = {
      scheduledDate: scheduleDate || undefined,
      scheduledTime: scheduleTime || undefined
    };

    // Preserve Emergency status
    if (appointments.find(a => a._id === id)?.status === "Emergency") {
      status = "Emergency";
    }

    const res = await axios.put(
      `http://localhost:5000/api/appointments/update/${id}`,
      payload
    );

    setAppointments(prev =>
      prev.map(a => (a._id === id ? res.data : a))
    );

    setScheduling(null);
    setScheduleDate("");
    setScheduleTime("");

  } catch (err) {
    console.error("Error updating appointment:", err);
    alert("Failed to update status");
  }
};




  const handleJoinVC = (id) => navigate(`/doctor/videoCall?room=${id}`);

  return (
    <div className="container mt-4">
      <h3>Your Appointments</h3>
      {appointments.length === 0 && <p>No appointments found.</p>}
     {appointments.map((a) => (
  <div
    className={`card p-3 mb-2`}
    key={a._id}
  >
    <p>
      <strong>Patient Name:</strong> {a.patientId?.name || a.patientId}
    </p>
    <p>
  <strong>Date:</strong> {a.scheduledDate ? new Date(a.scheduledDate).toLocaleDateString() : "⏳ Not scheduled yet"}
</p>
<p>
  <strong>Time:</strong> {a.scheduledTime || "⏳ Not scheduled yet"}
</p>
<p><strong>Date:</strong> {a.preferredDate || "⏳ Not scheduled yet"}</p>
<p><strong>Time:</strong> {a.preferredTime || "⏳ Not scheduled yet"}</p>


    <p>
      <strong>Symptoms:</strong> {a.symptoms}
    </p>
    <p>
      <strong>Status:</strong> {a.status}
    </p>

    {/* ✅ Show extra line if emergency */}
    {isEmergency(a.symptoms) && (
      <p className="text-danger fw-bold">⚠️ This is an emergency appointment!</p>
    )}

    {/* Show Accept/Reject if Pending */}
    {a.status === "Pending" && (
      <div>
        {scheduling === a._id ? (
          <div className="mt-2">
            <label className="form-label">Select Date</label>
            <input
              type="date"
              className="form-control mb-2"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
            />
            <label className="form-label">Select Time</label>
            <input
              type="time"
              className="form-control mb-2"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
            />
            <button
              onClick={() =>
                handleStatus(a._id, "Accepted", scheduleDate, scheduleTime)
              }
              className="btn btn-success me-2"
              disabled={!scheduleDate || !scheduleTime}
            >
              Confirm
            </button>
            <button
              onClick={() => setScheduling(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setScheduling(a._id)}
              className="btn btn-success me-2"
            >
              Accept & Schedule
            </button>
            <button
              onClick={() => handleStatus(a._id, "Rejected")}
              className="btn btn-danger"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    )}

    {a.status === "Accepted" && (
      <button
        onClick={() => handleJoinVC(a._id)}
        className="btn btn-primary mt-2"
      >
        Join Call
      </button>
    )}
  </div>
))}

    </div>
  );
};

export default ManageAppointments;
