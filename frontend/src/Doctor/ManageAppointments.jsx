// src/Doctor/DoctorDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const ManageAppointments= () => {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!user?.id) return;
        const res = await axios.get(`${'http://localhost:5000'}/api/appointments/doctor/${user.id}`);
        setAppointments(res.data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }
    };
    fetchAppointments();
  }, [user?.id]);

  const handleStatus = async (id, status) => {
    try {
      const res = await axios.put(`${'http://localhost:5000'}/api/appointments/update/${id}`, { status });
      setAppointments(prev => prev.map(a => a._id === id ? res.data : a));
    } catch (err) {
      console.error('Error updating appointment status:', err);
      alert('Failed to update status');
    }
  };

  const handleJoinVC = (id) => navigate(`/doctor/videoCall?room=${id}`);

  return (
    <>
      
      <div className="container mt-4">
        <h3>Your Appointments</h3>
        {appointments.length === 0 && <p>No appointments found.</p>}
        {appointments.map(a => (
          <div className="card p-3 mb-2" key={a._id}>
            <p><strong>Patient Name:</strong> {a.patientId?.name || a.patientId}</p>
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

            {a.status === 'Accepted' && (
              <button onClick={() => handleJoinVC(a._id)} className="btn btn-primary">Join Call</button>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default ManageAppointments;
