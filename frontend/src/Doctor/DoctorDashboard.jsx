// src/Doctor/DoctorDashboard.jsx
import React from "react";

const DoctorDashboard = () => {
  const doctor = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Doctor Dashboard</h2>

      {/* Doctor Info Card */}
      <div className="card p-4 text-center shadow-sm">
        <h3 className="text-primary">{doctor.name || "Dr. Unknown"}</h3>
        <h5 className="text-muted">
          {doctor.specialization || "General Practitioner"}
        </h5>

        {/* Inspirational Quote */}
        <blockquote className="mt-3 fst-italic text-success">
          "The art of medicine consists of amusing the patient while nature cures the disease."
        </blockquote>
      </div>
    </div>
  );
};

export default DoctorDashboard;
