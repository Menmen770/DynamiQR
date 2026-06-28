import express from "express";
import cors from "cors";
import fs from "fs";
import passport from "passport";
import { createSessionMiddleware } from "./middleware/session.js";
import { apiLimiter } from "./middleware/rateLimiters.js";
import { registerPassportStrategies } from "./config/passport.js";
import qrRedirectRoutes from "./routes/qrRedirect.js";
import qrRoutes from "./routes/qr.js";
import authRoutes from "./routes/auth.js";
import savedQrRoutes from "./routes/savedQr.js";
import dashboardFolderRoutes from "./routes/dashboardFolders.js";
import { LOGO_EMAIL_PATH } from "./services/mailer.js";

export function createApp() {
  const app = express();

  // Render/Cloudflare: trust proxy for cookies, client IP, and cf-ipcountry.
  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "5mb" }));
  app.use(createSessionMiddleware());
  app.use(passport.initialize());

  registerPassportStrategies();

  app.get("/", (req, res) => {
    res.send("The QR Server is UP and running!");
  });

  app.get("/email-assets/logo.png", (req, res) => {
    if (!fs.existsSync(LOGO_EMAIL_PATH)) {
      return res.status(404).send("Logo not found");
    }
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.sendFile(LOGO_EMAIL_PATH);
  });

  app.use("/api", apiLimiter);
  app.use("/api", qrRedirectRoutes);
  app.use("/api", qrRoutes);
  app.use("/api", authRoutes);
  app.use("/api", savedQrRoutes);
  app.use("/api", dashboardFolderRoutes);

  return app;
}
