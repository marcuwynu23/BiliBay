// models/Payment.ts
import mongoose, {Schema, Document, Types} from "mongoose";

export interface IPayment extends Document {
  order: Types.ObjectId;
  amount: number;
  method: "cod" | "bank_transfer";
  status: "pending" | "paid" | "failed";
  reference?: string; // Bank transfer reference or receipt
  receiptImage?: string; // Uploaded receipt image URL
  verifiedBy?: Types.ObjectId; // Admin who verified
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    order: {type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true},
    amount: {type: Number, required: true, min: 0},
    method: {
      type: String,
      enum: ["cod", "bank_transfer"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    reference: {type: String},
    receiptImage: {type: String},
    verifiedBy: {type: Schema.Types.ObjectId, ref: "User"},
    verifiedAt: {type: Date},
  },
  {timestamps: true}
);

export default mongoose.model<IPayment>("Payment", PaymentSchema);

