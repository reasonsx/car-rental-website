// models/categoryModel.ts
import { Schema, model } from "mongoose";
import { Category } from "../interfaces/category";

const categorySchema = new Schema<Category>({
  name: { type: String, required: true },
  description: { type: String },
});

export const CategoryModel = model<Category>("Category", categorySchema);
