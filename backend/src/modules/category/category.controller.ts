import { Request, Response } from "express";
import mongoose from "mongoose";
import Joi from "joi";
import { CategoryModel } from "./category.model";
import { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from "./category.types";

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

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: SUV
 *               description:
 *                 type: string
 *                 example: Sport Utility Vehicles
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Validation error
 */
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

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *       500:
 *         description: Server error
 */
export async function getCategories(_req: Request, res: Response) {
  try {
    const categories = await CategoryModel.find().lean();
    res.json(categories.map(mapCategory));
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category found
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Category not found
 */
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

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: Category not found
 */
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

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Category not found
 */
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
