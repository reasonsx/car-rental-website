// routes/car.routes.ts
import { Router } from "express";
import { createCar, getCars, getCarById, updateCar, deleteCar } from "./car.controller";
import { verifyToken } from "../auth/auth.controller";

const router = Router();

// CRUD routes
router.post("/", verifyToken, createCar);
router.get("/", getCars);
router.get("/:id", getCarById);
router.put("/:id", verifyToken, updateCar);
router.delete("/:id", verifyToken, deleteCar);

export default router;
