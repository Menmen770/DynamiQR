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

  if (!isEmailConfigured()) {
    console.warn(
      "[mailer] ⚠ SMTP_USER / SMTP_PASS חסרים ב-.env — מיילי אימות לא יישלחו (קוד בקונסול בלבד)",
    );
  } else {
    const smtpCheck = await verifySmtpConnection();
    if (smtpCheck.ok) {
      console.log("[mailer] ✓ SMTP מחובר — מיילי אימות פעילים");
    } else {
      console.warn(
        "[mailer] ⚠ SMTP מוגדר אך החיבור נכשל:",
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
