export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  bio?: string;
  location?: string;
  created_at: string;
}

export interface Skill {
  id: number;
  user_id: number;
  skill_name: string;
  description?: string;
  proficiency_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category?: string;
  available: boolean;
  created_at: string;
  username?: string;
  full_name?: string;
  location?: string;
}

export interface SkillRequest {
  id: number;
  requester_id: number;
  skill_owner_id: number;
  skill_id: number;
  requested_skill: string;
  offered_skill?: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
  requester_username?: string;
  requester_name?: string;
  owner_username?: string;
  owner_name?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  bio?: string;
  location?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
}