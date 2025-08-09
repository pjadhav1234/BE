// components/AppointmentCard.jsx or AppointmentForm.jsx

import React, { useState } from 'react';
import axios from 'axios';

const AppointmentForm = ({ doctor, onClose }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    mode: 'In-person',
    symptoms: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.post('/api/appointments/book', {
        ...formData,
        // doctorId: doctor._id,
        // patientId: user._id,
      });
      alert('Appointment booked successfully');
      onClose(); // close the form
    } catch (err) {
      console.error('Error booking appointment:', err);
    }
  };

  return (
    <div className="card p-3 shadow">
      <h5>Appointment Form</h5>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label>DR Name:</label>
          <input type="name" name="name" className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-2">
          <label>Date:</label>
          <input type="date" name="date" className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-2">
          <label>Time:</label>
          <input type="time" name="time" className="form-control" onChange={handleChange} required />
        </div>
        <div className="mb-2">
          <label>Mode:</label>
          <select name="mode" className="form-control" onChange={handleChange}>
            <option>In-person</option>
            <option>Video</option>
          </select>
        </div>
        <div className="mb-2">
          <label>Symptoms:</label>
          <textarea name="symptoms" className="form-control" onChange={handleChange}></textarea>
        </div>
        <button type="submit" className="btn btn-success">Submit</button>
        <button type="button" className="btn btn-secondary ms-2" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default AppointmentForm;
