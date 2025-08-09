// routes/doctorRoutes.js
import express from 'express';
const router = express.Router();
import Doctor from '../models/User.js'; // adjust path

// GET /api/doctors/all
router.get('/all', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

export default router;
