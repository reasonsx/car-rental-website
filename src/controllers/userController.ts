// src/controllers/userController.ts
import { Request, Response } from "express";
import { UserModel } from "../models/userModel";
import { User } from "../interfaces/user";
import { connect, disconnect } from "../repository/database";

/**
 * Get all users (admin only)
 */
export async function getAllUsers(req: Request, res: Response) {
  try {
    await connect();
    const users = await UserModel.find().select("-password"); // hide password
    res.status(200).json({ error: null, data: users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users: " + error });
  } finally {
    await disconnect();
  }
}

/**
 * Get a single user by ID
 */
export async function getUserById(req: Request, res: Response) {
  try {
    await connect();
    const user = await UserModel.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ error: null, data: user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user: " + error });
  } finally {
    await disconnect();
  }
}

/**
 * Update a user (name, email, isAdmin)
 */
export async function updateUser(req: Request, res: Response) {
  try {
    await connect();
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          isAdmin: req.body.isAdmin
        }
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ error: null, data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user: " + error });
  } finally {
    await disconnect();
  }
}

/**
 * Delete a user by ID
 */
export async function deleteUser(req: Request, res: Response) {
  try {
    await connect();
    const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ error: null, data: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user: " + error });
  } finally {
    await disconnect();
  }
}