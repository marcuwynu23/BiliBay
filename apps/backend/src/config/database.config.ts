// src/config/database.config.ts
import mongoose from "mongoose";
import logger from "../utils/logger";

export const connectDB = async (mongoUri?: string) => {
  try {
    const uri =
      mongoUri || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bilibay";
    
    logger.info("Attempting to connect to MongoDB", {
      uri: uri.replace(/\/\/.*@/, "//***:***@"), // Hide credentials in logs
    });
    
    await mongoose.connect(uri);
    
    logger.info("Connected to MongoDB successfully", {
      database: mongoose.connection.db?.databaseName || "unknown",
    });
    
    // Log MongoDB connection events
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error", {
        error: err.message,
        stack: err.stack,
      });
    });
    
    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });
    
    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
    });
  } catch (err: any) {
    logger.error("MongoDB connection failed", {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1); // stop the app if DB connection fails
  }
};
