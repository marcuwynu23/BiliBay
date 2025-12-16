/**
 * Centralized JWT configuration
 * Ensures the same JWT_SECRET is used throughout the application
 */
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";

if (!process.env.JWT_SECRET) {
  console.warn("⚠️  WARNING: JWT_SECRET not set in environment variables. Using default 'SECRET_KEY'.");
  console.warn("⚠️  This is insecure for production. Please set JWT_SECRET in your .env file.");
}

export {JWT_SECRET};

