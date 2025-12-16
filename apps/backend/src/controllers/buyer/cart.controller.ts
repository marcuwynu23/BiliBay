import {Request, Response} from "express";
import Cart from "../../models/cart";
import Product from "../../models/product";
import mongoose from "mongoose";

export const getCart = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({error: "Unauthorized"});
  if (req.user.role !== "buyer") {
    return res
      .status(403)
      .json({error: "Forbidden: Access is allowed only for buyers"});
  }

  const buyerId = req.user.id;

  try {
    let cart = await Cart.findOne({buyer: buyerId}).populate("items.product");
    if (!cart) {
      cart = await Cart.create({buyer: buyerId, items: []});
      return res.json({items: [], total: 0});
    }

    // Calculate total
    let total = 0;
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (product) {
        total += product.price * item.quantity;
      }
    }

    res.json({items: cart.items, total});
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const addToCart = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({error: "Unauthorized"});
  if (req.user.role !== "buyer") {
    return res
      .status(403)
      .json({error: "Forbidden: Access is allowed only for buyers"});
  }

  const buyerId = req.user.id;
  const {productId, quantity = 1, variant} = req.body;

  try {
    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({error: "Product not found"});
    }

    if (product.status !== "available") {
      return res.status(400).json({error: "Product is not available"});
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({error: "Insufficient stock"});
    }

    let cart = await Cart.findOne({buyer: buyerId});
    if (!cart) {
      cart = await Cart.create({buyer: buyerId, items: []});
    }

    // Check if product already in cart (with same variant)
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        (!variant ||
          (item.variant?.name === variant.name &&
            item.variant?.value === variant.value))
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({error: "Insufficient stock"});
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: new mongoose.Types.ObjectId(productId),
        quantity,
        variant: variant ? {name: variant.name, value: variant.value} : undefined,
      });
    }

    await cart.save();
    await cart.populate("items.product");

    // Calculate total
    let total = 0;
    for (const item of cart.items) {
      const prod = await Product.findById(item.product);
      if (prod) {
        total += prod.price * item.quantity;
      }
    }

    res.json({items: cart.items, total});
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({error: "Unauthorized"});
  if (req.user.role !== "buyer") {
    return res
      .status(403)
      .json({error: "Forbidden: Access is allowed only for buyers"});
  }

  const buyerId = req.user.id;
  const {itemId} = req.params;
  const {quantity} = req.body;

  try {
    if (quantity < 1) {
      return res.status(400).json({error: "Quantity must be at least 1"});
    }

    const cart = await Cart.findOne({buyer: buyerId});
    if (!cart) return res.status(404).json({error: "Cart not found"});

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({error: "Cart item not found"});

    // Check stock
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({error: "Product not found"});
    }

    if (product.stock < quantity) {
      return res.status(400).json({error: "Insufficient stock"});
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product");

    // Calculate total
    let total = 0;
    for (const cartItem of cart.items) {
      const prod = await Product.findById(cartItem.product);
      if (prod) {
        total += prod.price * cartItem.quantity;
      }
    }

    res.json({items: cart.items, total});
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({error: "Unauthorized"});
  if (req.user.role !== "buyer") {
    return res
      .status(403)
      .json({error: "Forbidden: Access is allowed only for buyers"});
  }
  const buyerId = req.user.id;
  const {itemId} = req.params;

  try {
    const cart = await Cart.findOne({buyer: buyerId});
    if (!cart) return res.status(404).json({error: "Cart not found"});

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== itemId
    ) as any;
    await cart.save();
    await cart.populate("items.product");

    // Calculate total
    let total = 0;
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (product) {
        total += product.price * item.quantity;
      }
    }

    res.json({items: cart.items, total});
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};
