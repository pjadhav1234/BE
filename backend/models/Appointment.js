import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  date: String,
  time: String,
  mode: String,
  symptoms: String,
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending',
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

export default mongoose.model('Appointment', appointmentSchema);
