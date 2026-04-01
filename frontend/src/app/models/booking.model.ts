export interface Booking {
  _id?: string;
  userId: string;
  carId: string | { _id: string; [key: string]: any };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}
