import {Router} from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
} from "../../controllers/buyer/order.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getOrders);
router.get("/:id", authMiddleware, getOrderById);
router.post("/", authMiddleware, createOrder);
router.post("/:id/cancel", authMiddleware, cancelOrder);

export default router;
