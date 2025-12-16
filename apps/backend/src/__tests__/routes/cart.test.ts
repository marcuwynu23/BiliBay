import request from "supertest";
import app from "../app";
import User from "../../models/user";
import Product from "../../models/product";
import Cart from "../../models/cart";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "SECRET_KEY";

describe("Cart Routes", () => {
  let buyerToken: string;
  let buyerId: string;
  let sellerId: mongoose.Types.ObjectId;
  let productId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    // Create buyer user
    const hashedPassword = await bcrypt.hash("password123", 10);
    const buyer = await User.create({
      name: "Test Buyer",
      email: "buyer@example.com",
      password: hashedPassword,
      role: "buyer",
      isActive: true,
    });
    buyerId = buyer._id.toString();
    buyerToken = jwt.sign({id: buyerId, role: "buyer"}, JWT_SECRET);

    // Create seller user
    const seller = await User.create({
      name: "Test Seller",
      email: "seller@example.com",
      password: hashedPassword,
      role: "seller",
      isActive: true,
    });
    sellerId = seller._id;

    // Create product
    const product = await Product.create({
      title: "Test Product",
      description: "Test Description",
      price: 100,
      stock: 10,
      seller: sellerId,
      status: "available",
    });
    productId = product._id;
  });

  beforeEach(async () => {
    await Cart.deleteMany({});
  });

  describe("GET /api/buyer/cart", () => {
    it("should get empty cart for new user", async () => {
      const response = await request(app)
        .get("/api/buyer/cart")
        .set("Authorization", `Bearer ${buyerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.items).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/buyer/cart");

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/buyer/cart", () => {
    it("should add product to cart", async () => {
      const response = await request(app)
        .post("/api/buyer/cart")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          productId: productId.toString(),
          quantity: 2,
        });

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].quantity).toBe(2);
      expect(response.body.total).toBe(200);
    });

    it("should update quantity if product already in cart", async () => {
      // Add product first time
      await request(app)
        .post("/api/buyer/cart")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          productId: productId.toString(),
          quantity: 2,
        });

      // Add same product again
      const response = await request(app)
        .post("/api/buyer/cart")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          productId: productId.toString(),
          quantity: 3,
        });

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].quantity).toBe(5);
      expect(response.body.total).toBe(500);
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post("/api/buyer/cart")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          productId: fakeId.toString(),
          quantity: 1,
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Product not found");
    });

    it("should return 400 for insufficient stock", async () => {
      const response = await request(app)
        .post("/api/buyer/cart")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          productId: productId.toString(),
          quantity: 100, // More than available stock
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Insufficient stock");
    });
  });

  describe("PUT /api/buyer/cart/:itemId", () => {
    it("should update cart item quantity", async () => {
      // Add product to cart first
      const addResponse = await request(app)
        .post("/api/buyer/cart")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          productId: productId.toString(),
          quantity: 2,
        });

      const itemId = addResponse.body.items[0]._id;

      // Update quantity
      const response = await request(app)
        .put(`/api/buyer/cart/${itemId}`)
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          quantity: 5,
        });

      expect(response.status).toBe(200);
      expect(response.body.items[0].quantity).toBe(5);
      expect(response.body.total).toBe(500);
    });

    it("should return 404 for non-existent item", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/buyer/cart/${fakeId}`)
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          quantity: 5,
        });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/buyer/cart/:itemId", () => {
    it("should remove item from cart", async () => {
      // Add product to cart first
      const addResponse = await request(app)
        .post("/api/buyer/cart")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          productId: productId.toString(),
          quantity: 2,
        });

      const itemId = addResponse.body.items[0]._id;

      // Remove item
      const response = await request(app)
        .delete(`/api/buyer/cart/${itemId}`)
        .set("Authorization", `Bearer ${buyerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });
  });
});

