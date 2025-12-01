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

// Middleware
import {authMiddleware} from "./middlewares/auth.middleware";

// DB Connection
import {connectDB} from "./config/database.config";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// --- Public Routes ---
app.use("/api/auth", authRoutes);

// --- Buyer Routes ---
app.use("/api/buyer/users", authMiddleware, buyerUserRoutes);
app.use("/api/buyer/cart", authMiddleware, buyerCartRoutes);
app.use("/api/buyer/orders", authMiddleware, buyerOrderRoutes);
app.use("/api/buyer/products", buyerProductRoutes); // viewing products is public

// --- Seller Routes ---
app.use("/api/seller/users", authMiddleware, sellerUserRoutes);
app.use("/api/seller/products", authMiddleware, sellerProductRoutes);
app.use("/api/seller/orders", authMiddleware, sellerOrderRoutes);

// --- Example Check Endpoint ---
app.get("/api/check", (req: Request, res: Response) => {
  res.json({message: "Hello from backend using Express and TypeScript!"});
});

// --- Connect to MongoDB and Start Server ---
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
