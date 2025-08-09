// src/pages/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    contact: '',
    location: '',
    role: 'patient',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert('Registration successful!');
      navigate('/login'); // Redirect to login, then redirect based on role
    } catch (error) {
      alert('Registration failed!');
      console.error(error);
    }
  };

  console.log("Logged-in role:", role);

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
            <select name="role" className="form-select mb-3" onChange={handleChange} required>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
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
