import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product";
import Category from "../models/category";
import User from "../models/user";
import logger from "../utils/logger";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bilibay";

// Helper function to generate random image URLs using Picsum Photos API
const getRandomImages = (seed: number, count: number = 1): string[] => {
  // Using Picsum Photos API - seed ensures same image for same seed value
  // Different dimensions for variety
  const images: string[] = [];
  for (let i = 0; i < count; i++) {
    const width = 400 + (i * 50); // Vary width slightly
    const height = 400 + (i * 50); // Vary height slightly
    images.push(`https://picsum.photos/seed/bilibay-${seed}-${i}/${width}/${height}`);
  }
  return images;
};

// Category data
const categoriesData = [
  { name: "Beverages", slug: "beverages", description: "Drinks and beverages" },
  { name: "Food", slug: "food", description: "Food items and ingredients" },
  { name: "Clothing", slug: "clothing", description: "Apparel and fashion" },
  { name: "Electronics", slug: "electronics", description: "Electronic devices and gadgets" },
  { name: "Home & Living", slug: "home-living", description: "Home decor and living essentials" },
  { name: "Toys & Collectibles", slug: "toys-collectibles", description: "Toys and collectible items" },
  { name: "Beauty & Personal Care", slug: "beauty-personal-care", description: "Beauty and personal care products" },
  { name: "Sports & Outdoors", slug: "sports-outdoors", description: "Sports equipment and outdoor gear" },
  { name: "Books & Media", slug: "books-media", description: "Books, movies, and media" },
  { name: "Automotive", slug: "automotive", description: "Car accessories and automotive products" },
];

