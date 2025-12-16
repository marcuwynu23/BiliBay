import {Router} from "express";
import {getDashboardStats} from "../../controllers/admin/dashboard.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";
import {adminMiddleware} from "../../middlewares/admin.middleware";

const router = Router();

router.get("/", authMiddleware, adminMiddleware, getDashboardStats);

export default router;

