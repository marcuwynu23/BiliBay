// models/Product.ts
import mongoose, {Schema, Document, Types} from "mongoose";

export interface IProductVariant {
  name: string; // e.g., "Size", "Color"
  value: string; // e.g., "Large", "Red"
  priceModifier?: number; // Additional price for this variant
}

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  category?: Types.ObjectId;
  images: string[];
  stock: number;
  variants?: IProductVariant[];
  specifications?: Record<string, string>; // Key-value pairs for specs
  status: "available" | "sold" | "draft";
  seller: Types.ObjectId;
  views: number; // For popularity tracking
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema(
  {
    name: {type: String, required: true},
    value: {type: String, required: true},
    priceModifier: {type: Number, default: 0},
  },
  {_id: false}
);

const ProductSchema: Schema = new Schema(
  {
    title: {type: String, required: true},
    description: {type: String},
    price: {type: Number, required: true, min: 0},
    category: {type: Schema.Types.ObjectId, ref: "Category", required: false},
    images: [{type: String}],
    stock: {type: Number, required: true, default: 0, min: 0},
    variants: [ProductVariantSchema],
    specifications: {type: Map, of: String},
    status: {
      type: String,
      enum: ["available", "sold", "draft"],
      default: "available",
    },
    seller: {type: Schema.Types.ObjectId, ref: "User", required: true},
    views: {type: Number, default: 0},
  },
  {timestamps: true}
);

// Index for search
ProductSchema.index({title: "text", description: "text"});
ProductSchema.index({category: 1});
ProductSchema.index({price: 1});
ProductSchema.index({status: 1});

export default mongoose.model<IProduct>("Product", ProductSchema);

