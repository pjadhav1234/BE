// List of booked appointments, change status.

// pages/DoctorManageAppointments.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AppointmentCard from '../components/AppointmentCard';

const DoctorManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    axios.get('/api/doctor/appointments')
      .then(res => setAppointments(res.data))
      .catch(console.error);
  }, []);

  const handleStartCall = (appointment) => {
    // Start call logic here
    console.log('Start Call', appointment);
  };

  const handleWritePrescription = (appointment) => {
    // Navigate to prescription form
    console.log('Write prescription for', appointment);
  };

  return (
    <div className="container mt-4">
      <h3>Manage Appointments</h3>
      {appointments.map(app => (
        <AppointmentCard
          key={app._id}
          appointment={app}
          role="doctor"
          onStartCall={handleStartCall}
          onWritePrescription={handleWritePrescription}
        />
      ))}
    </div>
  );
};

export default DoctorManageAppointments;
