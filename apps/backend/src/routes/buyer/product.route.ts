import {Router} from "express";
import {
  getProducts,
  getProductById,
} from "../../controllers/buyer/product.controller";

const router = Router();

// Get all available products
router.get("/", getProducts);

// Get a specific product
router.get("/:id", getProductById);

export default router;
