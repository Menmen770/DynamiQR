import express from "express";
import cors from "cors";
import passport from "passport";
import { createSessionMiddleware } from "./middleware/session.js";
import { apiLimiter } from "./middleware/rateLimiters.js";
import { registerPassportStrategies } from "./config/passport.js";
import qrRedirectRoutes from "./routes/qrRedirect.js";
import qrRoutes from "./routes/qr.js";
import authRoutes from "./routes/auth.js";
import savedQrRoutes from "./routes/savedQr.js";
import dashboardFolderRoutes from "./routes/dashboardFolders.js";

export function createApp() {
  const app = express();

  // Render/Reverse proxy: required so secure cookies from express-session are set correctly in production.
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

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
    res.send("The QR Server is UP and running! 🚀");
  });

  app.use("/api", apiLimiter);
  app.use("/api", qrRedirectRoutes);
  app.use("/api", qrRoutes);
  app.use("/api", authRoutes);
  app.use("/api", savedQrRoutes);
  app.use("/api", dashboardFolderRoutes);

  return app;
}
