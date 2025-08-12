// routes/appointmentRoutes.js
import express from 'express';


import Appointment from '../models/Appointment.js';

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
// GET appointments for a doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.doctorId }).populate('patientId', 'name');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

// PUT update appointment status
router.put('/update/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await Appointment.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// Example route to get doctor's appointments
router.get('/doctor', async (req, res) => {
  try {
    // Example: Replace with your actual logic
    const doctorId = req.query.doctorId; // or from auth middleware
    const appointments = await Appointment.find({ doctor: doctorId });
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
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


export default router;
