import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['doctor', 'patient'], required: true },
  contact: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialization: { type: String },
  location: { type: String, required: true },
  role: {
  type: String,
  required: true,
  enum: ['doctor', 'patient']
}
}, { timestamps: true });

export default mongoose.model('User', userSchema);
