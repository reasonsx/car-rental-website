export interface Car {
  id: string;
  brand: string;
  modelName: string;
  year: number;
  pricePerDay: number;
  available: boolean;
  imageUrl?: string;
  categoryId: string;
  locationId: string;
}
