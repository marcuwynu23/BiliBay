import {Router} from "express";
import {authMiddleware} from "../../middlewares/auth.middleware";
import {
  getDelivererOrders,
  markDelivererOrderDelivered,
} from "../../controllers/deliverer/order.controller";

const router = Router();

router.get("/", authMiddleware, getDelivererOrders);
router.put("/:id/deliver", authMiddleware, markDelivererOrderDelivered);

export default router;

