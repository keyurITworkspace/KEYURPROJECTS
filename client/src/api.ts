import axios from 'axios';
import { User, Skill, SkillRequest, RegisterData, LoginResponse } from './types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/login', { username, password });
    return response.data;
  },

  register: async (userData: RegisterData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/register', userData);
    return response.data;
  },
};

// Skills API
export const skillsAPI = {
  getSkills: async (category?: string, search?: string): Promise<Skill[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    const response = await api.get<Skill[]>(`/api/skills?${params.toString()}`);
    return response.data;
  },

  getMySkills: async (): Promise<Skill[]> => {
    const response = await api.get<Skill[]>('/api/skills/my');
    return response.data;
  },

  createSkill: async (skillData: Omit<Skill, 'id' | 'user_id' | 'created_at' | 'available'>): Promise<Skill> => {
    const response = await api.post<{ skill: Skill }>('/api/skills', skillData);
    return response.data.skill;
  },

  updateSkill: async (id: number, skillData: Partial<Skill>): Promise<void> => {
    await api.put(`/api/skills/${id}`, skillData);
  },

  deleteSkill: async (id: number): Promise<void> => {
    await api.delete(`/api/skills/${id}`);
  },
};

// Requests API
export const requestsAPI = {
  createRequest: async (requestData: {
    skill_id: number;
    offered_skill: string;
    message?: string;
  }): Promise<SkillRequest> => {
    const response = await api.post<{ request: SkillRequest }>('/api/requests', requestData);
    return response.data.request;
  },

  getReceivedRequests: async (): Promise<SkillRequest[]> => {
    const response = await api.get<SkillRequest[]>('/api/requests/received');
    return response.data;
  },

  getSentRequests: async (): Promise<SkillRequest[]> => {
    const response = await api.get<SkillRequest[]>('/api/requests/sent');
    return response.data;
  },

  updateRequestStatus: async (id: number, status: string): Promise<void> => {
    await api.put(`/api/requests/${id}/status`, { status });
  },
};

// Profile API
export const profileAPI = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/api/profile');
    return response.data;
  },

  updateProfile: async (profileData: Partial<User>): Promise<void> => {
    await api.put('/api/profile', profileData);
  },
};

// Categories API
export const categoriesAPI = {
  getCategories: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/api/categories');
    return response.data;
  },
};

export default api;