// models/Order.ts
import mongoose, {Schema, Document, Types} from "mongoose";
import {IShippingAddress} from "./user";

export interface IOrderItem {
  product: Types.ObjectId;
  quantity: number;
  price: number; // Price at time of order
  variant?: {
    name: string;
    value: string;
  };
}

export interface IOrder extends Document {
  orderNumber: string; // Unique order number
  buyer: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: "cod" | "bank_transfer";
  paymentStatus: "pending" | "paid" | "failed";
  paymentReference?: string; // For bank transfer
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  cancelledAt?: Date;
  cancelledReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema(
  {
    product: {type: Schema.Types.ObjectId, ref: "Product", required: true},
    quantity: {type: Number, required: true, min: 1},
    price: {type: Number, required: true, min: 0},
    variant: {
      name: String,
      value: String,
    },
  },
  {_id: false}
);

const ShippingAddressSchema = new Schema(
  {
    street: {type: String, required: true},
    city: {type: String, required: true},
    province: {type: String, required: true},
    zipCode: {type: String, required: true},
    country: {type: String, default: "Philippines"},
  },
  {_id: false}
);

const OrderSchema: Schema = new Schema(
  {
    orderNumber: {type: String, required: true, unique: true},
    buyer: {type: Schema.Types.ObjectId, ref: "User", required: true},
    items: [OrderItemSchema],
    shippingAddress: {type: ShippingAddressSchema, required: true},
    subtotal: {type: Number, required: true, min: 0},
    shippingFee: {type: Number, required: true, default: 0, min: 0},
    totalAmount: {type: Number, required: true, min: 0},
    paymentMethod: {
      type: String,
      enum: ["cod", "bank_transfer"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentReference: {type: String},
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingNumber: {type: String},
    cancelledAt: {type: Date},
    cancelledReason: {type: String},
  },
  {timestamps: true}
);

// Index for efficient queries
OrderSchema.index({buyer: 1, createdAt: -1});
OrderSchema.index({orderNumber: 1});
OrderSchema.index({status: 1});
OrderSchema.index({"items.product": 1}); // For seller queries

export default mongoose.model<IOrder>("Order", OrderSchema);

