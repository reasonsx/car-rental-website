import { Request, Response } from "express";
import { CategoryModel } from "../models/categoryModel";

/**
 * Create a new category
 * @route POST /api/categories
 */
export async function createCategory(req: Request, res: Response) {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = new CategoryModel({
      name,
      description,
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create category",
      error: error.message,
    });
  }
}

/**
 * Get all categories
 * @route GET /api/categories
 */
export async function getCategories(_req: Request, res: Response) {
  try {
    const categories = await CategoryModel.find().lean();
    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
}

/**
 * Get category by ID
 * @route GET /api/categories/:id
 */
export async function getCategoryById(req: Request, res: Response) {
  try {
    const category = await CategoryModel.findById(req.params.id).lean();

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch category",
      error: error.message,
    });
  }
}

/**
 * Update category by ID
 * @route PUT /api/categories/:id
 */
export async function updateCategory(req: Request, res: Response) {
  try {
    const updatedCategory = await CategoryModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(updatedCategory);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update category",
      error: error.message,
    });
  }
}

/**
 * Delete category by ID
 * @route DELETE /api/categories/:id
 */
export async function deleteCategory(req: Request, res: Response) {
  try {
    const deletedCategory = await CategoryModel.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete category",
      error: error.message,
    });
  }
}
