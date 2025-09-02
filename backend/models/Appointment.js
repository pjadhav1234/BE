import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    preferredDate: { type: Date },        // Patient's preferred
    preferredTime: { type: String },      // optional, HH:mm
    scheduledDate: { type: Date },        // Doctor scheduled
    scheduledTime: { type: String },      // optional, HH:mm
    status: { type: String, enum: ["pending","accepted","completed"], default: "pending" },
    symptoms: { type: String },
}, { timestamps: true });


export default mongoose.model("Appointment", appointmentSchema);
