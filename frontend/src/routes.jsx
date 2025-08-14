// src/routes.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

import DoctorDashboard from './Doctor/DoctorDashboard.jsx';
import PatientDashboard from './Patient/PatientDashboard.jsx';

import DoctorManageAppointments from './Doctor/ManageAppointments.jsx';
import PatientAppointments from './Patient/BookAppointment.jsx';
import AppointmentCard from './components/AppointmentCard.jsx';

import VideoCall from './components/VideoCall.jsx';
import ProtectedRoute from './routes/ProtectedRoute';
import JoinConsultation from './Patient/JoinConsultation.jsx';
import GeneratePrescription from './Doctor/GeneratePrescription.jsx';

import DoctorVideoCall from "./Doctor/VideoConsult.jsx";
import PatientVideoCall from "./Patient/VideoCall.jsx";





const AppRouter = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        
        <Route path="/login" element={<Login />} />
        <Route path="/Register" element={<Register/>} />
        
        
       <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRole="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute allowedRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="doctor/appointments" element={<DoctorManageAppointments />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />

        <Route path="/AppointmentCard" element={<AppointmentCard />} />

        <Route path="/patient/accepted" element={<JoinConsultation/>} />
        <Route path="/patient/videoCall" element={<VideoCall />} /> 
             
        <Route path="/doctor/videoCall" element={<VideoCall />} />
        <Route path="/doctor/prescription" element={<GeneratePrescription />} />
        
        
        

        <Route path="/patient/videoCall/:id" element={<PatientVideoCall />} />
<Route path="/doctor/videoCall/:id" element={<DoctorVideoCall />} />
        
        
        
        
        
        
      </Routes>
    </Router>
  );
};

export default AppRouter;
