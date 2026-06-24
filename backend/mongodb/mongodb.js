import mongoose from "mongoose";

export async function connectMongoDB() {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    console.log("MongoDB URI not configured (development mode)");
    return;
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  const isAtlasSrv = String(MONGO_URI).includes("mongodb+srv://");
  const connectOptions = {
    serverSelectionTimeoutMS: isAtlasSrv ? 20000 : 5000,
    connectTimeoutMS: isAtlasSrv ? 20000 : 10000,
  };
  if (isAtlasSrv && process.env.MONGODB_SERVER_API === "1") {
    connectOptions.serverApi = {
      version: "1",
      strict: true,
      deprecationErrors: true,
    };
  }

  try {
    await mongoose.connect(MONGO_URI, connectOptions);
    console.log(
      isAtlasSrv
        ? "MongoDB connected (Atlas / SRV)"
        : "MongoDB connected",
    );
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
}
