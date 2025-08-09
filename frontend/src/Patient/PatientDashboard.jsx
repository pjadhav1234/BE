//  Overview of upcoming appointments, previous prescriptions.

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const PatientDashboard = () => {
  const [date, setDate] = useState('');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Fetch upcoming appointments for logged-in patient
    axios.get('/api/patient/appointments')
      .then(res => setAppointments(res.data))
      .catch(err => console.log(err));
  }, []);

  const handleBookAppointment = () => {
    axios.post('/api/patient/book', { date })
      .then(() => {
        alert("Appointment booked successfully");
        setDate('');
      })
      .catch(err => alert("Booking failed"));
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">👩‍⚕️ Patient Dashboard</h2>

      <div className="mb-4 p-4 bg-light rounded shadow-sm">
        <h4>Welcome, Pradnya!</h4>
        <p className="text-muted">Manage your health efficiently from here.</p>
      </div>

      <div className="mb-4">
        <h5>📅 Book New Appointment</h5>
        <div className="d-flex gap-3 align-items-center flex-wrap">
          <input
            type="datetime-local"
            className="form-control"
            style={{ maxWidth: '250px' }}
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <button className="btn btn-success" onClick={handleBookAppointment}>
            Book Appointment
          </button>
        </div>
      </div>

     

      <div>
        <h5>⚡ Quick Tools</h5>
        <div className="d-flex gap-3 flex-wrap mt-3">
          <button className="btn btn-outline-info">Chat with Doctor</button>
          <button className="btn btn-outline-warning">Medical History</button>
          <button className="btn btn-outline-danger">Cancel Appointment</button>
        </div>
      </div>
    </div>
  );
};



export default PatientDashboard;
