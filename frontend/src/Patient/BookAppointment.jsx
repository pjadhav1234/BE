// src/Patient/BookAppointment.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({ doctorId: '', date: '', time: '', symptoms: '' });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/doctors`);
        setDoctors(res.data);
        setFilteredDoctors(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDoctors();
  }, []);

  // Filter doctors by search text
  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    setFilteredDoctors(
      doctors.filter(d =>
        d.name.toLowerCase().includes(lowerSearch) ||
        (d.specialization || '').toLowerCase().includes(lowerSearch) ||
        (d.location || '').toLowerCase().includes(lowerSearch)
      )
    );
  }, [search, doctors]);

  const openForm = (doctor) => {
    setSelectedDoctor(doctor);
    setForm({
      doctorId: doctor._id,
      date: doctor.availableDate || '',
      time: '',
      symptoms: ''
    });
    setFormVisible(true);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = { ...form, patientId: user.id };
    const res = await axios.post(`http://localhost:5000/api/appointments`, payload);
    if (res.status === 201) {
      alert('Appointment booked successfully!');
      setForm({ doctorId: '', date: '', time: '', symptoms: '' });
      setFormVisible(false);
    }
  } catch (err) {
    console.error(err);
    alert('Failed to book appointment');
  }
};


  return (
    <div className="container mt-4">
      <h3>Book Appointment</h3>

      {/* Search bar */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by name, specialization, or location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Doctor list */}
      <div className="row">
        {filteredDoctors.map(doctor => (
          <div key={doctor._id} className="col-md-4 mb-3">
            <div className="card p-3">
              <h5>{doctor.name}</h5>
              <p><strong>Specialization:</strong> {doctor.specialization || 'General'}</p>
              <p><strong>Age:</strong> {doctor.age || 'N/A'}</p>
              <p><strong>Location:</strong> {doctor.location || 'N/A'}</p>
              {doctor.availableDate && (
                <p><strong>Available Date:</strong> {doctor.availableDate}</p>
              )}
              <button className="btn btn-primary" onClick={() => openForm(doctor)}>
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking form */}
      {formVisible && selectedDoctor && (
        <div className="card p-3 mt-4">
          <h5>Booking Appointment with {selectedDoctor.name}</h5>
          <form onSubmit={handleSubmit}>
            <input
              type="hidden"
              value={form.doctorId}
              readOnly
            />
            <div className="mb-2">
              <label>Available Date</label>
              <input
                type="date"
                className="form-control"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="mb-2">
              <label>Time</label>
              <input
                type="time"
                className="form-control"
                value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })}
                required
              />
            </div>
            <div className="mb-2">
              <label>Symptoms</label>
              <textarea
                className="form-control"
                placeholder="Describe your symptoms..."
                value={form.symptoms}
                onChange={e => setForm({ ...form, symptoms: e.target.value })}
              />
            </div>
            <button className="btn btn-success" type="submit">Confirm Appointment</button>
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={() => setFormVisible(false)}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
