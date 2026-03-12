// routes/carRoutes.ts
import { Router } from 'express';
import {
  createCar,
  getCars,
  getCarById,
  updateCar,
  deleteCar
} from '../controllers/carController';

const router = Router();

// CRUD routes
router.post('/', createCar);        // POST /api/cars
router.get('/', getCars);           // GET /api/cars
router.get('/:id', getCarById);     // GET /api/cars/:id
router.put('/:id', updateCar);      // PUT /api/cars/:id
router.delete('/:id', deleteCar);   // DELETE /api/cars/:id

export default router;