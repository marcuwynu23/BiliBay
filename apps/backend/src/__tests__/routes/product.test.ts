import request from "supertest";
import app from "../app";
import User from "../../models/user";
import Product from "../../models/product";
import Category from "../../models/category";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

describe("Product Routes", () => {
  let sellerId: mongoose.Types.ObjectId;
  let categoryId: mongoose.Types.ObjectId;
  let productId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    // Create seller
    const hashedPassword = await bcrypt.hash("password123", 10);
    const seller = await User.create({
      name: "Test Seller",
      email: "seller@example.com",
      password: hashedPassword,
      role: "seller",
      isActive: true,
    });
    sellerId = seller._id;

    // Create category
    const category = await Category.create({
      name: "Test Category",
      slug: "test-category",
    });
    categoryId = category._id;

    // Create product
    const product = await Product.create({
      title: "Test Product",
      description: "Test Description",
      price: 100,
      stock: 10,
      seller: sellerId,
      category: categoryId,
      status: "available",
    });
    productId = product._id;
  });

  describe("GET /api/buyer/products", () => {
    it("should get all products", async () => {
      const response = await request(app).get("/api/buyer/products");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("products");
      expect(response.body).toHaveProperty("pagination");
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    it("should filter products by category", async () => {
      const response = await request(app)
        .get("/api/buyer/products")
        .query({category: categoryId.toString()});

      expect(response.status).toBe(200);
      expect(response.body.products.length).toBeGreaterThan(0);
    });

    it("should search products", async () => {
      const response = await request(app)
        .get("/api/buyer/products")
        .query({search: "Test"});

      expect(response.status).toBe(200);
      expect(response.body.products.length).toBeGreaterThan(0);
    });

    it("should filter by price range", async () => {
      const response = await request(app)
        .get("/api/buyer/products")
        .query({minPrice: 50, maxPrice: 150});

      expect(response.status).toBe(200);
      response.body.products.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(50);
        expect(product.price).toBeLessThanOrEqual(150);
      });
    });

    it("should filter in stock products", async () => {
      const response = await request(app)
        .get("/api/buyer/products")
        .query({inStock: "true"});

      expect(response.status).toBe(200);
      response.body.products.forEach((product: any) => {
        expect(product.stock).toBeGreaterThan(0);
      });
    });

    it("should sort products", async () => {
      const sortOptions = ["newest", "price_low", "price_high", "popularity"];

      for (const sortBy of sortOptions) {
        const response = await request(app)
          .get("/api/buyer/products")
          .query({sortBy});

        expect(response.status).toBe(200);
        expect(response.body.products).toBeDefined();
      }
    });
  });

  describe("GET /api/buyer/products/:id", () => {
    it("should get product by id", async () => {
      const response = await request(app).get(
        `/api/buyer/products/${productId}`
      );

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(productId.toString());
      expect(response.body.title).toBe("Test Product");
    });

    it("should return 400 for invalid id format", async () => {
      const response = await request(app).get("/api/buyer/products/invalid-id");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid product ID");
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(
        `/api/buyer/products/${fakeId}`
      );

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Product not found");
    });

    it("should increment view count", async () => {
      const initialViews = (await Product.findById(productId))?.views || 0;

      await request(app).get(`/api/buyer/products/${productId}`);

      const product = await Product.findById(productId);
      expect(product?.views).toBe(initialViews + 1);
    });
  });

  describe("GET /api/buyer/products/categories", () => {
    it("should get all categories", async () => {
      const response = await request(app).get(
        "/api/buyer/products/categories"
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});

