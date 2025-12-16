import {Router} from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../controllers/admin/category.controller";
import {authMiddleware} from "../../middlewares/auth.middleware";
import {adminMiddleware} from "../../middlewares/admin.middleware";

const router = Router();

router.get("/", authMiddleware, adminMiddleware, getCategories);
router.post("/", authMiddleware, adminMiddleware, createCategory);
router.put("/:id", authMiddleware, adminMiddleware, updateCategory);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

export default router;

