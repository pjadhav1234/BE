// routes/appointmentRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Appointment from '../models/Appointment.js'
import {getAcceptedAppointmentsByPatient}  from '../controllers/appointmentController.js'

const router = express.Router();

// Emergency keywords
const emergencyKeywords = [
  "chest pain",
  "heart attack",
  "stroke",
  "unconscious",
  "severe bleeding",
  "difficulty breathing",
  "severe headache",
  "seizure",
  "accident",
  "fracture",
  "fever",
  "breathing difficulty",
];

// Function to detect emergency symptoms
const detectEmergency = (symptoms) => {
  if (!symptoms) return { isEmergency: false, matchedKeywords: [] };
  
  const lowerSymptoms = symptoms.toLowerCase();
  const matchedKeywords = emergencyKeywords.filter(keyword => 
    lowerSymptoms.includes(keyword)
  );
  
  return {
    isEmergency: matchedKeywords.length > 0,
    matchedKeywords
  };
};

// ---------------------- BOOK APPOINTMENT ----------------------
router.post("/book", async (req, res) => {
  try {
    const { patientId, doctorId, preferredDate, preferredTime, symptoms } = req.body;

    if (!patientId || !doctorId || !preferredDate || !preferredTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check for emergency symptoms
    const emergencyCheck = detectEmergency(symptoms);
    
    if (emergencyCheck.isEmergency) {
      console.log(`Emergency detected for patient ${patientId}:`, emergencyCheck.matchedKeywords);
      // Here you could trigger SMS/notification system
      // await sendEmergencyAlert(patientId, doctorId, emergencyCheck.matchedKeywords);
    }

    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      preferredDate: new Date(preferredDate),
      preferredTime,
      symptoms,
      status: "pending", // Always starts as pending
      isEmergency: emergencyCheck.isEmergency,
      emergencyKeywords: emergencyCheck.matchedKeywords
    });

    await appointment.save();
    
    // Populate patient and doctor info for response
    await appointment.populate([
      { path: 'patient', select: 'name email' },
      { path: 'doctor', select: 'name specialization' }
    ]);
    
    res.status(201).json(appointment);

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Failed to book appointment", error: error.message });
  }
});

// ---------------------- GET APPOINTMENTS FOR DOCTOR ----------------------
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctor: req.params.doctorId,
    }).populate("patient", "name email contact");

    // Sort emergency appointments first, then by creation date
    const sorted = appointments.sort((a, b) => {
      if (a.isEmergency && !b.isEmergency) return -1;
      if (!a.isEmergency && b.isEmergency) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: "Error fetching appointments", error: err });
  }
});

// ---------------------- UPDATE APPOINTMENT STATUS & SCHEDULE ----------------------
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, scheduledDate, scheduledTime } = req.body;
    
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update fields if provided
    if (status && ['pending', 'accepted', 'completed', 'rejected'].includes(status)) {
      appointment.status = status;
    }
    
    if (scheduledDate) {
      appointment.scheduledDate = new Date(scheduledDate);
    }
    
    if (scheduledTime) {
      appointment.scheduledTime = scheduledTime;
    }
       
    await appointment.save();
    
    // Populate for response
    await appointment.populate([
      { path: 'patient', select: 'name email contact' },
      { path: 'doctor', select: 'name specialization' }
    ]);
    
    res.json(appointment);
  } catch (err) {
    console.error("Error updating appointment:", err);
    res.status(500).json({ message: "Failed to update appointment" });
  }
});

// ---------------------- GET ACCEPTED APPOINTMENTS (PATIENT) ----------------------
router.get("/patient/:patientId/accepted", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.params.patientId,
      status: "accepted",
    }).populate("doctor", "name specialization");

    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch accepted appointments" });
  }
});

// ---------------------- GET ALL APPOINTMENTS (PATIENT) ----------------------
router.get("/patient/:patientId", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.params.patientId,
    })
      .populate("doctor", "name specialization")
      .sort({ createdAt: -1 });

    const formatted = appointments.map((appt) => ({
      _id: appt._id,
      doctorName: appt.doctor?.name || "Unknown Doctor",
      doctorId: appt.doctor?._id,
      specialization: appt.doctor?.specialization || "General",
      preferredDate: appt.preferredDate,
      preferredTime: appt.preferredTime,
      scheduledDate: appt.scheduledDate,
      scheduledTime: appt.scheduledTime,
      status: appt.status,
      symptoms: appt.symptoms,
      isEmergency: appt.isEmergency,
      emergencyKeywords: appt.emergencyKeywords
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching patient appointments:", err);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

export default router;