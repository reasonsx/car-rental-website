export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  password?: string; // Optional for updates
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  error: null;
  data: {
    token: string;
    user: User;
  };
}