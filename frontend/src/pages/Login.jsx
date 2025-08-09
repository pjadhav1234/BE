// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', credentials);
      const { token, role, name } = res.data;

      // Save user info to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ name, role }));

      alert('Login successful!');

      // Role-based redirect (case-insensitive)
     
      if (role === 'doctor') navigate('/doctor/dashboard');
      else if (role === 'patient') navigate('/patient/dashboard');
      else  navigate('/patient/dashboard');
    } catch (err) {
      alert('Login failed!');
      console.error(err);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h3 className="text-center mb-4">Login</h3>
          <form onSubmit={handleSubmit} className="card p-4 shadow">
            <input name="email" type="email" className="form-control mb-3" placeholder="Email" onChange={handleChange} required />
            <input name="password" type="password" className="form-control mb-3" placeholder="Password" onChange={handleChange} required />
            <button type="submit" className="btn btn-success w-100">Login</button>
            <p className="text-center mt-3">
              Don’t have an account? <a href="/register">Register here</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
