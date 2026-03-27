import {Router} from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  markOrderAsReceived,
} from "../../controllers/buyer/order.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getOrders);
router.get("/:id", authMiddleware, getOrderById);
router.post("/", authMiddleware, createOrder);
router.post("/:id/cancel", authMiddleware, cancelOrder);
router.post("/:id/received", authMiddleware, markOrderAsReceived);

export default router;
