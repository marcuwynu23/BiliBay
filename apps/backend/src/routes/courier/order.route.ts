import {Router} from "express";
import {authMiddleware} from "../../middlewares/auth.middleware";
import {
  getCourierOrders,
  getDeliverersForCourier,
  markCourierOrderShipped,
} from "../../controllers/courier/order.controller";

const router = Router();

router.get("/", authMiddleware, getCourierOrders);
router.get("/deliverers", authMiddleware, getDeliverersForCourier);
router.put("/:id/ship", authMiddleware, markCourierOrderShipped);

export default router;

