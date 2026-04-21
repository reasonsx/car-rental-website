import { Schema, model } from "mongoose";
import { Category } from "./category.types";

const categorySchema = new Schema<Category>({
  name: { type: String, required: true },
  description: { type: String, default: "" },
});

export const CategoryModel = model<Category>("Category", categorySchema);
