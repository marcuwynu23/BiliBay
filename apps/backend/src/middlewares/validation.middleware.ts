// src/middlewares/validation.middleware.ts
import {Request, Response, NextFunction} from "express";
import {validationResult, ValidationChain} from "express-validator";

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({errors: errors.array()});
  };
};

// Sanitize input helper
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Basic XSS protection - remove script tags
  const sanitize = (obj: any): any => {
    if (typeof obj === "string") {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  // Only sanitize req.body (req.query is read-only in Express and query params are URL-encoded)
  if (req.body && typeof req.body === "object") {
    req.body = sanitize(req.body);
  }

  next();
};

