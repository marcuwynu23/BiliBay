import {Router} from "express";
import {
  createProduct,
  getMyProducts,
} from "../../controllers/seller/product.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createProduct);
router.get("/", authMiddleware, getMyProducts);

export default router;
