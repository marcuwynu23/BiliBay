import {Router} from "express";
import {uploadProductImages as uploadController} from "../../controllers/seller/upload.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";
import {uploadProductImages as uploadMiddleware} from "../../middlewares/upload.middleware";
import logger from "../../utils/logger";

const router = Router();

// Error handling middleware for multer errors
// Must be placed after multer middleware to catch multer errors
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err) {
    logger.error("Multer upload error", {
      error: err.message || String(err),
      errorName: err.name,
      userId: req.user?.id,
      url: req.originalUrl,
    });
    
    if (err.code === "LIMIT_FILE_SIZE" || err.message?.includes("File too large")) {
      return res.status(400).json({error: "File size exceeds 5MB limit"});
    }
    if (err.message?.includes("Invalid file type") || err.message?.includes("Only JPEG")) {
      return res.status(400).json({error: err.message || "Invalid file type. Only JPEG, PNG, and WebP images are allowed."});
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({error: "Too many files. Maximum 10 files allowed."});
    }
    return res.status(400).json({error: err.message || "Upload failed"});
  }
  next();
};

router.post(
  "/products",
  authMiddleware,
  uploadMiddleware.array("images", 10),
  handleMulterError,
  uploadController
);

export default router;

