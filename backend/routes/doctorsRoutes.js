// routes/doctorsRoutes.js
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get all doctors (for patient booking list)
router.get('/', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('name specialization contact location');
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching doctors' });
  }
});

export default router;
