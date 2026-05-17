import { Router } from "express";
import { registerUser, loginUser, changePassword, verifyToken } from "./auth.controller";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/change-password", verifyToken, changePassword);

export default router;
