import { Request, Response } from 'express';
import { LocationModel } from '../models/locationModel';
import { connect, disconnect } from '../repository/database';
import '../models/locationModel'; // ensure model is registered

/**
 * Create location
 */
export async function createLocation(req: Request, res: Response) {
  try {
    await connect();

    const location = new LocationModel({
      name: req.body.name,
      city: req.body.city,
      address: req.body.address,
      phone: req.body.phone
    });

    const savedLocation = await location.save();
    res.status(201).json(savedLocation);

  } catch (error) {
    res.status(500).json({ message: "Failed to create location: " + error });
  } finally {
    await disconnect();
  }
}

/**
 * Get all locations
 */
export async function getLocations(req: Request, res: Response) {
  try {
    await connect();

    const locations = await LocationModel.find();
    res.status(200).json(locations);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch locations: " + error });
  } finally {
    await disconnect();
  }
}

/**
 * Get location by ID
 */
export async function getLocationById(req: Request, res: Response) {
  try {
    await connect();

    const location = await LocationModel.findById(req.params.id);
    if (!location) return res.status(404).json({ message: "Location not found" });

    res.status(200).json(location);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch location: " + error });
  } finally {
    await disconnect();
  }
}

/**
 * Update location
 */
export async function updateLocation(req: Request, res: Response) {
  try {
    await connect();

    const updatedLocation = await LocationModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedLocation) return res.status(404).json({ message: "Location not found" });

    res.status(200).json(updatedLocation);

  } catch (error) {
    res.status(500).json({ message: "Failed to update location: " + error });
  } finally {
    await disconnect();
  }
}

/**
 * Delete location
 */
export async function deleteLocation(req: Request, res: Response) {
  try {
    await connect();

    const deletedLocation = await LocationModel.findByIdAndDelete(req.params.id);
    if (!deletedLocation) return res.status(404).json({ message: "Location not found" });

    res.status(200).json({ message: "Location deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Failed to delete location: " + error });
  } finally {
    await disconnect();
  }
}