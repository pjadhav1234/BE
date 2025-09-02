// frontend/src/Patient/JoinConsultation.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import VideoCallSystem from '../components/VideoCall';

const JoinConsultation = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        if (!token || !user?.id) return navigate('/login');

        const res = await axios.get(
          `http://localhost:5000/api/appointments/patient/${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Filter only Accepted appointments
        const acceptedAppointments = (res.data || []).filter(a => a.status === 'Accepted');
        setAppointments(acceptedAppointments);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'patient') fetchAppointments();
    else navigate('/login');
  }, [user?.id, navigate, token]);

  const handleStartVideoCall = (appointment) => {
    setActiveCall({
      appointmentId: appointment._id,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      patientId: user.id,
      patientName: user.name,
    });
    setShowVideoCall(true);
  };

  const handleEndCall = () => {
    setShowVideoCall(false);
    setActiveCall(null);
  };

  const getAppointmentDateTime = (appointment) => {
    const date = new Date(appointment.date);
    return { date: date.toLocaleDateString(), time: appointment.time || '00:00' };
  };

  const isAppointmentTime = (appointment) => {
    if (!appointment?.time) return false;
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    const [hours, minutes] = appointment.time.split(':');
    appointmentDate.setHours(parseInt(hours), parseInt(minutes));
    const diff = now.getTime() - appointmentDate.getTime();
    return diff >= -15 * 60 * 1000 && diff <= 30 * 60 * 1000;
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Loading your accepted consultations...</p>
      </div>
    );
  }

  if (showVideoCall && activeCall) {
    return (
      <div className="container-fluid p-0">
        <div className="d-flex justify-content-between align-items-center p-3 bg-light">
          <h4>Video Consultation with Dr. {activeCall.doctorName}</h4>
          <button className="btn btn-outline-secondary btn-sm" onClick={handleEndCall}>
            Back
          </button>
        </div>
        <VideoCallSystem
          appointmentId={activeCall.appointmentId}
          doctorId={activeCall.doctorId}
          patientId={activeCall.patientId}
          onCallEnd={handleEndCall}
          userRole="patient"
        />
      </div>
    );
  }

  const now = new Date();
  const upcomingAppointments = appointments.filter(a => new Date(a.date) >= now);
  const pastAppointments = appointments.filter(a => new Date(a.date) < now);

  return (
    <div className="container mt-4">
      <h2 className="mb-4"><i className="fas fa-video text-primary me-2"></i>Accepted Consultations</h2>

      {/* Upcoming */}
      <h4 className="mb-3">Upcoming Appointments</h4>
      {upcomingAppointments.length === 0 ? <p>No upcoming accepted appointments.</p> : (
        <div className="row">
          {upcomingAppointments.map((appointment) => {
            const { date, time } = getAppointmentDateTime(appointment);
            const canJoin = isAppointmentTime(appointment);
            return (
              <div key={appointment._id} className="col-md-6 mb-3">
                <div className="card shadow-sm border-success">
                  <div className="card-body">
                    <h5>Dr. {appointment.doctorName}</h5>
                    <p><strong>Date:</strong> {date}</p>
                    <p><strong>Time:</strong> {time}</p>
                    <p><strong>Status:</strong> {appointment.status}</p>
                    {canJoin ? (
                      <button className="btn btn-success" onClick={() => handleStartVideoCall(appointment)}>
                        Join Video Call
                      </button>
                    ) : (
                      <button className="btn btn-outline-secondary" disabled>
                        Not Time Yet
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Past */}
      <h4 className="mt-5 mb-3">Past Appointments</h4>
      {pastAppointments.length === 0 ? <p>No past accepted appointments.</p> : (
        <div className="list-group">
          {pastAppointments.map((appointment) => {
            const { date, time } = getAppointmentDateTime(appointment);
            return (
              <div key={appointment._id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>Dr. {appointment.doctorName}</strong><br />
                  <small>{date} at {time}</small>
                </div>
                <span className="badge bg-success">Accepted</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JoinConsultation;
