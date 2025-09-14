import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// Ensure /upload folder exists
const uploadDir = path.join(process.cwd(), "upload");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Save transcript with speaker roles
router.post("/save-transcript", (req, res) => {
  try {
    const { room, transcripts, savedAt } = req.body;

    const fileName = `transcript-${room || "default"}-${Date.now()}.json`;
    const filePath = path.join(uploadDir, fileName);

    const data = {
      room,
      savedAt,
      conversation: transcripts, // [{ speaker, message }]
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.json({ message: "Transcript saved successfully", file: fileName });
  } catch (err) {
    console.error("❌ Error saving transcript:", err);
    res.status(500).json({ error: "Failed to save transcript" });
  }
});

export default router;
