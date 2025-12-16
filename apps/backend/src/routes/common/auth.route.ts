import {Router} from "express";
import {
  register,
  login,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from "../../controllers/common/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;
