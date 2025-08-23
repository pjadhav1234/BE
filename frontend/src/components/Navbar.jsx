// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

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
          aria-controls="mediconnectNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mediconnectNavbar">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-2">
            {user ? (
              <>
                {/* Common Dashboard Link */}
                <li className="nav-item">
                  <NavLink 
                    to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} 
                    className="nav-link"
                  >
                    <i className="fas fa-home me-1"></i>
                    Dashboard
                  </NavLink>
                </li>

                {/* Doctor Specific Links */}
                {user.role === 'doctor' && (
                  <>
                    <li className="nav-item">
                      <NavLink to="/doctor/appointments" className="nav-link">
                        <i className="fas fa-calendar-check me-1"></i>
                        Manage Appointments
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/doctor/video-consultations" className="nav-link">
                        <i className="fas fa-video me-1"></i>
                        Video Consultations
                      </NavLink>
                    </li>
                  </>
                )}

                {/* Patient Specific Links */}
                {user.role === 'patient' && (
                  <>
                    <li className="nav-item">
                      <NavLink to="/patient/appointments" className="nav-link">
                        <i className="fas fa-calendar-plus me-1"></i>
                        Book Appointment
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/patient/consultations" className="nav-link">
                        <i className="fas fa-video me-1"></i>
                        Video Consultations
                      </NavLink>
                    </li>
                  </>
                )}

                {/* User Info and Logout */}
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="userDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-user me-1"></i>
                    {user.name}
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="userDropdown">
                    <li>
                      <span className="dropdown-item-text">
                        <small className="text-muted">
                          Logged in as: <strong className="text-capitalize">{user.role}</strong>
                        </small>
                      </span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={handleLogout}
                      >
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className="nav-link">
                    <i className="fas fa-sign-in-alt me-1"></i>
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/register" className="nav-link">
                    <i className="fas fa-user-plus me-1"></i>
                    Register
                  </NavLink>
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