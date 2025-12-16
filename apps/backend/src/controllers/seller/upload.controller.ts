// controllers/seller/upload.controller.ts
import {Request, Response} from "express";
import {getFileUrl} from "../../middlewares/upload.middleware";
import logger from "../../utils/logger";

export const uploadProductImages = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      logger.warn("Upload attempt without authentication", {
        url: req.originalUrl,
        ip: req.ip,
      });
      return res.status(401).json({error: "Unauthorized"});
    }
    
    if (req.user.role !== "seller") {
      logger.warn("Upload attempt by non-seller", {
        userId: req.user.id,
        role: req.user.role,
        url: req.originalUrl,
      });
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for sellers"});
    }

    const files = req.files as Express.Multer.File[];
    
    logger.debug("Upload request received", {
      userId: req.user.id,
      filesCount: files ? files.length : 0,
      hasFiles: !!files,
    });
    
    if (!files || files.length === 0) {
      logger.warn("Upload failed: No files uploaded", {
        userId: req.user.id,
        body: req.body,
      });
      return res.status(400).json({error: "No files uploaded"});
    }

    const imageUrls = files.map((file) => getFileUrl(file.filename, "product"));

    logger.info("Images uploaded successfully", {
      userId: req.user.id,
      fileCount: files.length,
      imageUrls: imageUrls,
    });

    res.json({images: imageUrls});
  } catch (err: any) {
    logger.error("Upload error", {
      error: err.message,
      stack: err.stack,
      userId: req.user?.id,
    });
    res.status(400).json({error: err.message || "Upload failed"});
  }
};

