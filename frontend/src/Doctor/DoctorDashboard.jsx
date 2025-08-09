import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const user = JSON.parse(localStorage.getItem('user')); // doctor

  useEffect(() => {
    const fetchAppointments = async () => {
      const res = await axios.get('/api/appointments/doctor');
      setAppointments(res.data);
    };
    fetchAppointments();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await axios.put(`/api/appointments/update`, { status });
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h3>Your Appointments</h3>
      {appointments.map((a) => (
        <div className="card p-3 mb-2" key={a._id}>
          <p><strong>Patient ID:</strong> {a.patientId}</p>
          <p><strong>Date:</strong> {a.date}</p>
          <p><strong>Time:</strong> {a.time}</p>
          <p><strong>Symptoms:</strong> {a.symptoms}</p>
          <p><strong>Status:</strong> {a.status}</p>
          {a.status === 'Pending' && (
            <div>
              <button onClick={() => handleStatus(a._id, 'Accepted')} className="btn btn-success me-2">Accept</button>
              <button onClick={() => handleStatus(a._id, 'Rejected')} className="btn btn-danger">Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DoctorDashboard;
