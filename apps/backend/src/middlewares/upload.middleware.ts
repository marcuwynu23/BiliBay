// src/middlewares/upload.middleware.ts
import multer from "multer";
import path from "path";
import {Request} from "express";
import fs from "fs";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {recursive: true});
}

const productImagesDir = path.join(uploadsDir, "products");
if (!fs.existsSync(productImagesDir)) {
  fs.mkdirSync(productImagesDir, {recursive: true});
}

const receiptsDir = path.join(uploadsDir, "receipts");
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, {recursive: true});
}

// Storage configuration for product images
const productImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productImagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Storage configuration for receipt images
const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, receiptsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `receipt-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter for images
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed."));
  }
};

// File filter for receipts (images or PDF)
const receiptFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and PDF files are allowed."));
  }
};

export const uploadProductImages = multer({
  storage: productImageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const uploadReceipt = multer({
  storage: receiptStorage,
  fileFilter: receiptFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Helper to get file URL
export const getFileUrl = (filename: string, type: "product" | "receipt" = "product") => {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const folder = type === "product" ? "products" : "receipts";
  return `${baseUrl}/uploads/${folder}/${filename}`;
};

