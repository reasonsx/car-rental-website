import { Router } from "express";
import {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
} from "./location.controller";

const router = Router();

// CRUD routes
router.post("/", verifyToken, createLocation);
router.get("/", getLocations);
router.get("/:id", getLocationById);
router.put("/:id", verifyToken, updateLocation);
router.delete("/:id", verifyToken, deleteLocation);

export default router;
