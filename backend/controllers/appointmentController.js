import Appointment from '../models/Appointment.js';

export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, doctorName, date, time, mode } = req.body;

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      doctorName,
      date,
      time,
      mode,
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error booking appointment' });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const filter = req.user.role === 'doctor' ? { doctorId: req.user._id } : { patientId: req.user._id };
    const appointments = await Appointment.find(filter).populate('patientId doctorId', 'name email role');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};
