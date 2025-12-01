import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product";

dotenv.config();

const products = [
  {
    title: "Tanduay Rhum 500ml",
    description:
      "Premium Filipino rum, smooth taste, perfect for celebrations.",
    price: 350,
    category: "Beverages",
    status: "available",
    isInCart: false,
    seller: new mongoose.Types.ObjectId("64a1f7e2d2b3e5f1c8a7d101"),
  },
  {
    title: "San Miguel Beer Pack",
    description: "24-pack San Miguel Pale Pilsen, classic Filipino beer.",
    price: 1200,
    category: "Beverages",
    status: "available",
    isInCart: false,
    seller: new mongoose.Types.ObjectId("64a1f7e2d2b3e5f1c8a7d102"),
  },
  {
    title: "Barong Tagalog",
    description:
      "Elegant traditional Filipino shirt, perfect for formal events.",
    price: 1500,
    category: "Clothing",
    status: "available",
    isInCart: false,
    seller: new mongoose.Types.ObjectId("64a1f7e2d2b3e5f1c8a7d103"),
  },
  {
    title: "Jeepney Model Toy",
    description: "Miniature handcrafted Jeepney toy, perfect for collectors.",
    price: 450,
    category: "Toys & Collectibles",
    status: "available",
    isInCart: false,
    seller: new mongoose.Types.ObjectId("64a1f7e2d2b3e5f1c8a7d104"),
  },
  {
    title: "Adobo Spice Mix",
    description: "Authentic Filipino Adobo spice mix for home cooking.",
    price: 120,
    category: "Food",
    status: "available",
    isInCart: false,
    seller: new mongoose.Types.ObjectId("64a1f7e2d2b3e5f1c8a7d105"),
  },
  {
    title: "Banig Handwoven Mat",
    description: "Traditional Filipino handwoven mat made from palm leaves.",
    price: 600,
    category: "Home & Living",
    status: "available",
    isInCart: false,
    seller: new mongoose.Types.ObjectId("64a1f7e2d2b3e5f1c8a7d106"),
  },
];

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bilibay";

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Optional: Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert new products
    await Product.insertMany(products);
    console.log("Seeded products successfully");

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedProducts();
