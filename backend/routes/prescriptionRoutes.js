import express from "express";
import fs from "fs";
import path from "path";
import axios from "axios";

const router = express.Router();

// POST /api/prescription/generate
router.post("/generate", async (req, res) => {
  try {
    const { filename } = req.body; // transcript file saved earlier
    const filePath = path.join(process.cwd(), "upload", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Transcript file not found" });
    }

    const conversationJSON = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Call Python AI service
    const response = await axios.post("http://localhost:8000/generate", {
      conversation: conversationJSON,
    });

    res.json({ prescription: response.data.prescription });
  } catch (err) {
    console.error("Error generating prescription:", err);
    res.status(500).json({ error: "Failed to generate prescription" });
  }
});

export default router;
