import "dotenv/config";
import { connectMongoDB } from "./mongodb/mongodb.js";
import { createApp } from "./app.js";
import {
  isEmailConfigured,
  verifySmtpConnection,
} from "./services/mailer.js";

const PORT = process.env.PORT || 5000;

async function start() {
  await connectMongoDB();

  if (isEmailConfigured()) {
    const smtpCheck = await verifySmtpConnection();
    if (smtpCheck.ok) {
      console.log("Email service ready");
    } else {
      console.warn(
        "Email service unavailable:",
        smtpCheck.error || smtpCheck.reason,
      );
    }
  }

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
