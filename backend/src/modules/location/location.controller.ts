import { Request, Response } from "express";
import { LocationModel } from "./location.model";

/**
 * @swagger
 * /locations:
 *   post:
 *     summary: Create a new location
 *     tags: [Locations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, city, address, phone]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Copenhagen Office
 *               city:
 *                 type: string
 *                 example: Copenhagen
 *               address:
 *                 type: string
 *                 example: Main Street 1
 *               phone:
 *                 type: string
 *                 example: +4512345678
 *     responses:
 *       201:
 *         description: Location created
 *       400:
 *         description: Validation error
 */
export async function createLocation(req: Request, res: Response) {
  try {
    const { name, city, address, phone } = req.body;

    if (!name || !city || !address || !phone) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const location = new LocationModel({
      name,
      city,
      address,
      phone,
    });

    const savedLocation = await location.save();
    res.status(201).json(savedLocation);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create location",
      error: error.message,
    });
  }
}

/**
 * @swagger
 * /locations:
 *   get:
 *     summary: Get all locations
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: List of locations
 *       500:
 *         description: Server error
 */
export async function getLocations(_req: Request, res: Response) {
  try {
    const locations = await LocationModel.find().lean();
    res.status(200).json(locations);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch locations",
      error: error.message,
    });
  }
}

/**
 * @swagger
 * /locations/{id}:
 *   get:
 *     summary: Get location by ID
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location found
 *       404:
 *         description: Location not found
 */
export async function getLocationById(req: Request, res: Response) {
  try {
    const location = await LocationModel.findById(req.params.id).lean();

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json(location);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch location",
      error: error.message,
    });
  }
}

/**
 * @swagger
 * /locations/{id}:
 *   put:
 *     summary: Update a location
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               city:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Location updated
 *       404:
 *         description: Location not found
 */
export async function updateLocation(req: Request, res: Response) {
  try {
    const updatedLocation = await LocationModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedLocation) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json(updatedLocation);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update location",
      error: error.message,
    });
  }
}

/**
 * @swagger
 * /locations/{id}:
 *   delete:
 *     summary: Delete a location
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location deleted
 *       404:
 *         description: Location not found
 */
export async function deleteLocation(req: Request, res: Response) {
  try {
    const deletedLocation = await LocationModel.findByIdAndDelete(req.params.id);

    if (!deletedLocation) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json({
      message: "Location deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete location",
      error: error.message,
    });
  }
}
