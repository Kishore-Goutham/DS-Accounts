import mongoose from "mongoose";
import { env } from "./env.js";

// Reject fields not in the schema when filtering, and keep queries predictable.
mongoose.set("strictQuery", true);

export async function connectDB() {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`[db] MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`[db] MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.connection.close();
  console.log("[db] MongoDB connection closed");
}
