// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import api from '../services/api';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', formData);
      alert('Registration successful! Please login with your credentials.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      setError(
        error.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h3>
                  <i className="fas fa-user-plus text-success me-2"></i>
                  Create Account
                </h3>
                <p className="text-muted">Join our healthcare platform</p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label">Full Name *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="form-control"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="age" className="form-label">Age *</label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      min="18"
                      max="120"
                      className="form-control"
                      placeholder="Enter your age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-control"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password *</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    minLength="6"
                  />
                  <small className="text-muted">Minimum 6 characters</small>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="contact" className="form-label">Contact Number *</label>
                    <input
                      id="contact"
                      name="contact"
                      type="tel"
                      className="form-control"
                      placeholder="Enter phone number"
                      value={formData.contact}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="location" className="form-label">Location *</label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      className="form-control"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">I am a *</label>
                  <select
                    id="role"
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="patient">
                      <i className="fas fa-user"></i> Patient - Seeking medical consultation
                    </option>
                    <option value="doctor">
                      <i className="fas fa-user-md"></i> Doctor - Healthcare provider
                    </option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-success w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus me-2"></i>
                      Create Account
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <a href="/login" className="text-primary text-decoration-none">
                      Sign in here
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Role Information */}
          <div className="card mt-3 bg-light">
            <div className="card-body p-3">
              <h6><i className="fas fa-info-circle text-info me-2"></i>Account Types</h6>
              <div className="row">
                <div className="col-md-6">
                  <small>
                    <strong><i className="fas fa-user text-primary me-1"></i>Patient:</strong><br />
                    • Book appointments<br />
                    • Join video consultations<br />
                    • Access prescriptions
                  </small>
                </div>
                <div className="col-md-6">
                  <small>
                    <strong><i className="fas fa-user-md text-success me-1"></i>Doctor:</strong><br />
                    • Manage appointments<br />
                    • Conduct consultations<br />
                    • Write prescriptions
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;