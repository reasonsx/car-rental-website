import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.DBHOST;
  if (!uri) {
    throw new Error("DBHOST environment variable is not defined");
  }

  try {
    await mongoose.connect(uri, {
      dbName: "car-rental",
    });

    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error: unknown) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // 🔥 important
  }
};

export const disconnectDB = async () => {
  if (!isConnected) return;

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("🔌 MongoDB disconnected");
  } catch (error: unknown) {
    console.error("❌ MongoDB disconnect error:", error);
  }
};
