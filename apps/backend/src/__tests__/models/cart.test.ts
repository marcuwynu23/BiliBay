import Cart from "../../models/cart";
import User from "../../models/user";
import Product from "../../models/product";
import mongoose from "mongoose";

describe("Cart Model", () => {
  let buyerId: mongoose.Types.ObjectId;
  let sellerId: mongoose.Types.ObjectId;
  let productId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    const buyer = await User.create({
      name: "Test Buyer",
      email: "buyer@example.com",
      password: "password123",
      role: "buyer",
    });
    buyerId = buyer._id;

    const seller = await User.create({
      name: "Test Seller",
      email: "seller@example.com",
      password: "password123",
      role: "seller",
    });
    sellerId = seller._id;

    const product = await Product.create({
      title: "Test Product",
      price: 100,
      stock: 10,
      seller: sellerId,
      status: "available",
    });
    productId = product._id;
  });

  it("should create a new cart", async () => {
    const cart = await Cart.create({
      buyer: buyerId,
      items: [],
    });

    expect(cart).toBeDefined();
    expect(cart.buyer.toString()).toBe(buyerId.toString());
    expect(cart.items).toHaveLength(0);
  });

  it("should add items to cart", async () => {
    const cart = await Cart.create({
      buyer: buyerId,
      items: [
        {
          product: productId,
          quantity: 2,
        },
      ],
    });

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.items[0].product.toString()).toBe(productId.toString());
  });

  it("should require buyer", async () => {
    const cartData = {
      items: [],
    };

    await expect(Cart.create(cartData)).rejects.toThrow();
  });

  it("should enforce unique buyer", async () => {
    await Cart.create({
      buyer: buyerId,
      items: [],
    });

    await expect(
      Cart.create({
        buyer: buyerId,
        items: [],
      })
    ).rejects.toThrow();
  });

  it("should store variant information", async () => {
    const cart = await Cart.create({
      buyer: buyerId,
      items: [
        {
          product: productId,
          quantity: 1,
          variant: {
            name: "Size",
            value: "Large",
          },
        },
      ],
    });

    expect(cart.items[0].variant).toBeDefined();
    expect(cart.items[0].variant?.name).toBe("Size");
    expect(cart.items[0].variant?.value).toBe("Large");
  });
});

