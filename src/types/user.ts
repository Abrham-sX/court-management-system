// Explicit named exports only - no default export
export type UserRole = 'admin' | 'judge' | 'clerk' | 'lawyer' | 'user';

export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string; 
  avatar_url?: string | null;
  role: UserRole;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}
