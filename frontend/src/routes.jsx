import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import DoctorDashboard from './Doctor/DoctorDashboard.jsx';
import PatientDashboard from './Patient/PatientDashboard.jsx';
import DoctorManageAppointments from './Doctor/ManageAppointments.jsx';
import DoctorVideoConsultation from './Doctor/DoctorVideoConsultion.jsx';
import PatientAppointments from './Patient/BookAppointment.jsx';
import AppointmentCard from './components/AppointmentCard.jsx';
import VideoCall from './components/VideoCall.jsx';
import JoinConsultation from './Patient/JoinConsultation.jsx';
import DebugAppointments from './components/DebugAppointments.jsx';

const AppRouter = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard Routes */}
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />

        {/* Doctor Routes */}
        <Route path="/doctor/appointments" element={<DoctorManageAppointments />} />
        <Route path="/doctor/video-consultations" element={<DoctorVideoConsultation />} />

        {/* Patient Routes */}
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        <Route path="/patient/consultations" element={<JoinConsultation />} />
        <Route path="/doctor/videoCall" element={<VideoCall />} />

        {/* Shared Routes */}
        <Route path="/video-call" element={<VideoCall />} />
        <Route path="/appointment-form" element={<AppointmentCard />} />
        
        {/* Debug Route - Remove in production */}
        <Route path="/debug" element={<DebugAppointments />} />

        {/* Default Routes */}
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;