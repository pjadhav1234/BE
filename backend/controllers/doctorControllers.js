// server/controllers/doctorController.js
import User from '../models/User.js';

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctors' });
  }
};
