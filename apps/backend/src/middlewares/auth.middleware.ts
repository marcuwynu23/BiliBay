// src/middlewares/auth.middleware.ts
import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";

interface IUserPayload {
  id: string;
  role: "buyer" | "seller";
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
    return res.status(401).json({error: "Unauthorized: No token provided"});
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, "SECRET_KEY") as IUserPayload;
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({error: "Unauthorized: Invalid token"});
  }
};
