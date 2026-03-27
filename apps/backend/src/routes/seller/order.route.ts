import {Router} from "express";
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  getDeliveryHandlers,
  assignOrderHandler,
} from "../../controllers/seller/order.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getOrders);
router.get("/handlers", authMiddleware, getDeliveryHandlers);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/status", authMiddleware, updateOrderStatus);
router.put("/:id/assign-handler", authMiddleware, assignOrderHandler);

export default router;
