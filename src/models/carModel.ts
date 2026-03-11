import { Schema, model } from 'mongoose';
import { Car } from '../interfaces/car';

const carSchema = new Schema<Car>({
  brand: { type: String, required: true },
  modelName: { type: String, required: true },
  year: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  available: { type: Boolean, default: true },
  imageUrl: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true }
});

export const CarModel = model<Car>('Car', carSchema);