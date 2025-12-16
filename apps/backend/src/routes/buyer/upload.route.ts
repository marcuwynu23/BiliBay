import {Router} from "express";
import {uploadReceipt} from "../../controllers/buyer/upload.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";
import {uploadReceipt as uploadMiddleware} from "../../middlewares/upload.middleware";

const router = Router();

router.post("/receipt", authMiddleware, uploadMiddleware.single("receipt"), uploadReceipt);

export default router;

