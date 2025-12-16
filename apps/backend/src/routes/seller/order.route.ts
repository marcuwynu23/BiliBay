import {Router} from "express";
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
} from "../../controllers/seller/order.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/status", authMiddleware, updateOrderStatus);

export default router;
