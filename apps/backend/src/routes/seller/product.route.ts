import {Router} from "express";
import {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
} from "../../controllers/seller/product.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getMyProducts);
router.post("/", authMiddleware, createProduct);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

export default router;
