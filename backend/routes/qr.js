import express from "express";
import { generateQrDataUrl } from "../services/qrGenerator.js";
import { qrGenerateLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.post("/generate-qr", qrGenerateLimiter, async (req, res) => {
  try {
    const qrImage = await generateQrDataUrl(req.body);
    res.json({ qrImage });
  } catch (err) {
    if (err.statusCode === 400) {
      return res.status(400).json({ error: err.message });
    }
    console.error("QR Generation Error:", err.message);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

export default router;
