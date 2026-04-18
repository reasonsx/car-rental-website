// src/repository/database.ts
import mongoose from "mongoose";

let isConnected = false; // track connection status

export async function connect() {
  if (isConnected) return; // already connected, skip

  const dbHost = process.env.DBHOST;
  if (!dbHost) throw new Error("DBHOST environment variable is not defined");

  try {
    await mongoose.connect(dbHost);
    isConnected = true;
    console.log("✅ Successfully connected to the database");
  } catch (error) {
    console.error("❌ Error connecting to the database:", error);
    throw error;
  }
}

// optional: only call if server shuts down
export async function disconnect() {
  if (!isConnected) return;
  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("✅ Successfully disconnected from the database");
  } catch (error) {
    console.error("❌ Error disconnecting from the database:", error);
  }
}
