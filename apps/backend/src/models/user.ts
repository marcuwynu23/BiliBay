// models/User.ts
import mongoose, {Schema, Document} from "mongoose";

export interface IShippingAddress {
  street: string;
  city: string;
  province: string;
  zipCode: string;
  country: string;
}

export interface IUser extends Document {
  firstName: string;
  middleName?: string;
  lastName: string;
  birthday?: Date;
  email: string;
  password: string;
  phone?: string;
  role: "buyer" | "seller" | "admin";
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  defaultShippingAddress?: IShippingAddress;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

const UserSchema: Schema = new Schema(
  {
    firstName: {type: String, required: true},
    middleName: {type: String},
    lastName: {type: String, required: true},
    birthday: {type: Date},
    email: {type: String, required: true, unique: true, lowercase: true},
    password: {type: String, required: true},
    phone: {type: String},
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    emailVerified: {type: Boolean, default: false},
    emailVerificationToken: {type: String},
    passwordResetToken: {type: String},
    passwordResetExpires: {type: Date},
    defaultShippingAddress: {type: ShippingAddressSchema},
    isActive: {type: Boolean, default: true},
  },
  {timestamps: true}
);

export default mongoose.model<IUser>("User", UserSchema);
