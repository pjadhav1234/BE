import express from "express";
import multer from "multer";
import { convertAudio } from "../controllers/speechController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/convert", upload.single("audio"), convertAudio);

export default router;
