import Product from "../../models/product";
import User from "../../models/user";
import mongoose from "mongoose";

describe("Product Model", () => {
  let sellerId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    const seller = await User.create({
      name: "Test Seller",
      email: "seller@example.com",
      password: "password123",
      role: "seller",
    });
    sellerId = seller._id;
  });

  it("should create a new product", async () => {
    const productData = {
      title: "Test Product",
      description: "Test Description",
      price: 100,
      stock: 10,
      seller: sellerId,
      status: "available",
    };

    const product = await Product.create(productData);

    expect(product).toBeDefined();
    expect(product.title).toBe(productData.title);
    expect(product.price).toBe(productData.price);
    expect(product.stock).toBe(productData.stock);
    expect(product.status).toBe("available");
    expect(product.views).toBe(0);
  });

  it("should require title, price, stock, and seller", async () => {
    const productData = {
      title: "Test Product",
      // Missing required fields
    };

    await expect(Product.create(productData)).rejects.toThrow();
  });

  it("should default status to available", async () => {
    const productData = {
      title: "Test Product",
      price: 100,
      stock: 10,
      seller: sellerId,
    };

    const product = await Product.create(productData);
    expect(product.status).toBe("available");
  });

  it("should accept valid status values", async () => {
    const statuses = ["available", "sold", "draft"] as const;

    for (const status of statuses) {
      const productData = {
        title: `Test Product ${status}`,
        price: 100,
        stock: 10,
        seller: sellerId,
        status,
      };

      const product = await Product.create(productData);
      expect(product.status).toBe(status);
    }
  });

  it("should store images array", async () => {
    const productData = {
      title: "Test Product",
      price: 100,
      stock: 10,
      seller: sellerId,
      images: ["image1.jpg", "image2.jpg"],
    };

    const product = await Product.create(productData);
    expect(product.images).toHaveLength(2);
    expect(product.images[0]).toBe("image1.jpg");
  });

  it("should allow optional category", async () => {
    const productData = {
      title: "Test Product",
      price: 100,
      stock: 10,
      seller: sellerId,
    };

    const product = await Product.create(productData);
    expect(product.category).toBeUndefined();
  });
});

