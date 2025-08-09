import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const JoinConsultation = () => {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchAcceptedAppointments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/appointments/doctor`);
        setAppointments(res.data); // Make sure this returns an array
      } catch (err) {
        console.error('Error fetching accepted appointments:', err);
      }
    };

    if (user?.role === 'patient') {
      fetchAcceptedAppointments();
    }
  }, [user]);

  const handleJoin = (roomName) => {
    navigate(`/patient/videoCall?room=${roomName}`);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Your Upcoming Consultations</h2>

      {appointments.length === 0 ? (
        <p>No accepted appointments yet.</p>
      ) : (
        <div className="row">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="col-md-4 mb-4">
              <div className="card shadow">
                <div className="card-body">
                  <h5 className="card-title">Dr. {appointment.doctorName || "Unknown"}</h5>
                  <p className="card-text">Specialist: {appointment.speciality || "N/A"}</p>
                  <p className="card-text">Date: {appointment.date}</p>
                  <p className="card-text">Time: {appointment.time}</p>
                  <p className="card-text">Status: <strong>{appointment.status}</strong></p>

                  {appointment.status === 'Accepted' ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleJoin(`room-${appointment._id}`)}
                    >
                      Join Video Call
                    </button>
                  ) : (
                    <button className="btn btn-secondary" disabled>
                      {appointment.status === 'rejected' ? 'Rejected' : 'Pending'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JoinConsultation;
