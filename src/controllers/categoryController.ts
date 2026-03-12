import { Request, Response } from 'express';
import { CategoryModel } from '../models/categoryModel';
import { connect, disconnect } from '../repository/database';
import '../models/categoryModel'; // ensure model is registered

/**
 * Create category
 */
export async function createCategory(req: Request, res: Response) {
  try {
    await connect();

    const category = new CategoryModel({
      name: req.body.name,
      description: req.body.description
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);

  } catch (error) {
    res.status(500).json({ message: "Failed to create category: " + error });
  } finally {
    await disconnect();
  }
}

/**
 * Get all categories
 */
export async function getCategories(req: Request, res: Response) {
  try {
    await connect();

    const categories = await CategoryModel.find();
    res.status(200).json(categories);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories: " + error });
  } finally {
    await disconnect();
  }
}

/**
 * Get category by ID
 */
export async function getCategoryById(req: Request, res: Response) {
  try {
    await connect();

    const category = await CategoryModel.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    res.status(200).json(category);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch category: " + error });
  } finally {
    await disconnect();
  }
}

/**
 * Update category
 */
export async function updateCategory(req: Request, res: Response) {
  try {
    await connect();

    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedCategory) return res.status(404).json({ message: "Category not found" });

    res.status(200).json(updatedCategory);

  } catch (error) {
    res.status(500).json({ message: "Failed to update category: " + error });
  } finally {
    await disconnect();
  }
}

/**
 * Delete category
 */
export async function deleteCategory(req: Request, res: Response) {
  try {
    await connect();

    const deletedCategory = await CategoryModel.findByIdAndDelete(req.params.id);
    if (!deletedCategory) return res.status(404).json({ message: "Category not found" });

    res.status(200).json({ message: "Category deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Failed to delete category: " + error });
  } finally {
    await disconnect();
  }
}