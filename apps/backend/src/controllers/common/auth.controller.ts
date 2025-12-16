import {Request, Response} from "express";
import User from "../../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import logger from "../../utils/logger";
import {JWT_SECRET} from "../../config/jwt.config";

// Helper to generate random token
const generateToken = () => crypto.randomBytes(32).toString("hex");

export const register = async (req: Request, res: Response) => {
  try {
    const {firstName, middleName, lastName, birthday, email, password, role, phone} = req.body;
    
    logger.info("Registration attempt", {
      email: email?.toLowerCase(),
      role: role || "buyer",
    });

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({error: "First name, last name, email, and password are required"});
    }

    if (typeof firstName !== "string" || typeof lastName !== "string" || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({error: "Invalid input format"});
    }

    if (password.length < 6) {
      return res.status(400).json({error: "Password must be at least 6 characters"});
    }

    // Validate role
    if (role && !["buyer", "seller"].includes(role)) {
      return res.status(400).json({error: "Invalid role. Must be 'buyer' or 'seller'"});
    }

    // Validate birthday if provided
    let birthdayDate: Date | undefined;
    if (birthday) {
      birthdayDate = new Date(birthday);
      if (isNaN(birthdayDate.getTime())) {
        return res.status(400).json({error: "Invalid birthday format"});
      }
    }

    // Check if user exists
    const existingUser = await User.findOne({email: email.toLowerCase()});
    if (existingUser) {
      logger.warn("Registration failed: Email already registered", {
        email: email.toLowerCase(),
      });
      return res.status(400).json({error: "Email already registered"});
    }

    const hashed = await bcrypt.hash(password, 10);
    const emailVerificationToken = generateToken();

    const user = await User.create({
      firstName,
      middleName: middleName || undefined,
      lastName,
      birthday: birthdayDate,
      email: email.toLowerCase(),
      password: hashed,
      role: role || "buyer",
      phone,
      emailVerificationToken,
    });

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, emailVerificationToken);

    // Log JWT_SECRET status (masked for security)
    const secretLength = JWT_SECRET.length;
    const secretPreview = JWT_SECRET.substring(0, 4) + "..." + JWT_SECRET.substring(secretLength - 4);
    logger.debug("Signing token for registration", {
      secretLength,
      secretPreview,
      userId: user._id.toString(),
    });
    
    const token = jwt.sign({id: user._id.toString(), role: user.role}, JWT_SECRET, {
      expiresIn: "30d", // Extended to 30 days for better user experience
    });

    logger.info("User registered successfully", {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenPreview: token.substring(0, 20) + "...",
    });

    // Construct full name for response
    const fullName = user.middleName 
      ? `${user.firstName} ${user.middleName} ${user.lastName}`
      : `${user.firstName} ${user.lastName}`;

    res.status(201).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        name: fullName, // For backward compatibility
        birthday: user.birthday,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const {email, password} = req.body;
    
    logger.info("Login attempt", {
      email: email?.toLowerCase(),
    });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({error: "Email and password are required"});
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({error: "Invalid input format"});
    }

    const user = await User.findOne({email: email.toLowerCase()});
    if (!user) {
      logger.warn("Login failed: User not found", {
        email: email.toLowerCase(),
      });
      return res.status(404).json({error: "User not found"});
    }

    if (!user.isActive) {
      logger.warn("Login failed: Account disabled", {
        userId: user._id.toString(),
        email: user.email,
      });
      return res.status(403).json({error: "Account is disabled"});
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      logger.warn("Login failed: Invalid credentials", {
        userId: user._id.toString(),
        email: user.email,
      });
      return res.status(401).json({error: "Invalid credentials"});
    }

    // Log JWT_SECRET status (masked for security)
    const secretLength = JWT_SECRET.length;
    const secretPreview = JWT_SECRET.substring(0, 4) + "..." + JWT_SECRET.substring(secretLength - 4);
    logger.debug("Signing token for login", {
      secretLength,
      secretPreview,
      userId: user._id.toString(),
    });
    
    const token = jwt.sign({id: user._id.toString(), role: user.role}, JWT_SECRET, {
      expiresIn: "30d", // Extended to 30 days for better user experience
    });

    logger.info("User logged in successfully", {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenPreview: token.substring(0, 20) + "...",
    });

    // Construct full name for response
    const fullName = user.middleName 
      ? `${user.firstName} ${user.middleName} ${user.lastName}`
      : `${user.firstName} ${user.lastName}`;

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        name: fullName, // For backward compatibility
        birthday: user.birthday,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err: any) {
    logger.error("Login error", {
      error: err.message,
      stack: err.stack,
      email: req.body.email,
    });
    res.status(400).json({error: err.message || "Login failed"});
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const {token} = req.params;
    const user = await User.findOne({emailVerificationToken: token});

    if (!user) {
      return res.status(400).json({error: "Invalid verification token"});
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({message: "Email verified successfully"});
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const {email} = req.body;
    const user = await User.findOne({email: email.toLowerCase()});

    if (!user) {
      // Don't reveal if email exists for security
      return res.json({message: "If email exists, password reset link has been sent"});
    }

    const resetToken = generateToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send password reset email
    const {sendPasswordResetEmail} = await import("../../utils/email.service");
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({message: "If email exists, password reset link has been sent"});
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const {token, newPassword} = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: {$gt: Date.now()},
    });

    if (!user) {
      return res.status(400).json({error: "Invalid or expired reset token"});
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({message: "Password reset successfully"});
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};
