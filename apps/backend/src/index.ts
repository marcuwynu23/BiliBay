import express, {Request, Response} from "express";
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/common/auth.route";
import buyerUserRoutes from "./routes/buyer/user.route";
import buyerCartRoutes from "./routes/buyer/cart.route";
import buyerOrderRoutes from "./routes/buyer/order.route";
import buyerProductRoutes from "./routes/buyer/product.route";
import sellerUserRoutes from "./routes/seller/user.route";
import sellerProductRoutes from "./routes/seller/product.route";
import sellerOrderRoutes from "./routes/seller/order.route";
import adminDashboardRoutes from "./routes/admin/dashboard.route";
import adminUserRoutes from "./routes/admin/user.route";
import adminOrderRoutes from "./routes/admin/order.route";
import adminPaymentRoutes from "./routes/admin/payment.route";
import adminCategoryRoutes from "./routes/admin/category.route";
import sellerUploadRoutes from "./routes/seller/upload.route";
import buyerUploadRoutes from "./routes/buyer/upload.route";

// Middleware
import {authMiddleware} from "./middlewares/auth.middleware";
import {authRateLimiter, apiRateLimiter} from "./middlewares/rateLimit.middleware";
import {sanitizeInput} from "./middlewares/validation.middleware";

// DB Connection
import {connectDB} from "./config/database.config";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json({limit: "10mb"}));

// Handle JSON parse errors (must be right after express.json())
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({error: "Invalid JSON in request body"});
  }
  next(err);
});

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// CORS
import cors from "cors";
app.use(cors());

// Input sanitization
app.use(sanitizeInput);

// Rate limiting
app.use("/api/", apiRateLimiter);

// --- Public Routes ---
app.use("/api/auth", authRateLimiter, authRoutes);

// --- Buyer Routes ---
app.use("/api/buyer/users", authMiddleware, buyerUserRoutes);
app.use("/api/buyer/cart", authMiddleware, buyerCartRoutes);
app.use("/api/buyer/orders", authMiddleware, buyerOrderRoutes);
app.use("/api/buyer/products", buyerProductRoutes); // viewing products is public
app.use("/api/buyer/upload", buyerUploadRoutes);

// --- Seller Routes ---
app.use("/api/seller/users", authMiddleware, sellerUserRoutes);
app.use("/api/seller/products", authMiddleware, sellerProductRoutes);
app.use("/api/seller/orders", authMiddleware, sellerOrderRoutes);
app.use("/api/seller/upload", sellerUploadRoutes);

// --- Admin Routes ---
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);

// --- Example Check Endpoint ---
app.get("/api/check", (req: Request, res: Response) => {
  res.json({message: "Hello from backend using Express and TypeScript!"});
});

// Error handling middleware (must be after all routes)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({error: "Route not found"});
});

// --- Connect to MongoDB and Start Server ---
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
