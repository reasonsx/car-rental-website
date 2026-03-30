export interface Car {
  _id: string;
  brand: string;
  modelName: string;
  year: number;
  pricePerDay: number;
  available: boolean;
  imageUrl?: string;
  categoryId: string | any; // Can be string or populated object
  locationId: string | any; // Can be string or populated object
}
