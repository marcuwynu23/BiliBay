import {Router} from "express";
import {authMiddleware} from "../../middlewares/auth.middleware";
import {getDelivererProfile} from "../../controllers/deliverer/user.controller";

const router = Router();

router.get("/me", authMiddleware, getDelivererProfile);

export default router;

