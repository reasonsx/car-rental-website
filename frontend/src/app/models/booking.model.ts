export interface UserInfo {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  driversLicenseNumber: string;
  driversLicenseExpiry: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface Booking {
  _id: string;

  userId: {
    _id: string;
    name: string;
    email: string;
  };

  carId: {
    _id: string;
    brand: string;
    modelName: string;
    pricePerDay: number;
    imageUrl?: string;
  };

  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentIntentId?: string;
  userInfo: UserInfo;
}
