// frontend/src/Doctor/DoctorVideoConsultation.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DoctorVideoConsultation = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchDoctorAppointments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token || !user?.id) {
          console.error('No token or user ID found');
          setAppointments([]);
          setLoading(false);
          return;
        }

        console.log('Fetching appointments for doctor:', user.id);
        
        // Try multiple endpoints to get doctor appointments
        let res;
        try {
          // First try the doctor-specific endpoint
          res = await axios.get(
            `http://localhost:5000/api/appointments/doctor/${user.id}`,
            { headers: { Authorization: `Bearer ${token}` }}
          );
        } catch (firstError) {
          console.log('First endpoint failed, trying alternative...');
          // Try alternative endpoint
          res = await axios.get(
            `http://localhost:5000/api/appointments/doctor`,
            { 
              headers: { Authorization: `Bearer ${token}` },
              params: { doctorId: user.id }
            }
          );
        }
        
        console.log('Raw appointments data:', res.data);
        
        // Filter only accepted appointments
        const acceptedAppointments = res.data.filter(apt => apt.status === 'Accepted');
        console.log('Accepted appointments:', acceptedAppointments);
        
        setAppointments(acceptedAppointments);
        
      } catch (err) {
        console.error('Error fetching doctor appointments:', err);
        console.error('Error response:', err.response?.data);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'doctor' && user?.id) {
      fetchDoctorAppointments();
    } else if (user?.role !== 'doctor') {
      console.log('User is not a doctor, redirecting...');
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [user?.id, navigate]);

  const handleStartVideoCall = async (appointment) => {
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
      
      // Start call session tracking
      await axios.post(
        'http://localhost:5000/api/video/session/start',
        { roomId, appointmentId: appointment._id },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Navigate to video call
      navigate(`/video-call?room=${roomId}`);
      
    } catch (error) {
      console.error('Error starting video call:', error);
      alert('Failed to start video call. Please try again.');
    }
  };

  const getAppointmentDateTime = (appointment) => {
    const date = new Date(appointment.date);
    return {
      date: date.toLocaleDateString(),
      time: appointment.time,
      isToday: date.toDateString() === new Date().toDateString()
    };
  };

  const getPatientInfo = (appointment) => {
    // Handle different data structures
    const patientData = appointment.patientId || appointment.patient || {};
    return {
      name: patientData.name || appointment.patientName || 'Unknown Patient',
      age: patientData.age || 'N/A',
      contact: patientData.contact || 'N/A',
      id: patientData._id || appointment.patientId || 'N/A'
    };
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
            Video Consultations - Dr. {user.name}
          </h2>

          {appointments.length === 0 ? (
            <div className="card text-center p-5">
              <div className="card-body">
                <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                <h5>No Scheduled Consultations</h5>
                <p className="text-muted">
                  You don't have any accepted appointments scheduled for video consultations.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/doctor/dashboard')}
                  >
                    Go to Dashboard
                  </button>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => window.location.reload()}
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              {appointments.map((appointment) => {
                const { date, time, isToday } = getAppointmentDateTime(appointment);
                const patient = getPatientInfo(appointment);

                return (
                  <div key={appointment._id} className="col-md-6 col-lg-4 mb-4">
                    <div className={`card h-100 shadow-sm ${isToday ? 'border-success' : ''}`}>
                      {isToday && (
                        <div className="card-header bg-success text-white text-center py-2">
                          <small><i className="fas fa-clock me-1"></i>Today's Consultation</small>
                        </div>
                      )}
                      
                      <div className="card-body d-flex flex-column">
                        <div className="mb-3">
                          <h5 className="card-title">
                            <i className="fas fa-user text-primary me-2"></i>
                            {patient.name}
                          </h5>
                          <div className="text-muted small">
                            <div><strong>Age:</strong> {patient.age}</div>
                            <div><strong>Contact:</strong> {patient.contact}</div>
                          </div>
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
                            <div className="card bg-light">
                              <div className="card-body p-2">
                                <small>
                                  <strong>Patient Symptoms:</strong><br />
                                  {appointment.symptoms}
                                </small>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="mt-auto">
                          <div className="d-grid gap-2">
                            <button
                              className="btn btn-success"
                              onClick={() => handleStartVideoCall(appointment)}
                            >
                              <i className="fas fa-video me-2"></i>
                              Start Video Consultation
                            </button>
                            
                            <div className="btn-group">
                              <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => navigate(`/doctor/patient-history/${appointment.patientId?._id}`)}
                              >
                                <i className="fas fa-history me-1"></i>
                                History
                              </button>
                              <button 
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => navigate(`/doctor/prescription/${appointment._id}`)}
                              >
                                <i className="fas fa-prescription me-1"></i>
                                Prescription
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Doctor Instructions */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card bg-light">
                <div className="card-body">
                  <h5>
                    <i className="fas fa-stethoscope text-success me-2"></i>
                    Video Consultation Guidelines
                  </h5>
                  <div className="row">
                    <div className="col-md-6">
                      <ul className="mb-0">
                        <li>Ensure good lighting and clear audio</li>
                        <li>Have patient records ready</li>
                        <li>Test your camera and microphone beforehand</li>
                        <li>Maintain professional appearance</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <ul className="mb-0">
                        <li>Keep consultation notes during the call</li>
                        <li>Be prepared to write prescriptions</li>
                        <li>Have emergency contact information ready</li>
                        <li>Follow up with patients after consultation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorVideoConsultation;