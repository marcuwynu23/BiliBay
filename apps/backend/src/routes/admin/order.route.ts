import {Router} from "express";
import {
  getAllOrders,
  updateOrderStatus,
} from "../../controllers/admin/order.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";
import {adminMiddleware} from "../../middlewares/admin.middleware";

const router = Router();

router.get("/", authMiddleware, adminMiddleware, getAllOrders);
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);

export default router;

