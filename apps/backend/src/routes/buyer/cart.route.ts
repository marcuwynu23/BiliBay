import {Router} from "express";
import {
  addToCart,
  removeFromCart,
} from "../../controllers/buyer/cart.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, addToCart);
router.delete("/:productId", authMiddleware, removeFromCart);

export default router;
