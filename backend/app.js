const express = require("express");
const cors = require("cors");
const passport = require("passport");
const { createSessionMiddleware } = require("./middleware/session");
const { registerPassportStrategies } = require("./config/passport");
const qrRedirectRoutes = require("./routes/qrRedirect");
const qrRoutes = require("./routes/qr");
const authRoutes = require("./routes/auth");
const savedQrRoutes = require("./routes/savedQr");
const dashboardFolderRoutes = require("./routes/dashboardFolders");

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(createSessionMiddleware());
  app.use(passport.initialize());

  registerPassportStrategies();

  app.get("/", (req, res) => {
    res.send("The QR Server is UP and running! 🚀");
  });

  app.use("/api", qrRedirectRoutes);
  app.use("/api", qrRoutes);
  app.use("/api", authRoutes);
  app.use("/api", savedQrRoutes);
  app.use("/api", dashboardFolderRoutes);

  return app;
}

module.exports = { createApp };
