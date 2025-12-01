// models/Cart.ts
import mongoose, {Schema, Document, Types} from "mongoose";

export interface ICart extends Document {
  buyer: Types.ObjectId;
  products: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema: Schema = new Schema(
  {
    buyer: {type: Schema.Types.ObjectId, ref: "User", required: true},
    products: [{type: Schema.Types.ObjectId, ref: "Product"}],
  },
  {timestamps: true}
);

export default mongoose.model<ICart>("Cart", CartSchema);
