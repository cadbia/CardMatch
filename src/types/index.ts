// User related types
export interface User {
  id: string;
  email: string;
  name?: string;
  preferences?: {
    categories: string[];
    annualFeePreference: string;
    creditScoreRange: string;
  };
  extraPreferences?: {
    signBonus: boolean;
    avgAPR: number | null;
    rewardRate: string | null;
  };
  rankedPref?: {
    categories: number;
    annualFeePreference: number;
    creditScoreRange: number;
    signBonus?: number;
    avgAPR?: number;
    rewardRate?: number;
  };
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
  apr?: {
    min: number;
    max: number;
  };
  rewardsRate?: string;
  signupBonus?: string;
  creditScoreRequired?: string;
  features?: string[];
  imageUrl?: string;
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