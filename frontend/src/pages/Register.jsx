// src/pages/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', age: '', email: '', password: '', contact: '', location: '', role: '', specialization: ''
  });

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${'http://localhost:5000'}/api/auth/register`, formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h3 className="text-center mb-4">Register</h3>
          <form onSubmit={handleSubmit} className="card p-4 shadow">
            <input name="name" className="form-control mb-2" placeholder="Name" onChange={handleChange} required />
            <input name="age" type="number" className="form-control mb-2" placeholder="Age" onChange={handleChange} required />
            <input name="email" type="email" className="form-control mb-2" placeholder="Email" onChange={handleChange} required />
            <input name="password" type="password" className="form-control mb-2" placeholder="Password" onChange={handleChange} required />
            <input name="contact" className="form-control mb-2" placeholder="Contact" onChange={handleChange} required />
            <input name="location" className="form-control mb-2" placeholder="Location" onChange={handleChange} required />
            <select name="role" className="form-select mb-2" onChange={handleChange} required>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
            {/* Show specialization only if doctor selected */}
            {formData.role === 'doctor' && (
              <input name="specialization" className="form-control mb-2" placeholder="Specialization" onChange={handleChange} />
            )}
            <button type="submit" className="btn btn-primary w-100">Register</button>
            <p className="text-center mt-3">
              Already have an account? <a href="/login">Login here</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
