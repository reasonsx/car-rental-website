import { Response } from "express";
import { UserModel } from "../models/userModel";
import { AuthRequest } from "./authController";

export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admins only" });
    }

    const users = await UserModel.find().select("-password");

    const mappedUsers = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      isAdmin: u.isAdmin,
    }));

    res.status(200).json({ error: null, data: mappedUsers });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users: " + error });
  }
}
export async function getUserById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (req.user?.id !== id && !req.user?.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = await UserModel.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ error: null, data: user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user: " + error });
  }
}

export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (req.user?.id !== id && !req.user?.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updateData: any = {
      name: req.body.name,
      email: req.body.email,
    };

    if (req.user?.isAdmin && typeof req.body.isAdmin !== "undefined") {
      updateData.isAdmin = req.body.isAdmin;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ error: null, data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user: " + error });
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admins only" });
    }

    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ error: null, data: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user: " + error });
  }
}
