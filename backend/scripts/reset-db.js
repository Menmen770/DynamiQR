/**
 * מאפס לגמרי את מסד הנתונים מה-MONGO_URI (כולל משתמשים, QR שמורים, תיקיות, sessions).
 * הרצה: מהתיקייה backend —
 *   PowerShell: $env:RESET_DB_YES='1'; node scripts/reset-db.js
 *   bash:       RESET_DB_YES=1 node scripts/reset-db.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;
const confirmed =
  process.argv.includes("--yes") ||
  process.argv.includes("-y") ||
  process.env.RESET_DB_YES === "1";

if (!uri) {
  console.error("MONGO_URI חסר");
  process.exit(1);
}
if (!confirmed) {
  console.error(
    "לא בוצע שינוי. לאשר מחיקה של כל המידע במסד — הרץ עם RESET_DB_YES=1 או ארגומנט --yes",
  );
  process.exit(1);
}

const isAtlasSrv = uri.includes("mongodb+srv://");
const opts = {
  serverSelectionTimeoutMS: isAtlasSrv ? 20000 : 5000,
};

async function run() {
  await mongoose.connect(uri, opts);
  const dbName = mongoose.connection.name;
  await mongoose.connection.dropDatabase();
  console.log("בוצע: מסד הנתונים רוקן לגמרי:", dbName);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
