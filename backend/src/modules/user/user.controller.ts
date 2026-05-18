import { Response } from "express";
import Joi from "joi";
import { UserModel } from "./user.model";
import { AuthRequest } from "../auth/auth.controller";

const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

function rejectHtmlTags(value: string, helpers: Joi.CustomHelpers) {
  if (HTML_TAG_PATTERN.test(value)) {
    return helpers.error("string.htmlTag");
  }

  return value;
}

function rejectControlCharacters(value: string, helpers: Joi.CustomHelpers) {
  if (CONTROL_CHARACTER_PATTERN.test(value)) {
    return helpers.error("string.controlCharacter");
  }

  return value;
}

const updateUserSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .custom(rejectHtmlTags)
    .custom(rejectControlCharacters)
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 3 characters",
      "string.max": "Name must not exceed 100 characters",
      "string.htmlTag": "Name cannot contain HTML tags",
      "string.controlCharacter": "Name contains invalid characters",
    }),
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .max(254)
    .custom(rejectHtmlTags)
    .custom(rejectControlCharacters)
    .messages({
      "string.empty": "Email is required",
      "string.email": "Enter a valid email address",
      "string.max": "Email must not exceed 254 characters",
      "string.htmlTag": "Email cannot contain HTML tags",
      "string.controlCharacter": "Email contains invalid characters",
    }),
  isAdmin: Joi.boolean(),
  isDeleted: Joi.boolean(),
});

// helper mapper
function mapUser(user: any) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    isDeleted: user.isDeleted,
  };
}

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Admins only
 *       500:
 *         description: Server error
 */
export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Admins only" });
    }

    const users = await UserModel.find().select("-password");

    res.json({
      error: null,
      data: users.map(mapUser),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (self or admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
export async function getUserById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (req.user?.id !== id && !req.user?.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const user = await UserModel.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ error: null, data: mapUser(user) });
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user (self or admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *               email:
 *                 type: string
 *               isAdmin:
 *                 type: boolean
 *                 description: Only admins can change this
 *     responses:
 *       200:
 *         description: User updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (req.user?.id !== id && !req.user?.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { error, value } = updateUserSchema.validate(req.body, {
      abortEarly: true,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updateData: Partial<{
      name: string;
      email: string;
      isAdmin: boolean;
      isDeleted: boolean;
    }> = {};

    if (value.name) updateData.name = value.name;
    if (value.email) {
      const existingUser = await UserModel.findOne({ _id: { $ne: id }, email: value.email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      updateData.email = value.email;
    }

    // only admin can change role
    if (req.user?.isAdmin && typeof value.isAdmin === "boolean") {
      updateData.isAdmin = value.isAdmin;
    }

    // only admin can change deleted status
    if (req.user?.isAdmin && typeof value.isDeleted === "boolean") {
      updateData.isDeleted = value.isDeleted;
    }

    const user = await UserModel.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ error: null, data: mapUser(user) });
  } catch {
    res.status(500).json({ error: "Failed to update user" });
  }
}

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Soft delete user (Admin only) - sets isDeleted to true
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User soft deleted
 *       403:
 *         description: Admins only
 *       404:
 *         description: User not found
 */
export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Admins only" });
    }

    const { id } = req.params;

    const user = await UserModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { returnDocument: "after" }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ error: null, data: "User soft deleted" });
  } catch {
    res.status(500).json({ error: "Failed to soft delete user" });
  }
}
