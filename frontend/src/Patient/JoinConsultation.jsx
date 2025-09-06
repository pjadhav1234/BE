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

        // Filter only accepted appointments
        const acceptedAppointments = (res.data || []).filter(a => a.status === 'accepted');
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
    // Use scheduled date/time if available, otherwise use preferred
    const date = appointment.scheduledDate ? 
      new Date(appointment.scheduledDate) : 
      new Date(appointment.preferredDate);
    const time = appointment.scheduledTime || appointment.preferredTime || '00:00';
    
    return { 
      date: date.toLocaleDateString(), 
      time: time
    };
  };

  const isAppointmentTime = (appointment) => {
    // Check if it's time for the appointment (15 minutes before to 30 minutes after)
    const scheduledDate = appointment.scheduledDate || appointment.preferredDate;
    const scheduledTime = appointment.scheduledTime || appointment.preferredTime;
    
    if (!scheduledDate || !scheduledTime) return false;
    
    const now = new Date();
    const appointmentDate = new Date(scheduledDate);
    const [hours, minutes] = scheduledTime.split(':');
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
  const upcomingAppointments = appointments.filter(a => {
    const appointmentDate = a.scheduledDate || a.preferredDate;
    return new Date(appointmentDate) >= now;
  });
  const pastAppointments = appointments.filter(a => {
    const appointmentDate = a.scheduledDate || a.preferredDate;
    return new Date(appointmentDate) < now;
  });

  return (
    <div className="container mt-4">
      <h2 className="mb-4">
        <i className="fas fa-video text-primary me-2"></i>
        Accepted Consultations
      </h2>

    
      {upcomingAppointments.length === 0 ? (
        <p>No upcoming accepted appointments.</p>
      ) : (
        <div className="row">
          {upcomingAppointments.map((appointment) => {
            const { date, time } = getAppointmentDateTime(appointment);
            const canJoin = isAppointmentTime(appointment);
            
            return (
              <div key={appointment._id} className="col-md-6 mb-3">
                <div className={`card shadow-sm ${appointment.isEmergency ? 'border-danger' : 'border-success'}`}>
                  <div className="card-body">
                    {appointment.isEmergency && (
                      <div className="badge bg-danger mb-2">Emergency Appointment</div>
                    )}
                    <h5>Dr. {appointment.doctorName}</h5>
                    <p><strong>Specialization:</strong> {appointment.specialization}</p>
                    <p><strong>Date:</strong> {date}</p>
                    <p><strong>Time:</strong> {time}</p>
                    <p><strong>Status:</strong> 
                      <span className="badge bg-success ms-2">
                        {appointment.status.toUpperCase()}
                      </span>
                    </p>
                    
                    {appointment.symptoms && (
                      <p><strong>Symptoms:</strong> {appointment.symptoms}</p>
                    )}
                    
                    <div className="mt-3">
                      {canJoin ? (
                        <button 
                          className="btn btn-success" 
                          onClick={() => handleStartVideoCall(appointment)}
                        >
                          <i className="fas fa-video me-1"></i>
                          Join Video Call
                        </button>
                      ) : (
                        <button className="btn btn-outline-secondary" disabled>
                          <i className="fas fa-clock me-1"></i>
                          Not Time Yet
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Past Appointments */}
      
      {pastAppointments.length === 0 ? (
        <p>No past accepted appointments.</p>
      ) : (
        <div className="list-group">
          {pastAppointments.map((appointment) => {
            const { date, time } = getAppointmentDateTime(appointment);
            return (
              <div key={appointment._id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>Dr. {appointment.doctorName}</strong>
                  {appointment.isEmergency && (
                    <span className="badge bg-danger ms-2">Emergency</span>
                  )}
                  <br />
                  <small>{date} at {time}</small>
                  {appointment.symptoms && (
                    <>
                      <br />
                      <small className="text-muted">Symptoms: {appointment.symptoms}</small>
                    </>
                  )}
                </div>
                <span className="badge bg-success">Accepted</span>
                 {appointment.status === "accepted" && (
  <div className="mt-3">
    <button
      onClick={() => navigate(`/patient/videoCall?room=${appointment._id}`)}
      className="btn btn-primary"
    >
      Join Video Call
    </button>
  </div>
)}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JoinConsultation;