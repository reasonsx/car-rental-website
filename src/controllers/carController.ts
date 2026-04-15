import { Request, Response } from 'express';
import { CarModel } from '../models/carModel';

/**
 * Create a new car
 * @route POST /api/cars
 */
export async function createCar(req: Request, res: Response) {
  try {
    const {
      brand,
      modelName,
      year,
      pricePerDay,
      imageUrl,
      categoryId,
      locationId,
      available
    } = req.body;

    if (!brand || !modelName || !year || !pricePerDay || !categoryId || !locationId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const car = new CarModel({
      brand,
      modelName,
      year,
      pricePerDay,
      available: available ?? true,
      imageUrl,
      categoryId,
      locationId
    });

    const savedCar = await car.save();
    res.status(201).json(savedCar);

  } catch (error: any) {
    res.status(500).json({
      message: 'Failed to create car',
      error: error.message
    });
  }
}

/**
 * Get all cars
 * @route GET /api/cars
 */
export async function getCars(_req: Request, res: Response) {
  try {
    const cars = await CarModel.find()
        .populate('categoryId')
        .populate('locationId')
        .lean();

    res.status(200).json(cars);

  } catch (error: any) {
    res.status(500).json({
      message: 'Failed to fetch cars',
      error: error.message
    });
  }
}

/**
 * Get a car by ID
 * @route GET /api/cars/:id
 */
export async function getCarById(req: Request, res: Response) {
  try {
    const car = await CarModel.findById(req.params.id)
        .populate('categoryId')
        .populate('locationId')
        .lean();

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json(car);

  } catch (error: any) {
    res.status(500).json({
      message: 'Failed to fetch car',
      error: error.message
    });
  }
}

/**
 * Update a car by ID
 * @route PUT /api/cars/:id
 */
export async function updateCar(req: Request, res: Response) {
  try {
    const updatedCar = await CarModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
    )
        .populate('categoryId')
        .populate('locationId')
        .lean();

    if (!updatedCar) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json(updatedCar);

  } catch (error: any) {
    res.status(500).json({
      message: 'Failed to update car',
      error: error.message
    });
  }
}

/**
 * Delete a car by ID
 * @route DELETE /api/cars/:id
 */
export async function deleteCar(req: Request, res: Response) {
  try {
    const deletedCar = await CarModel.findByIdAndDelete(req.params.id);

    if (!deletedCar) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json({
      message: 'Car deleted successfully'
    });

  } catch (error: any) {
    res.status(500).json({
      message: 'Failed to delete car',
      error: error.message
    });
  }
}