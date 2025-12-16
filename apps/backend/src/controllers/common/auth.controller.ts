import {Request, Response} from "express";
import User from "../../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";

// Helper to generate random token
const generateToken = () => crypto.randomBytes(32).toString("hex");

export const register = async (req: Request, res: Response) => {
  try {
    const {name, email, password, role, phone} = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({error: "Name, email, and password are required"});
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({error: "Invalid input format"});
    }

    if (password.length < 6) {
      return res.status(400).json({error: "Password must be at least 6 characters"});
    }

    // Validate role
    if (role && !["buyer", "seller"].includes(role)) {
      return res.status(400).json({error: "Invalid role. Must be 'buyer' or 'seller'"});
    }

    // Check if user exists
    const existingUser = await User.findOne({email: email.toLowerCase()});
    if (existingUser) {
      return res.status(400).json({error: "Email already registered"});
    }

    const hashed = await bcrypt.hash(password, 10);
    const emailVerificationToken = generateToken();

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: role || "buyer",
      phone,
      emailVerificationToken,
    });

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, emailVerificationToken);

    const token = jwt.sign({id: user._id.toString(), role: user.role}, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
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

    // Validate input
    if (!email || !password) {
      return res.status(400).json({error: "Email and password are required"});
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({error: "Invalid input format"});
    }

    const user = await User.findOne({email: email.toLowerCase()});
    if (!user) return res.status(404).json({error: "User not found"});

    if (!user.isActive) {
      return res.status(403).json({error: "Account is disabled"});
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({error: "Invalid credentials"});

    const token = jwt.sign({id: user._id.toString(), role: user.role}, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
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

    // TODO: Send password reset email
    // await sendPasswordResetEmail(user.email, resetToken);

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
