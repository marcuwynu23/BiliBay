// src/middlewares/auth.middleware.ts
import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import {JWT_SECRET} from "../config/jwt.config";

interface IUserPayload {
  id: string;
  role: "buyer" | "seller" | "admin";
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("Authentication failed: No token provided", {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });
    return res.status(401).json({error: "Unauthorized: No token provided"});
  }

  let token = authHeader.split(" ")[1];

  // Validate and clean token
  if (!token) {
    logger.warn("Authentication failed: No token in Bearer header", {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      authHeader: authHeader.substring(0, 20) + "...",
    });
    return res.status(401).json({error: "Unauthorized: Invalid token"});
  }

  // Trim whitespace from token
  token = token.trim();

  if (token === "") {
    logger.warn("Authentication failed: Empty token after trim", {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    });
    return res.status(401).json({error: "Unauthorized: Invalid token"});
  }

  try {
    // Log JWT_SECRET status (masked for security)
    const secretLength = JWT_SECRET.length;
    const secretPreview = JWT_SECRET.substring(0, 4) + "..." + JWT_SECRET.substring(secretLength - 4);
    
    // Try to decode token without verification first (for debugging)
    try {
      const decoded = jwt.decode(token);
      logger.debug("Token decoded (unverified)", {
        decoded: decoded ? JSON.stringify(decoded) : "null",
        tokenPreview: token.substring(0, 20) + "...",
      });
    } catch (decodeErr) {
      logger.debug("Token decode failed", {
        error: (decodeErr as Error).message,
      });
    }
    
    logger.debug("Verifying token", {
      secretLength,
      secretPreview,
      tokenPreview: token.substring(0, 20) + "...",
      hasEnvSecret: !!process.env.JWT_SECRET,
    });
    
    const payload = jwt.verify(token, JWT_SECRET) as IUserPayload;
    req.user = payload;
    
    logger.debug("Authentication successful", {
      userId: payload.id,
      role: payload.role,
      method: req.method,
      url: req.originalUrl,
    });
    
    next();
  } catch (err: any) {
    // More detailed error logging
    const errorDetails: any = {
      error: err.message,
      errorName: err.name,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      tokenPreview: token ? token.substring(0, 20) + "..." : "no token",
    };
    
    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      errorDetails.warning = "JWT_SECRET not set in environment, using default";
    }
    errorDetails.secretLength = JWT_SECRET.length;
    errorDetails.hasEnvSecret = !!process.env.JWT_SECRET;
    
    logger.warn("Authentication failed: Invalid token", errorDetails);
    return res.status(401).json({error: "Unauthorized: Invalid token"});
  }
};
