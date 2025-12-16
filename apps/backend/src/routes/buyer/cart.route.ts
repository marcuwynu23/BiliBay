import {Router} from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "../../controllers/buyer/cart.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getCart);
router.post("/", authMiddleware, addToCart);
router.put("/:itemId", authMiddleware, updateCartItem);
router.delete("/:itemId", authMiddleware, removeFromCart);

export default router;
