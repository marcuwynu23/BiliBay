import {Router} from "express";
import {authMiddleware} from "../../middlewares/auth.middleware";
import {getCourierProfile} from "../../controllers/courier/user.controller";

const router = Router();

router.get("/me", authMiddleware, getCourierProfile);

export default router;

