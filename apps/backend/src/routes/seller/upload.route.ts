import {Router} from "express";
import {uploadProductImages as uploadController} from "../../controllers/seller/upload.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";
import {uploadProductImages as uploadMiddleware} from "../../middlewares/upload.middleware";

const router = Router();

router.post(
  "/products",
  authMiddleware,
  uploadMiddleware.array("images", 10),
  uploadController
);

export default router;

