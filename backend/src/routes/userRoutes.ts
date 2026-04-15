import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from "../controllers/userController";
import { verifyToken } from "../controllers/authController";

const router = Router();

router.get("/", verifyToken, getAllUsers);
router.get("/:id", verifyToken, getUserById);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);

export default router;