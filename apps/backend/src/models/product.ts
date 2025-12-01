// models/Product.ts
import mongoose, {Schema, Document, Types} from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  status: "available" | "sold" | "draft";
  isInCart: boolean;
  seller: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    title: {type: String, required: true},
    description: {type: String},
    price: {type: Number, required: true},
    category: {type: String},
    status: {
      type: String,
      enum: ["available", "sold", "draft"],
      default: "available",
    },
    isInCart: {type: Boolean, default: false},
    seller: {type: Schema.Types.ObjectId, ref: "User", required: true},
  },
  {timestamps: true}
);

export default mongoose.model<IProduct>("Product", ProductSchema);