// Product data templates
const productTemplates = [
  {
    title: "Tanduay Rhum 500ml",
    description: "Premium Filipino rum, smooth taste, perfect for celebrations. Made from sugarcane, aged to perfection.",
    price: 350,
    stock: 50,
    categoryName: "Beverages",
    status: "available",
  },
  {
    title: "San Miguel Beer Pack",
    description: "24-pack San Miguel Pale Pilsen, classic Filipino beer. Perfect for parties and gatherings.",
    price: 1200,
    stock: 30,
    categoryName: "Beverages",
    status: "available",
  },
  {
    title: "Barong Tagalog",
    description: "Elegant traditional Filipino shirt, perfect for formal events. Handcrafted with premium fabric.",
    price: 1500,
    stock: 25,
    categoryName: "Clothing",
    status: "available",
  },
  {
    title: "Jeepney Model Toy",
    description: "Miniature handcrafted Jeepney toy, perfect for collectors. Detailed replica of iconic Filipino transport.",
    price: 450,
    stock: 40,
    categoryName: "Toys & Collectibles",
    status: "available",
  },
  {
    title: "Adobo Spice Mix",
    description: "Authentic Filipino Adobo spice mix for home cooking. Pre-mixed blend of traditional flavors.",
    price: 120,
    stock: 100,
    categoryName: "Food",
    status: "available",
  },
  {
    title: "Banig Handwoven Mat",
    description: "Traditional Filipino handwoven mat made from palm leaves. Eco-friendly and durable.",
    price: 600,
    stock: 35,
    categoryName: "Home & Living",
    status: "available",
  },
  {
    title: "Sinigang Mix Pack",
    description: "Classic Filipino sour soup mix. Includes tamarind and vegetables for authentic sinigang flavor.",
    price: 85,
    stock: 150,
    categoryName: "Food",
    status: "available",
  },
  {
    title: "Kape Barako",
    description: "Strong Filipino coffee beans from Batangas. Rich and aromatic, perfect for coffee lovers.",
    price: 280,
    stock: 60,
    categoryName: "Food",
    status: "available",
  },
  {
    title: "Filipiniana Dress",
    description: "Elegant traditional Filipiniana dress for special occasions. Available in various colors.",
    price: 2500,
    stock: 15,
    categoryName: "Clothing",
    status: "available",
  },
  {
    title: "Bamboo Speaker",
    description: "Eco-friendly Bluetooth speaker made from bamboo. Portable and sustainable design.",
    price: 1200,
    stock: 45,
    categoryName: "Electronics",
    status: "available",
  },
  {
    title: "Capiz Shell Lamp",
    description: "Beautiful handcrafted lamp made from Capiz shells. Creates warm, ambient lighting.",
    price: 800,
    stock: 20,
    categoryName: "Home & Living",
    status: "available",
  },
  {
    title: "Coconut Oil 500ml",
    description: "Pure virgin coconut oil, cold-pressed. Great for cooking and skincare.",
    price: 180,
    stock: 80,
    categoryName: "Food",
    status: "available",
  },
  {
    title: "Philippine Flag T-Shirt",
    description: "Comfortable cotton t-shirt featuring the Philippine flag design. 100% cotton.",
    price: 350,
    stock: 70,
    categoryName: "Clothing",
    status: "available",
  },
  {
    title: "Basketball Jersey",
    description: "Official-style basketball jersey. Lightweight and breathable fabric.",
    price: 650,
    stock: 40,
    categoryName: "Sports & Outdoors",
    status: "available",
  },
  {
    title: "Anahaw Fan",
    description: "Traditional handwoven fan made from Anahaw leaves. Perfect for hot weather.",
    price: 150,
    stock: 90,
    categoryName: "Home & Living",
    status: "available",
  },
  {
    title: "Bamboo Phone Case",
    description: "Eco-friendly phone case made from sustainable bamboo. Fits most smartphone models.",
    price: 450,
    stock: 55,
    categoryName: "Electronics",
    status: "available",
  },
  {
    title: "Tocino Pack",
    description: "Sweet cured pork, ready to cook. Traditional Filipino breakfast favorite.",
    price: 220,
    stock: 65,
    categoryName: "Food",
    status: "available",
  },
  {
    title: "Longganisa Pack",
    description: "Garlicky Filipino sausage, perfect for breakfast. Pack of 12 pieces.",
    price: 180,
    stock: 75,
    categoryName: "Food",
    status: "available",
  },
  {
    title: "Sampaguita Perfume",
    description: "Fragrance inspired by the national flower of the Philippines. Fresh and floral scent.",
    price: 320,
    stock: 50,
    categoryName: "Beauty & Personal Care",
    status: "available",
  },
  {
    title: "Calamansi Soap",
    description: "Natural soap made with calamansi extract. Refreshing and good for the skin.",
    price: 95,
    stock: 120,
    categoryName: "Beauty & Personal Care",
    status: "available",
  },
  {
    title: "Philippine History Book",
    description: "Comprehensive guide to Philippine history. Perfect for students and history enthusiasts.",
    price: 450,
    stock: 30,
    categoryName: "Books & Media",
    status: "available",
  },
  {
    title: "Carabao Horn Keychain",
    description: "Unique keychain made from carabao horn. Handcrafted and durable.",
    price: 120,
    stock: 100,
    categoryName: "Toys & Collectibles",
    status: "available",
  },
  {
    title: "Bamboo Bike Basket",
    description: "Stylish bike basket made from bamboo. Eco-friendly and lightweight.",
    price: 380,
    stock: 35,
    categoryName: "Sports & Outdoors",
    status: "available",
  },
  {
    title: "Coconut Shell Bowl Set",
    description: "Set of 4 bowls made from coconut shells. Natural and sustainable.",
    price: 280,
    stock: 45,
    categoryName: "Home & Living",
    status: "available",
  },
  {
    title: "Tsinelas (Flip Flops)",
    description: "Comfortable rubber flip flops. Classic Filipino footwear, durable and affordable.",
    price: 150,
    stock: 200,
    categoryName: "Clothing",
    status: "available",
  },
  {
    title: "Mango Float Kit",
    description: "Everything you need to make delicious mango float. Includes ingredients and recipe.",
    price: 350,
    stock: 40,
    categoryName: "Food",
    status: "available",
  },
  {
    title: "Bamboo Sunglasses",
    description: "Stylish sunglasses with bamboo frames. UV protection and eco-friendly.",
    price: 550,
    stock: 30,
    categoryName: "Beauty & Personal Care",
    status: "available",
  },
  {
    title: "Philippine Map Poster",
    description: "Beautiful wall poster featuring the Philippine map. Educational and decorative.",
    price: 200,
    stock: 60,
    categoryName: "Home & Living",
    status: "available",
  },
  {
    title: "Bamboo Watch",
    description: "Eco-friendly watch with bamboo case and leather strap. Water-resistant.",
    price: 1200,
    stock: 25,
    categoryName: "Electronics",
    status: "available",
  },
  {
    title: "Taho Starter Kit",
    description: "Make your own taho at home! Includes soybeans, sago, and brown sugar syrup.",
    price: 180,
    stock: 50,
    categoryName: "Food",
    status: "available",
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info("Connected to MongoDB");

    // Create or get categories
    logger.info("Creating categories...");
    const categoryMap = new Map<string, mongoose.Types.ObjectId>();
    
    for (const catData of categoriesData) {
      let category = await Category.findOne({ slug: catData.slug });
      if (!category) {
        category = await Category.create(catData);
        logger.info(`Created category: ${catData.name}`);
      } else {
        logger.info(`Category already exists: ${catData.name}`);
      }
      categoryMap.set(catData.name, category._id);
    }

    // Get or create seller users
    logger.info("Finding seller users...");
    let sellers = await User.find({ role: "seller" }).limit(10);
    
    if (sellers.length === 0) {
      logger.warn("No seller users found. Creating test sellers...");
      // Create a few test sellers
      const testSellers = [];
      for (let i = 1; i <= 5; i++) {
        const seller = await User.create({
          firstName: `Seller${i}`,
          lastName: `Test${i}`,
          email: `seller${i}@test.com`,
          password: "$2a$10$rOzJqJqJqJqJqJqJqJqJqO", // dummy hash
          role: "seller",
          isActive: true,
          emailVerified: true,
        });
        testSellers.push(seller);
      }
      sellers = testSellers;
      logger.info(`Created ${testSellers.length} test sellers`);
    }

    if (sellers.length === 0) {
      throw new Error("No sellers available. Please create at least one seller user.");
    }

    // Clear existing products
    await Product.deleteMany({});
    logger.info("Cleared existing products");

    // Create products
    logger.info("Creating products...");
    const productsToInsert = productTemplates.map((template, index) => {
      const sellerIndex = index % sellers.length;
      const categoryId = categoryMap.get(template.categoryName);
      
      return {
        title: template.title,
        description: template.description,
        price: template.price,
        category: categoryId,
        stock: template.stock,
        images: getRandomImages(index + 1000, Math.floor(Math.random() * 3) + 1), // 1-3 random images per product
        status: template.status,
        seller: sellers[sellerIndex]._id,
        views: Math.floor(Math.random() * 1000), // Random views for variety
      };
    });

    await Product.insertMany(productsToInsert);
    logger.info(`Successfully seeded ${productsToInsert.length} products`);

    process.exit(0);
  } catch (err: any) {
    logger.error("Seeding error:", {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
};

seedProducts();
