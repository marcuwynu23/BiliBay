// src/config/database.config.ts
import mongoose from "mongoose";

export const connectDB = async (mongoUri?: string) => {
  try {
    const uri =
      mongoUri || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bilibay";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // stop the app if DB connection fails
  }
};
