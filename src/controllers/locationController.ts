import { Request, Response } from 'express';
import { LocationModel } from '../models/locationModel';

/**
 * Create a new location
 * @route POST /api/locations
 */
export async function createLocation(req: Request, res: Response) {
  try {
    const { name, city, address, phone } = req.body;

    if (!name || !city || !address || !phone) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const location = new LocationModel({
      name,
      city,
      address,
      phone
    });

    const savedLocation = await location.save();
    res.status(201).json(savedLocation);

  } catch (error: any) {
    res.status(500).json({
      message: 'Failed to create location',
      error: error.message
    });
  }
}

/**
 * Get all locations
 * @route GET /api/locations
 */
export async function getLocations(_req: Request, res: Response) {
  try {
    const locations = await LocationModel.find().lean();
    res.status(200).json(locations);

  } catch (error: any) {
    res.status(500).json({
      message: 'Failed to fetch locations',
      error: error.message
    });
  }
}

/**
 * Get a location by ID
 * @route GET /api/locations/:id
 */
export async function getLocationById(req: Request, res: Response) {
  try {
    const location = await LocationModel.findById(req.params.id).lean();

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(200).json(location);

  } catch (error: any) {
    res.status(500).json({
      message: 'Failed to fetch location',
      error: error.message
    });
  }
}

/**
 * Update a location by ID
 * @route PUT /api/locations/:id
 */
export async function updateLocation(req: Request, res: Response) {
  try {
    const updatedLocation = await LocationModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
    ).lean();

    if (!updatedLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(200).json(updatedLocation);

  } catch (error: any) {
    res.status(500).json({
      message: 'Failed to update location',
      error: error.message
    });
  }
}

/**
 * Delete a location by ID
 * @route DELETE /api/locations/:id
 */
export async function deleteLocation(req: Request, res: Response) {
  try {
    const deletedLocation = await LocationModel.findByIdAndDelete(req.params.id);

    if (!deletedLocation) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(200).json({
      message: 'Location deleted successfully'
    });

  } catch (error: any) {
    res.status(500).json({
      message: 'Failed to delete location',
      error: error.message
    });
  }
}