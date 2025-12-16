// controllers/seller/upload.controller.ts
import {Request, Response} from "express";
import {getFileUrl} from "../../middlewares/upload.middleware";

export const uploadProductImages = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for sellers"});
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({error: "No files uploaded"});
    }

    const imageUrls = files.map((file) => getFileUrl(file.filename, "product"));

    res.json({images: imageUrls});
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

