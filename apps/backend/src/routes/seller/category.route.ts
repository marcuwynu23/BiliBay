import {Router} from "express";
import {authMiddleware} from "../../middlewares/auth.middleware";
import {
  getSellerCategories,
  createSellerCategory,
  updateSellerCategory,
  deleteSellerCategory,
} from "../../controllers/seller/category.controller";

const router = Router();

router.get("/", authMiddleware, getSellerCategories);
router.post("/", authMiddleware, createSellerCategory);
router.put("/:id", authMiddleware, updateSellerCategory);
router.delete("/:id", authMiddleware, deleteSellerCategory);

export default router;
