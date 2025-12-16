import express from "express";
import dotenv from "dotenv";

// Routes
import authRoutes from "../routes/common/auth.route";
import buyerUserRoutes from "../routes/buyer/user.route";
import buyerCartRoutes from "../routes/buyer/cart.route";
import buyerOrderRoutes from "../routes/buyer/order.route";
import buyerProductRoutes from "../routes/buyer/product.route";
import sellerUserRoutes from "../routes/seller/user.route";
import sellerProductRoutes from "../routes/seller/product.route";
import sellerOrderRoutes from "../routes/seller/order.route";
import adminDashboardRoutes from "../routes/admin/dashboard.route";
import adminUserRoutes from "../routes/admin/user.route";
import adminOrderRoutes from "../routes/admin/order.route";
import adminPaymentRoutes from "../routes/admin/payment.route";
import adminCategoryRoutes from "../routes/admin/category.route";

// Middleware
import {authMiddleware} from "../middlewares/auth.middleware";
import {authRateLimiter, apiRateLimiter} from "../middlewares/rateLimit.middleware";
import {sanitizeInput} from "../middlewares/validation.middleware";
import cors from "cors";

dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json({limit: "10mb"}));

// Handle JSON parse errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({error: "Invalid JSON in request body"});
  }
  next(err);
});

// CORS
app.use(cors());

// Input sanitization
app.use(sanitizeInput);

// Rate limiting (disabled in test mode)
app.use("/api/", apiRateLimiter);

// --- Public Routes ---
app.use("/api/auth", authRateLimiter, authRoutes);

// --- Buyer Routes ---
app.use("/api/buyer/users", authMiddleware, buyerUserRoutes);
app.use("/api/buyer/cart", authMiddleware, buyerCartRoutes);
app.use("/api/buyer/orders", authMiddleware, buyerOrderRoutes);
app.use("/api/buyer/products", buyerProductRoutes);
// Note: Upload routes are not included in test app for simplicity

// --- Seller Routes ---
app.use("/api/seller/users", authMiddleware, sellerUserRoutes);
app.use("/api/seller/products", authMiddleware, sellerProductRoutes);
app.use("/api/seller/orders", authMiddleware, sellerOrderRoutes);

// --- Admin Routes ---
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({error: "Route not found"});
});

export default app;

