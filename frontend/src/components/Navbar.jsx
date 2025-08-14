// src/components/Navbar.jsx
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Needed for collapse toggle

const Navbar = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null; // { id, name, role }

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4" to="/">
          🩺 MediConnect
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mediconnectNavbar"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mediconnectNavbar">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-2">
            {!user ? (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className="nav-link">Login</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/register" className="nav-link">Register</NavLink>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <span className="nav-link">Hello, {user.name}</span>
                </li>

                {user.role === 'patient' && (
                  <>
                    <li className="nav-item">
                      <NavLink to="/patient/dashboard" className="nav-link">Patient Dashboard</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/patient/appointments" className="nav-link">Book Appointment</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/patient/accepted" className="nav-link">Video Consultation</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/patient/prescription" className="nav-link">Prescriptions</NavLink>
                    </li>
                  </>
                )}

                {user.role === 'doctor' && (
                  <>
                    <li className="nav-item">
                      <NavLink to="/doctor/dashboard" className="nav-link">Doctor Dashboard</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/doctor/appointments" className="nav-link">Book Appointment</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/doctor/prescription" className="nav-link">Prescriptions</NavLink>
                    </li>
                  </>
                )}

                <li className="nav-item">
                  <button className="btn btn-sm btn-light" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
