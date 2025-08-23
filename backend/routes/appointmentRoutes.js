// routes/appointmentRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import Appointment from '../models/Appointment.js'
import {getAcceptedAppointmentsByPatient}  from '../controllers/appointmentController.js'
const router = express.Router();

// POST /api/appointments/book
router.post('/book', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json({ message: 'Appointment booked successfully' });
  } catch (error) {
    console.error('Booking Error:', error);
    res.status(500).json({ message: 'Failed to book appointment' });
  }
});

// Get all appointments for a specific doctor
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId })
      .populate("patientId", "name email"); // only show patient's name & email
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching appointments", error: err });
  }
});

// Update appointment status
router.put("/update/:id", async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating status", error: err });
  }
});
// Create appointment (used by patients)
router.post('/', async (req, res) => {
  try {
    const { patientId, doctorId, date, time, symptoms } = req.body;
    const appt = await Appointment.create({ patientId, doctorId, date, time, symptoms });
    res.status(201).json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating appointment' });
  }
});

router.get('/doctor/appointments/:doctorId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/appointments/patient/:patientId/accepted
router.get('/patient/:patientId/accepted', async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.params.patientId,
      status: 'Accepted',
    }).populate('doctorId', 'name speciality'); // optional: populate doctor info

    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch accepted appointments' });
  }
});
// ✅ Get ALL appointments for a specific patient (any status)
router.get('/patient/:patientId', async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.params.patientId
    })
      .populate('doctorId', 'name speciality') // add more fields if needed
      .sort({ date: 1 }); // sort by date ascending

    // Format doctor name into each object
    const formatted = appointments.map(appt => ({
      _id: appt._id,
      doctorName: appt.doctorId?.name || 'Unknown Doctor',
      speciality: appt.doctorId?.speciality || 'General',
      date: appt.date,
      time: appt.time,
      status: appt.status || 'pending'
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching patient appointments:', err);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});




export default router;

