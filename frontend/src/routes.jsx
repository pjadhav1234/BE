// src/routes.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import DoctorDashboard from './Doctor/DoctorDashboard.jsx';
import PatientDashboard from './Patient/PatientDashboard.jsx';

import DoctorManageAppointments from './Doctor/ManageAppointments.jsx';
import PatientAppointments from './Patient/BookAppointment.jsx';
import AppointmentCard from './components/AppointmentCard.jsx';
// import VideoCall from './components/VideoCall.jsx';
import JoinConsultation from './Patient/JoinConsultation.jsx';




const AppRouter = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        
        <Route path="/login" element={<Login />} />
        <Route path="/Register" element={<Register/>} />
        
        
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />

        <Route path="/doctor/MangeAppoinment" element={<DoctorManageAppointments />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />

        <Route path="/AppointmentCard" element={<AppointmentCard />} />

        <Route path="/patient/acccepted" element={<JoinConsultation />} />
        {/* <Route path="/patient/videoCall" element={<VideoCall />} />  */}
        
        
        {/* Default route */}

        
        
        
        
        
        
        
      </Routes>
    </Router>
  );
};

export default AppRouter;
