// User related types
export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Card related types
export interface Card {
  id: string;
  name: string;
  provider: string;
  category: string;
  description?: string;
  annualFee?: number;
  apr?: string;
  rewardsRate?: string;
  matchScore: number;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}