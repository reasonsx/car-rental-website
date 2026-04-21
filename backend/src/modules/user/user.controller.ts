import { Response } from "express";
import { UserModel } from "./user.model";
import { AuthRequest } from "../auth/auth.controller";

// helper mapper
function mapUser(user: any) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
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

    const updateData: Partial<{
      name: string;
      email: string;
      isAdmin: boolean;
    }> = {};

    if (req.body.name) updateData.name = req.body.name;
    if (req.body.email) updateData.email = req.body.email;

    // only admin can change role
    if (req.user?.isAdmin && typeof req.body.isAdmin === "boolean") {
      updateData.isAdmin = req.body.isAdmin;
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
 *     summary: Delete user (Admin only)
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
 *         description: User deleted
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

    const user = await UserModel.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ error: null, data: "User deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete user" });
  }
}
