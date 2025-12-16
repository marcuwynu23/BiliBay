// models/Cart.ts
import mongoose, {Schema, Document, Types} from "mongoose";

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  variant?: {
    name: string;
    value: string;
  };
}

export interface ICart extends Document {
  buyer: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema(
  {
    product: {type: Schema.Types.ObjectId, ref: "Product", required: true},
    quantity: {type: Number, required: true, min: 1, default: 1},
    variant: {
      name: String,
      value: String,
    },
  },
  {_id: true} // Enable _id for cart items so we can reference them
);

const CartSchema: Schema = new Schema(
  {
    buyer: {type: Schema.Types.ObjectId, ref: "User", required: true, unique: true},
    items: [CartItemSchema],
  },
  {timestamps: true}
);

export default mongoose.model<ICart>("Cart", CartSchema);

