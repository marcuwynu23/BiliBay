import {Request, Response} from "express";
import {getFileUrl} from "../../middlewares/upload.middleware";

export const uploadDeliveryEvidence = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "deliverer") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for deliverer"});
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({error: "No file uploaded"});
    }

    const evidenceUrl = getFileUrl(file.filename, "receipt");
    res.json({evidenceUrl});
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

