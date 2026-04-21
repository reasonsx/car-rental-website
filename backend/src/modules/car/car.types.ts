import { Types } from "mongoose";

//
// ==========================
// DATABASE MODEL (Mongo)
// ==========================
//

export interface Car {
  brand: string;
  modelName: string;
  year: number;
  pricePerDay: number;
  available: boolean;
  imageUrl?: string;
  categoryId: Types.ObjectId;
  locationId: Types.ObjectId;
}

//
// ==========================
// REQUEST TYPES
// ==========================
//

export interface CreateCarRequest {
  brand: string;
  modelName: string;
  year: number;
  pricePerDay: number;
  categoryId: string;
  locationId: string;
  available?: boolean;
  imageUrl?: string;
}

export interface UpdateCarRequest {
  brand?: string;
  modelName?: string;
  year?: number;
  pricePerDay?: number;
  categoryId?: string;
  locationId?: string;
  available?: boolean;
  imageUrl?: string;
}

//
// ==========================
// RESPONSE TYPES (POPULATED)
// ==========================
//

export interface CategoryResponse {
  _id: string;
  name: string;
  description?: string;
}

export interface LocationResponse {
  _id: string;
  name: string;
  city: string;
}

export interface CarResponse {
  id: string;
  brand: string;
  modelName: string;
  year: number;
  pricePerDay: number;
  available: boolean;
  imageUrl?: string;

  // populated objects (NOT strings anymore)
  categoryId: CategoryResponse;
  locationId: LocationResponse;
}
