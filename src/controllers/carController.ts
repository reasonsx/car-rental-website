import { Request, Response } from 'express';
import { CarModel } from '../models/carModel';
import { connect, disconnect } from '../repository/database';

/**
 * Create a new car
 */
export async function createCar(req: Request, res: Response) {
  try {

    const car = new CarModel({
      brand: req.body.brand,
      modelName: req.body.modelName,
      year: req.body.year,
      pricePerDay: req.body.pricePerDay,
      available: req.body.available ?? true,
      imageUrl: req.body.imageUrl,
      categoryId: req.body.categoryId,
      locationId: req.body.locationId
    });

    const savedCar = await car.save();
    res.status(201).json(savedCar);

  } catch (error) {
    res.status(500).json({ message: "Failed to create car: " + error });
  }
}

/**
 * Get all cars
 */
export async function getCars(req: Request, res: Response) {
  try {

    const cars = await CarModel.find()
      .populate('categoryId')
      .populate('locationId');

    res.status(200).json(cars);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch cars: " + error });
  } 
}

/**
 * Get car by ID
 */
export async function getCarById(req: Request, res: Response) {
  try {

    const car = await CarModel.findById(req.params.id)
      .populate('categoryId')
      .populate('locationId');

    if (!car) return res.status(404).json({ message: "Car not found" });

    res.status(200).json(car);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch car: " + error });
  } 
}

/**
 * Update car
 */
export async function updateCar(req: Request, res: Response) {
  try {

    const updatedCar = await CarModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedCar) return res.status(404).json({ message: "Car not found" });

    res.status(200).json(updatedCar);

  } catch (error) {
    res.status(500).json({ message: "Failed to update car: " + error });
  } 
}

/**
 * Delete car
 */
export async function deleteCar(req: Request, res: Response) {
  try {

    const deletedCar = await CarModel.findByIdAndDelete(req.params.id);

    if (!deletedCar) return res.status(404).json({ message: "Car not found" });

    res.status(200).json({ message: "Car deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Failed to delete car: " + error });
  } 
}