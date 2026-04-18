import { Document, Types } from "mongoose";

export interface Car extends Document {
  brand: string;
  modelName: string;
  year: number;
  pricePerDay: number;
  available: boolean;
  imageUrl: string;
  categoryId: Types.ObjectId;
  locationId: Types.ObjectId;
}
