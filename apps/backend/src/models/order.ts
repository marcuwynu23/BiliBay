// models/Order.ts
import mongoose, {Schema, Document, Types} from "mongoose";

export interface IOrder extends Document {
  buyer: Types.ObjectId;
  seller: Types.ObjectId;
  products: Types.ObjectId[];
  totalAmount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    buyer: {type: Schema.Types.ObjectId, ref: "User", required: true},
    seller: {type: Schema.Types.ObjectId, ref: "User", required: true},
    products: [{type: Schema.Types.ObjectId, ref: "Product", required: true}],
    totalAmount: {type: Number, required: true},
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  {timestamps: true}
);

export default mongoose.model<IOrder>("Order", OrderSchema);
