import {Request, Response} from "express";
import Cart from "../../models/cart";
import Product from "../../models/product";

export const addToCart = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({error: "Unauthorized"});
  if (req.user.role !== "buyer") {
    return res
      .status(403)
      .json({error: "Forbidden: Access is allowed only for buyers"});
  }

  const buyerId = req.user.id;
  const {productId} = req.body;

  try {
    let cart = await Cart.findOne({buyer: buyerId});
    if (!cart) cart = await Cart.create({buyer: buyerId, products: []});

    if (!cart.products.includes(productId)) {
      cart.products.push(productId);
      await cart.save();

      await Product.findByIdAndUpdate(productId, {isInCart: true});
    }

    res.json(cart);
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
  const {productId} = req.params;

  try {
    const cart = await Cart.findOne({buyer: buyerId});
    if (!cart) return res.status(404).json({error: "Cart not found"});

    cart.products = cart.products.filter((p) => p.toString() !== productId);
    await cart.save();

    await Product.findByIdAndUpdate(productId, {isInCart: false});

    res.json(cart);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};
