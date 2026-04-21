export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
}
