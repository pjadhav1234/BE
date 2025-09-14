// backend/routes/speechRoutes.js
import speech from "@google-cloud/speech";
import express from 'express';

const router = express.Router();

// Initialize Google Speech client.
// The client will automatically find credentials if the GOOGLE_APPLICATION_CREDENTIALS
// environment variable is set. DO NOT hardcode keyFilename.
const client = new speech.SpeechClient();

// Endpoint: send audio buffer to Google Cloud and get transcript
router.post("/transcribe", async (req, res) => {
  try {
    const { audioContent } = req.body; // base64 audio from frontend

    if (!audioContent) {
      return res.status(400).json({ error: "No audio content provided." });
    }

    const audio = {
      content: audioContent,
    };

    const config = {
      encoding: "WEBM_OPUS", // Ensure this matches the frontend audio format
      sampleRateHertz: 48000,
      languageCode: "en-US",
    };

    const request = {
      audio: audio,
      config: config,
    };

    const [response] = client.recognize(request);

    const transcript = response.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");

    res.json({ transcript });
  } catch (err) {
    console.error("Transcription error:", err);
    res.status(500).json({ error: "Failed to transcribe audio" });
  }
});

export default router;