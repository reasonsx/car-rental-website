export type User = {
  id?: string; // optional because MongoDB generates _id
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt?: Date;
};