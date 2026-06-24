import "dotenv/config";
import { connectMongoDB } from "./mongodb/mongodb.js";
import { createApp } from "./app.js";

const PORT = process.env.PORT || 5000;

async function start() {
  await connectMongoDB();

  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
