import {Router} from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../../controllers/buyer/user.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, updateProfile);
router.post("/me/change-password", authMiddleware, changePassword);

export default router;
