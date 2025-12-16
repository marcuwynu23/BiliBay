// models/Category.ts
import mongoose, {Schema, Document} from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: {type: String, required: true, unique: true},
    slug: {type: String, required: true, unique: true, lowercase: true},
    description: {type: String},
  },
  {timestamps: true}
);

export default mongoose.model<ICategory>("Category", CategorySchema);

