import {Router} from "express";
import {getPayments, verifyPayment} from "../../controllers/admin/payment.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";
import {adminMiddleware} from "../../middlewares/admin.middleware";

const router = Router();

router.get("/", authMiddleware, adminMiddleware, getPayments);
router.put("/:id/verify", authMiddleware, adminMiddleware, verifyPayment);

export default router;

