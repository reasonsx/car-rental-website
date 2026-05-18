import { Request, Response } from "express";
import { LocationModel } from "./location.model";

/**
 * @swagger
 * /locations:
 *   post:
 *     summary: Create location
 *     description: Creates a new rental office location. Usually used by administrators.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LocationInput'
 *     responses:
 *       201:
 *         description: Location created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Missing or invalid token
 *       500:
 *         description: Failed to create location
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
 *     description: Returns all rental office locations.
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: List of locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Location'
 *       500:
 *         description: Failed to fetch locations
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
 *     description: Returns a single rental location by MongoDB ObjectId.
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Location ID
 *         schema:
 *           type: string
 *         example: 65f1c2a9b7f4a8d123456789
 *     responses:
 *       200:
 *         description: Location found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       404:
 *         description: Location not found
 *       500:
 *         description: Failed to fetch location
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
 *     summary: Update location
 *     description: Updates a rental office location by ID.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Location ID
 *         schema:
 *           type: string
 *         example: 65f1c2a9b7f4a8d123456789
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LocationUpdateInput'
 *     responses:
 *       200:
 *         description: Location updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Location not found
 *       500:
 *         description: Failed to update location
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
 *     summary: Delete location
 *     description: Deletes a rental office location by ID.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Location ID
 *         schema:
 *           type: string
 *         example: 65f1c2a9b7f4a8d123456789
 *     responses:
 *       200:
 *         description: Location deleted successfully
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Location not found
 *       500:
 *         description: Failed to delete location
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
