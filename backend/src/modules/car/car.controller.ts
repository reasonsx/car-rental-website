import { Request, Response } from "express";
import mongoose from "mongoose";
import { CarModel } from "./car.model";
import { CreateCarRequest, UpdateCarRequest, CarResponse } from "./car.types";

const mapCar = (c: any): CarResponse => ({
  id: c._id.toString(),
  brand: c.brand,
  modelName: c.modelName,
  year: c.year,
  pricePerDay: c.pricePerDay,
  available: c.available,
  imageUrl: c.imageUrl,
  categoryId: c.categoryId, // now object
  locationId: c.locationId, // now object
});

/**
 * @swagger
 * /cars:
 *   post:
 *     summary: Create a new car
 *     description: Creates a new car. Usually used by admins to add vehicles to the catalog.
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [brand, modelName, year, pricePerDay, categoryId, locationId]
 *             properties:
 *               brand:
 *                 type: string
 *                 example: Toyota
 *               modelName:
 *                 type: string
 *                 example: Corolla
 *               year:
 *                 type: number
 *                 example: 2023
 *               pricePerDay:
 *                 type: number
 *                 example: 500
 *               available:
 *                 type: boolean
 *                 example: true
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com/toyota-corolla.jpg
 *               categoryId:
 *                 type: string
 *                 example: 65f1c2a9b7f4a8d123456789
 *               locationId:
 *                 type: string
 *                 example: 65f1c2a9b7f4a8d987654321
 *     responses:
 *       201:
 *         description: Car created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Missing or invalid token
 *       500:
 *         description: Failed to create car
 */
export async function createCar(req: Request<{}, {}, CreateCarRequest>, res: Response) {
  try {
    const { brand, modelName, year, pricePerDay, imageUrl, categoryId, locationId, available } =
      req.body;

    if (!brand || !modelName || !year || !pricePerDay || !categoryId || !locationId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const car = await CarModel.create({
      brand,
      modelName,
      year,
      pricePerDay,
      available: available ?? true,
      imageUrl,
      categoryId,
      locationId,
    });

    res.status(201).json(mapCar(car));
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create car",
      error: error.message,
    });
  }
}

/**
 * @swagger
 * /cars:
 *   get:
 *     summary: Get all cars
 *     description: Returns all cars with populated category and location data.
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: List of cars
 *       500:
 *         description: Failed to fetch cars
 */
export async function getCars(_req: Request, res: Response) {
  try {
    const cars = await CarModel.find().populate("categoryId").populate("locationId").lean();
    res.status(200).json(cars.map(mapCar));
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch cars",
      error: error.message,
    });
  }
}

/**
 * @swagger
 * /cars:
 *   get:
 *     summary: Get all cars
 *     description: Returns all cars with populated category and location data.
 *     tags: [Cars]
 *     responses:
 *       200:
 *         description: List of cars
 *       500:
 *         description: Failed to fetch cars
 */
export async function getCarById(req: Request<{ id: string }>, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const car = await CarModel.findById(id).populate("categoryId").populate("locationId").lean();

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json(mapCar(car));
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch car",
      error: error.message,
    });
  }
}

/**
 * @swagger
 * /cars/{id}:
 *   put:
 *     summary: Update car
 *     description: Updates a car by ID. Usually used by admins.
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Car ID
 *         schema:
 *           type: string
 *         example: 65f1c2a9b7f4a8d123456789
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *                 example: BMW
 *               modelName:
 *                 type: string
 *                 example: X5
 *               year:
 *                 type: number
 *                 example: 2024
 *               pricePerDay:
 *                 type: number
 *                 example: 1200
 *               available:
 *                 type: boolean
 *                 example: true
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com/bmw-x5.jpg
 *               categoryId:
 *                 type: string
 *                 example: 65f1c2a9b7f4a8d123456789
 *               locationId:
 *                 type: string
 *                 example: 65f1c2a9b7f4a8d987654321
 *     responses:
 *       200:
 *         description: Car updated successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Car not found
 *       500:
 *         description: Failed to update car
 */
export async function updateCar(req: Request<{ id: string }, {}, UpdateCarRequest>, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const updatedCar = await CarModel.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
      runValidators: true,
    }).lean();

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json(mapCar(updatedCar));
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update car",
      error: error.message,
    });
  }
}

/**
 * @swagger
 * /cars/{id}:
 *   delete:
 *     summary: Delete car
 *     description: Deletes a car by ID. Usually used by admins.
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Car ID
 *         schema:
 *           type: string
 *         example: 65f1c2a9b7f4a8d123456789
 *     responses:
 *       200:
 *         description: Car deleted successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Car not found
 *       500:
 *         description: Failed to delete car
 */
export async function deleteCar(req: Request<{ id: string }>, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const deletedCar = await CarModel.findByIdAndDelete(id);

    if (!deletedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json({
      message: "Car deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete car",
      error: error.message,
    });
  }
}
