import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Use test database
const TEST_MONGO_URI =
  process.env.TEST_MONGO_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bilibay-test";

// Only setup database if mongoose is not already connected
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(TEST_MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("Connected to test database");
    } catch (error) {
      console.warn("Failed to connect to test database:", error);
      console.warn("Some tests may fail without database connection");
    }
  }
}, 15000);

afterEach(async () => {
  // Clean up collections after each test
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      try {
        await collections[key].deleteMany({});
      } catch (error) {
        // Ignore errors if collection doesn't exist
      }
    }
  }
});

afterAll(async () => {
  // Close database connection
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close();
      console.log("Disconnected from test database");
    } catch (error) {
      console.error("Error closing database connection:", error);
    }
  }
});

