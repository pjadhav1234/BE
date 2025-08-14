// src/Patient/JoinConsultation.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const JoinConsultation = () => {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/appointments/patient/${user.id}`);
        setAppointments(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (user?.role === 'patient') {
      fetchAppointments();
    }
  }, [user]);

  return (
    <div className="container mt-4">
      <h2>My Appointments</h2>

      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        appointments.map((a) => (
          <div
            key={a._id}
            className={`card p-3 mb-3 border-${
              a.status === 'accepted' ? 'success' : a.status === 'rejected' ? 'danger' : 'secondary'
            }`}
          >
            <h5>Dr. {a.doctorName}</h5>
            <p><strong>Date:</strong> {a.date}</p>
            <p><strong>Time:</strong> {a.time}</p>
            <p>
              <strong>Status:</strong>{' '}
              <span
                className={
                  a.status === 'accepted'
                    ? 'text-success'
                    : a.status === 'rejected'
                    ? 'text-danger'
                    : 'text-secondary'
                }
              >
                {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
              </span>
            </p>

            {a.status === 'accepted' && (
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/patient/videoCall/${a._id}`)}
              >
                Join Call
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default JoinConsultation;
