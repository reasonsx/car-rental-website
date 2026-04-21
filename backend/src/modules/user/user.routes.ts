import { Router } from "express";
import * as controller from "./user.controller";
import { verifyToken } from "../auth/auth.controller";

const router = Router();

router.use(verifyToken);

router.get("/", controller.getAllUsers);
router.get("/:id", controller.getUserById);
router.put("/:id", controller.updateUser);
router.delete("/:id", controller.deleteUser);

export default router;
