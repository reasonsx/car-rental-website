export enum BookingStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Cancelled = 'cancelled'
}

export type Booking = {
  id?: string;
  userId: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: BookingStatus;
};