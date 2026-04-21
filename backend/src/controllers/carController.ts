import { Request, Response } from "express";
import mongoose from "mongoose";
import { CarModel } from "../models/carModel";
import { CreateCarRequest, UpdateCarRequest, CarResponse } from "../types/car.types";

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
 * CREATE
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
 * GET ALL
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
 * GET ONE
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
 * UPDATE
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
 * DELETE
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
