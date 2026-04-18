import { Request, Response } from "express";
import mongoose from "mongoose";
import Joi from "joi";
import { CategoryModel } from "../models/categoryModel";
import {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/category.types";

// validation
const createSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow("").optional(),
});

const updateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().allow("").optional(),
});

// mapper
const mapCategory = (c: any): CategoryResponse => ({
  id: c._id.toString(),
  name: c.name,
  description: c.description,
});

// CREATE
export async function createCategory(req: Request<{}, {}, CreateCategoryRequest>, res: Response) {
  try {
    const { error } = createSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const category = await CategoryModel.create(req.body);

    res.status(201).json(mapCategory(category));
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET ALL
export async function getCategories(_req: Request, res: Response) {
  try {
    const categories = await CategoryModel.find().lean();
    res.json(categories.map(mapCategory));
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET ONE
export async function getCategoryById(req: Request<{ id: string }>, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const category = await CategoryModel.findById(id).lean();

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(mapCategory(category));
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}

// UPDATE
export async function updateCategory(
  req: Request<{ id: string }, {}, UpdateCategoryRequest>,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const { error } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const updated = await CategoryModel.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
      runValidators: true,
    }).lean();

    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(mapCategory(updated));
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}

// DELETE
export async function deleteCategory(req: Request<{ id: string }>, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const deleted = await CategoryModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}
