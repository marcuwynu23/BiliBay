import {Router} from "express";
import {getOrders} from "../../controllers/seller/order.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getOrders);

export default router;
