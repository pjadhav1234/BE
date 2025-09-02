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

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!user?.id) return;
        const res = await axios.get(
          `http://localhost:5000/api/appointments/doctor/${user.id}`
        );
        setAppointments(res.data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
    };
    fetchAppointments();
  }, [user?.id]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const payload = {
        status: newStatus,
        scheduledDate: scheduleDate || undefined,
        scheduledTime: scheduleTime || undefined
      };

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

  // Group appointments by priority
  const emergencyAppointments = appointments.filter(a => a.isEmergency);
  const regularAppointments = appointments.filter(a => !a.isEmergency);

  const renderAppointmentCard = (appointment) => (
    <div
      className={`card p-3 mb-2 ${appointment.isEmergency ? 'border-danger' : ''}`}
      key={appointment._id}
    >
      {/* Emergency Alert */}
      {appointment.isEmergency && (
        <div className="alert alert-danger mb-2">
          <strong>🚨 EMERGENCY APPOINTMENT</strong>
          <br />
          <small>
            Keywords detected: {appointment.emergencyKeywords?.join(', ')}
          </small>
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <p><strong>Patient Name:</strong> {appointment.patient?.name || 'Unknown'}</p>
          <p><strong>Contact:</strong> {appointment.patient?.contact || 'N/A'}</p>
          <p><strong>Email:</strong> {appointment.patient?.email || 'N/A'}</p>
          <p><strong>Symptoms:</strong> {appointment.symptoms || 'Not specified'}</p>
        </div>
        
        <div className="col-md-6">
          <p><strong>Preferred Date:</strong> {
            appointment.preferredDate 
              ? new Date(appointment.preferredDate).toLocaleDateString() 
              : "Not specified"
          }</p>
          <p><strong>Preferred Time:</strong> {appointment.preferredTime || "Not specified"}</p>
          
          {appointment.scheduledDate && (
            <>
              <p><strong>Scheduled Date:</strong> {new Date(appointment.scheduledDate).toLocaleDateString()}</p>
              <p><strong>Scheduled Time:</strong> {appointment.scheduledTime}</p>
            </>
          )}
          
          <p><strong>Status:</strong> 
            <span className={`badge ms-2 ${
              appointment.status === 'pending' ? 'bg-warning' :
              appointment.status === 'accepted' ? 'bg-success' :
              appointment.status === 'completed' ? 'bg-info' :
              appointment.status === 'rejected' ? 'bg-danger' : 'bg-secondary'
            }`}>
              {appointment.status.toUpperCase()}
            </span>
          </p>
        </div>
      </div>

      {/* Action Buttons based on status */}
      {appointment.status === "pending" && (
        <div className="mt-3">
          {scheduling === appointment._id ? (
            <div className="row">
              <div className="col-md-4">
                <label className="form-label">Select Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Select Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <button
                  onClick={() => handleStatusUpdate(appointment._id, "accepted")}
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
            </div>
          ) : (
            <div>
              <button
                onClick={() => setScheduling(appointment._id)}
                className="btn btn-success me-2"
              >
                Accept & Schedule
              </button>
              <button
                onClick={() => handleStatusUpdate(appointment._id, "rejected")}
                className="btn btn-danger"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      )}

      {appointment.status === "accepted" && (
        <div className="mt-3">
          <button
            onClick={() => handleJoinVC(appointment._id)}
            className="btn btn-primary me-2"
          >
            Join Video Call
          </button>
          <button
            onClick={() => handleStatusUpdate(appointment._id, "completed")}
            className="btn btn-success"
          >
            Mark as Completed
          </button>
        </div>
      )}

      {appointment.status === "completed" && (
        <div className="mt-3">
          <span className="text-success">
            <i className="fas fa-check-circle me-1"></i>
            Consultation completed
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mt-4">
      <h3>Manage Appointments</h3>

      {appointments.length === 0 && (
        <div className="text-center mt-5">
          <p>No appointments found.</p>
        </div>
      )}

      {/* Emergency Appointments Section */}
      {emergencyAppointments.length > 0 && (
        <div className="mb-5">
          <h4 className="text-danger">🚨 Emergency Appointments</h4>
          <div className="alert alert-warning">
            <strong>Priority:</strong> These appointments require immediate attention
          </div>
          {emergencyAppointments.map(renderAppointmentCard)}
        </div>
      )}

      {/* Regular Appointments Section */}
      {regularAppointments.length > 0 && (
        <div>
          <h4>Regular Appointments</h4>
          {regularAppointments.map(renderAppointmentCard)}
        </div>
      )}
    </div>
  );
};

export default ManageAppointments;