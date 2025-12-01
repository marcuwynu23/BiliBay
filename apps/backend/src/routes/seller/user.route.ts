import {Router} from "express";
import {getSellerProfile} from "../../controllers/seller/user.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, getSellerProfile);

export default router;
