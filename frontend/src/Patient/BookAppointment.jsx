// BookAppointment.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AppointmentCard from '../components/AppointmentCard';



const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Fetch all doctors
  useEffect(() => {
  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/api/doctors/all');

      setDoctors(res.data);
    } catch (err) {
      
      setDoctors([]); // fallback to empty array
    }
  };

  fetchDoctors();
}, []);


   

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Available Doctors</h2>
      <div className="row">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="card col-md-4 m-2 shadow">
            <div className="card-body">
              <h5 className="card-title">Dr. {doctor.name}</h5>
              <p><strong>Specialization:</strong> {doctor.specialization}</p>
              <p><strong>Contact:</strong> {doctor.contact}</p>
              <p><strong>Location:</strong> {doctor.location}</p>
              <button
                className="btn btn-primary"
                onClick={() => setSelectedDoctor(doctor)}
              ><a href="/AppointmentCard" className="text-white text-decoration-none">
                Book Appointment</a>
              </button>
            </div>
          </div>
        ))}
      </div>

     {selectedDoctor && (
  <div className="mt-4">
    <hr />
    <h4>Booking Appointment with Dr. {selectedDoctor.name}</h4>
    <AppointmentCard
      
      doctor={selectedDoctor}
      onClose={() => setSelectedDoctor(null)}
    />
  </div>
)}

    </div>
  );
};

export default BookAppointment;
