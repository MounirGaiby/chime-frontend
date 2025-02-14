export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    authorization: {
      token: string;
      type: string;
      expires_in: number;
    };
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
} 