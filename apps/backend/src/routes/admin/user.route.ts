import {Router} from "express";
import {getUsers, toggleUserStatus} from "../../controllers/admin/user.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";
import {adminMiddleware} from "../../middlewares/admin.middleware";

const router = Router();

router.get("/", authMiddleware, adminMiddleware, getUsers);
router.put("/:id/toggle-status", authMiddleware, adminMiddleware, toggleUserStatus);

export default router;

