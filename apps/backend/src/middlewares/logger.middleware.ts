import {Request, Response, NextFunction} from "express";
import logger from "../utils/logger";

/**
 * Middleware to log all HTTP requests
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const {method, originalUrl, ip} = req;
  const userAgent = req.get("user-agent") || "Unknown";

  // Log request start
  logger.info("Incoming request", {
    method,
    url: originalUrl,
    ip,
    userAgent,
    userId: (req as any).user?.id || "anonymous",
  });

  // Capture response finish
  res.on("finish", () => {
    const duration = Date.now() - start;
    const {statusCode} = res;

    // Log response
    const logLevel = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
    logger[logLevel]("Request completed", {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      ip,
      userId: (req as any).user?.id || "anonymous",
    });
  });

  next();
};

/**
 * Middleware to log errors
 */
export const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Request error", {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: (req as any).user?.id || "anonymous",
  });

  next(err);
};

