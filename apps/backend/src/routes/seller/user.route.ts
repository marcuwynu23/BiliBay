import {Router} from "express";
import {
  getSellerProfile,
  updateSellerProfile,
  changePassword,
} from "../../controllers/seller/user.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, getSellerProfile);
router.put("/me", authMiddleware, updateSellerProfile);
router.post("/me/change-password", authMiddleware, changePassword);

export default router;
