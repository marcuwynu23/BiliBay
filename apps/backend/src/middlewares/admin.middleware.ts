// src/middlewares/admin.middleware.ts
import {Request, Response, NextFunction} from "express";

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({error: "Unauthorized"});
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({error: "Forbidden: Admin access required"});
  }

  next();
};

