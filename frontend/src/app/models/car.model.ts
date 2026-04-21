export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export interface Location {
  _id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
}

export interface Car {
  id: string;
  brand: string;
  modelName: string;
  year: number;
  pricePerDay: number;
  available: boolean;
  imageUrl?: string;
  categoryId: Category;
  locationId: Location;
}
