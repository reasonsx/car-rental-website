import { Document } from "mongoose";

export interface Location extends Document {
  name: string;
  city: string;
  address: string;
  phone: string;
}
