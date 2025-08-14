// src/components/Navbar.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = () => {
  const navigate = useNavigate();

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user')); // Expects: { name, role, token }

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const dashboardLink = user?.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard';

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
            

            
              <>
              
                <li className="nav-item">
                  <NavLink to="/doctor/dashboard" className="nav-link" end>
                Home
              </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/doctor/appointments" className="nav-link">
                    Book Appointment
                  </NavLink>
                </li>
                
                <li className="nav-item">
                  <NavLink to="/doctor/prescription" className="nav-link">
                    Prescriptions
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button className="btn btn-sm btn-light" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
           
            
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
