import mongoose from "mongoose";

export async function testConnection() {
  try {
    await connect();
    await disconnect();
    console.log("Database connection test successful");
  } catch (error) {
    console.error("Error testing database connection:", error);
  }
}

export async function connect() {
  try {
    const dbHost = process.env.DBHOST;

    if (!dbHost) {
      throw new Error("DBHOST environment variable is not defined");
    }

    await mongoose.connect(dbHost);

    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().command({ ping: 1 });
      console.log("Successfully connected to the database");
    } else {
      throw new Error("Failed to connect to the database");
    }

  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

export async function disconnect() {
  try {
    await mongoose.disconnect();
    console.log("Successfully disconnected from the database");
  } catch (error) {
    console.error("Error disconnecting from the database:", error);
  }
}