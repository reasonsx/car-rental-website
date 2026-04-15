import { Schema, model } from 'mongoose';
import { Location } from '../interfaces/location';

const locationSchema = new Schema<Location>({
  name: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true }
});

export const LocationModel = model<Location>('Location', locationSchema);