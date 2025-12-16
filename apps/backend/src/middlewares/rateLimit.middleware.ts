// src/middlewares/rateLimit.middleware.ts
import rateLimit from "express-rate-limit";
import {Request, Response, NextFunction} from "express";

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV !== "production";

// Rate limiter for authentication endpoints
const authRateLimiterMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many authentication attempts, please try again later.",
    });
  },
});

// Wrapper that skips rate limiting in development
export const authRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isDevelopment) {
    return next(); // Skip rate limiting in development
  }
  return authRateLimiterMiddleware(req, res, next);
};

// General API rate limiter
const apiRateLimiterMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many requests from this IP, please try again later.",
    });
  },
});

// Wrapper that skips rate limiting in development
export const apiRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isDevelopment) {
    return next(); // Skip rate limiting in development
  }
  return apiRateLimiterMiddleware(req, res, next);
};
