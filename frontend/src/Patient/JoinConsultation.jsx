// frontend/src/Patient/JoinConsultation.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const JoinConsultation = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchAcceptedAppointments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token || !user?.id) {
          console.error('No token or user ID found');
          setAppointments([]);
          setLoading(false);
          return;
        }

        console.log('Fetching appointments for patient:', user.id);
        
        // Try multiple endpoints to get patient appointments
        let res;
        try {
          // First try the patient-specific endpoint
          res = await axios.get(
            `http://localhost:5000/api/appointments/patient/${user.id}/accepted`,
            { headers: { Authorization: `Bearer ${token}` }}
          );
        } catch (firstError) {
          console.log('First endpoint failed, trying alternative...');
          // Try alternative - get all appointments and filter
          const allRes = await axios.get(
            `http://localhost:5000/api/appointments/patient`,
            { 
              headers: { Authorization: `Bearer ${token}` },
              params: { patientId: user.id }
            }
          );
          // Filter for accepted appointments
          res = { data: allRes.data.filter(apt => apt.status === 'Accepted') };
        }
        
        console.log('Appointments data:', res.data);
        setAppointments(res.data);
        
      } catch (err) {
        console.error('Error fetching accepted appointments:', err);
        console.error('Error response:', err.response?.data);
        
        // Try to create some mock data for testing if no real data
        console.log('Setting empty appointments array');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'patient' && user?.id) {
      fetchAcceptedAppointments();
    } else if (user?.role !== 'patient') {
      console.log('User is not a patient, redirecting...');
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [user?.id, navigate]);

  const handleJoinVideoCall = async (appointment) => {
    try {
      const token = localStorage.getItem('token');
      
      // Generate room for this appointment
      const roomResponse = await axios.get(
        `http://localhost:5000/api/video/generate-room/${appointment._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { roomId } = roomResponse.data;
      
      // Navigate to video call with room ID
      navigate(`/video-call?room=${roomId}`);
      
    } catch (error) {
      console.error('Error joining video call:', error);
      alert('Failed to join video call. Please try again.');
    }
  };

  const getAppointmentDateTime = (appointment) => {
    const date = new Date(appointment.date);
    return {
      date: date.toLocaleDateString(),
      time: appointment.time
    };
  };

  const isAppointmentToday = (appointment) => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    
    return appointmentDate.toDateString() === today.toDateString();
  };

  const isAppointmentTime = (appointment) => {
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    const [hours, minutes] = appointment.time.split(':');
    
    appointmentDate.setHours(parseInt(hours), parseInt(minutes));
    
    // Allow joining 15 minutes before and 30 minutes after appointment time
    const timeDiff = now.getTime() - appointmentDate.getTime();
    const fifteenMinutesBefore = -15 * 60 * 1000;
    const thirtyMinutesAfter = 30 * 60 * 1000;
    
    return timeDiff >= fifteenMinutesBefore && timeDiff <= thirtyMinutesAfter;
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">
            <i className="fas fa-video text-primary me-2"></i>
            Your Video Consultations
          </h2>

          {appointments.length === 0 ? (
            <div className="card text-center p-5">
              <div className="card-body">
                <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                <h5>No Accepted Appointments</h5>
                <p className="text-muted">
                  You don't have any accepted appointments yet. 
                  Book an appointment with a doctor to schedule a consultation.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/patient/appointments')}
                >
                  Book New Appointment
                </button>
              </div>
            </div>
          ) : (
            <div className="row">
              {appointments.map((appointment) => {
                const { date, time } = getAppointmentDateTime(appointment);
                const isToday = isAppointmentToday(appointment);
                const canJoin = isAppointmentTime(appointment) || isToday;

                return (
                  <div key={appointment._id} className="col-md-6 col-lg-4 mb-4">
                    <div className={`card h-100 shadow-sm ${isToday ? 'border-primary' : ''}`}>
                      {isToday && (
                        <div className="card-header bg-primary text-white text-center py-2">
                          <small><i className="fas fa-clock me-1"></i>Today's Appointment</small>
                        </div>
                      )}
                      
                      <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="card-title mb-1">
                              <i className="fas fa-user-md text-primary me-2"></i>
                              Dr. {appointment.doctorId?.name || appointment.doctorName || "Unknown"}
                            </h5>
                            <p className="text-muted small mb-0">
                              {appointment.doctorId?.specialization || "General Practitioner"}
                            </p>
                          </div>
                          <span className={`badge ${appointment.status === 'Accepted' ? 'bg-success' : 'bg-warning'}`}>
                            {appointment.status}
                          </span>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-calendar text-muted me-2"></i>
                            <span><strong>Date:</strong> {date}</span>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-clock text-muted me-2"></i>
                            <span><strong>Time:</strong> {time}</span>
                          </div>
                          <div className="d-flex align-items-center">
                            <i className="fas fa-video text-muted me-2"></i>
                            <span><strong>Mode:</strong> {appointment.mode || 'Video Call'}</span>
                          </div>
                        </div>

                        {appointment.symptoms && (
                          <div className="mb-3">
                            <small className="text-muted">
                              <strong>Symptoms:</strong> {appointment.symptoms}
                            </small>
                          </div>
                        )}

                        <div className="mt-auto">
                          {appointment.status === 'Accepted' ? (
                            canJoin ? (
                              <button
                                className="btn btn-success w-100"
                                onClick={() => handleJoinVideoCall(appointment)}
                              >
                                <i className="fas fa-video me-2"></i>
                                Join Video Call
                              </button>
                            ) : (
                              <div className="text-center">
                                <button className="btn btn-outline-secondary w-100 mb-2" disabled>
                                  <i className="fas fa-clock me-2"></i>
                                  Not Time Yet
                                </button>
                                <small className="text-muted">
                                  You can join 15 minutes before your appointment
                                </small>
                              </div>
                            )
                          ) : (
                            <button className="btn btn-secondary w-100" disabled>
                              <i className="fas fa-hourglass-half me-2"></i>
                              {appointment.status}
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

          {/* Quick Actions */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card bg-light">
                <div className="card-body">
                  <h5>
                    <i className="fas fa-info-circle text-info me-2"></i>
                    Video Call Instructions
                  </h5>
                  <ul className="mb-0">
                    <li>Ensure you have a stable internet connection</li>
                    <li>Allow camera and microphone access when prompted</li>
                    <li>You can join the call 15 minutes before your appointment</li>
                    <li>Test your camera and microphone before the call</li>
                    <li>Find a quiet, well-lit space for the consultation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinConsultation;