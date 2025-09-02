// routes/appointmentRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import Appointment from '../models/Appointment.js'
import {getAcceptedAppointmentsByPatient}  from '../controllers/appointmentController.js'
const router = express.Router();

// ✅ Emergency keywords
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
];

// ---------------------- BOOK APPOINTMENT ----------------------
router.post("/book", async (req, res) => {
  try {
    const { patientId, doctorId, preferredDate, preferredTime, symptoms } = req.body;

    if (!patientId || !doctorId || !preferredDate || !preferredTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let status = "pending";

    // Check for emergency
    if (symptoms) {
      const lowerSymptoms = symptoms.toLowerCase();
      const isEmergency = emergencyKeywords.some((keyword) =>
        lowerSymptoms.includes(keyword)
      );
      if (isEmergency) {
        console.log("Emergency detected, SMS sent");
        // status remains "pending" for doctor scheduling
      }
    }

    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      preferredDate: new Date(preferredDate),
      preferredTime,
      symptoms,
      status,
    });

    await appointment.save();
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
      doctorId: req.params.doctorId,
    }).populate("patientId", "name email phone");

    // ✅ Sort so Emergency always comes first
    const sorted = appointments.sort((a, b) =>
      a.status === "Emergency" ? -1 : b.status === "Emergency" ? 1 : 0
    );

    res.json(sorted);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching appointments", error: err });
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

router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
     const { scheduledDate, scheduledTime } = req.body;
    // Fetch the existing appointment first
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.scheduledDate = scheduledDate || appointment.scheduledDate;
    appointment.scheduledTime = scheduledTime || appointment.scheduledTime;
   
       
    await appointment.save();
    res.json(appointment);


    
  
  } catch (err) {
    console.error("Error updating appointment:", err);
    res.status(500).json({ message: "Failed to update appointment" });
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

// ---------------------- GET ACCEPTED APPOINTMENTS (PATIENT) ----------------------
router.get("/patient/:patientId/accepted", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.params.patientId,
      status: "Accepted",
    }).populate("doctorId", "name speciality");

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
      patientId: req.params.patientId,
    })
      .populate("doctorId", "name speciality")
      .sort({ date: 1 });

    const formatted = appointments.map((appt) => ({
      _id: appt._id,
      doctorName: appt.doctorId?.name || "Unknown Doctor",
      speciality: appt.doctorId?.speciality || "General",
      date: appt.date,
      time: appt.time,
      status: appt.status || "Pending",
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching patient appointments:", err);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});






export default router;

