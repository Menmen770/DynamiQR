/**
 * בדיקת חיבור: node scripts/ping-mongo.js (מריצים מתוך תיקיית backend)
 * דורש MONGO_URI ב-.env (מקומי או mongodb+srv מ-Atlas)
 */
require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI חסר ב-.env");
  process.exit(1);
}

const isAtlasSrv = uri.includes("mongodb+srv://");
const opts = {
  serverSelectionTimeoutMS: isAtlasSrv ? 20000 : 5000,
  connectTimeoutMS: isAtlasSrv ? 20000 : 10000,
};

async function run() {
  try {
    await mongoose.connect(uri, opts);
    await mongoose.connection.db.admin().command({ ping: 1 });
    const name = mongoose.connection.name;
    console.log("OK: ping הצליח. מסד:", name || "(default)");
    process.exit(0);
  } catch (e) {
    console.error("נכשל:", e.message);
    process.exit(1);
  } finally {
    try {
      await mongoose.disconnect();
    } catch {
      /* ignore */
    }
  }
}

void run();
