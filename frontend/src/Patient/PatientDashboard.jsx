// src/Patient/PatientDashboard.jsx
import React from 'react';

const PatientDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="container mt-4">
      <h3>Welcome, {user.name}</h3>
      <p>Use the navigation to book appointments and join consultations.</p>
    </div>
  );
};

export default PatientDashboard;
