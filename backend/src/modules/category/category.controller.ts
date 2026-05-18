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
 *     summary: Create category
 *     description: Creates a new car category. Usually used by administrators.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing or invalid token
 *       500:
 *         description: Internal server error
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
 *     description: Returns all available car categories.
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error
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
 *     description: Returns a single category by MongoDB ObjectId.
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: string
 *         example: 65f1c2a9b7f4a8d123456789
 *     responses:
 *       200:
 *         description: Category found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
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
 *     summary: Update category
 *     description: Updates an existing category by ID.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: string
 *         example: 65f1c2a9b7f4a8d123456789
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryUpdateInput'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error or invalid ID
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
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
 *     summary: Delete category
 *     description: Deletes a category by ID.
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: string
 *         example: 65f1c2a9b7f4a8d123456789
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
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
