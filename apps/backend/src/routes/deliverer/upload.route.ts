import {Router} from "express";
import {authMiddleware} from "../../middlewares/auth.middleware";
import {uploadReceipt as uploadMiddleware} from "../../middlewares/upload.middleware";
import {uploadDeliveryEvidence} from "../../controllers/deliverer/upload.controller";

const router = Router();

router.post(
  "/evidence",
  authMiddleware,
  uploadMiddleware.single("evidence"),
  uploadDeliveryEvidence,
);

export default router;

