// API service for communication with Node.js backend
const API_BASE_URL = 'http://localhost:5000/api';

// Interface definitions
export interface User {
  name: string;
  email: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  createdAt: string;
  userId: string;
}

export interface UserStats {
  totalIdeas: number;
  accountAge: string;
  lastLogin: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      credentials: 'include', // Include cookies for session
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(loginData: LoginData): Promise<{ success: boolean; message: string }> {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async register(registerData: RegisterData): Promise<{ success: boolean; message: string }> {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    return this.request('/logout', {
      method: 'POST',
    });
  }

  // User methods
  async getUser(): Promise<User> {
    return this.request('/user');
  }

  async getUserProfile(): Promise<User & { createdAt: string }> {
    return this.request('/user/profile');
  }

  async updateProfile(data: { name: string }): Promise<{ success: boolean; message: string }> {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { 
    currentPassword: string; 
    newPassword: string; 
  }): Promise<{ success: boolean; message: string }> {
    return this.request('/user/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getUserStats(): Promise<UserStats> {
    return this.request('/user/stats');
  }

  async deleteAllIdeas(): Promise<{ success: boolean; message: string }> {
    return this.request('/user/delete-all-ideas', {
      method: 'DELETE',
    });
  }

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    return this.request('/user/delete-account', {
      method: 'DELETE',
    });
  }

  // Ideas methods
  async getIdeas(search?: string): Promise<Idea[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await this.request<{ ideas: Idea[] }>(`/ideas${params}`);
    return response.ideas || [];
  }

  async createIdea(ideaData: {
    title: string;
    description: string;
    category: string;
    tags: string[];
  }): Promise<{ success: boolean; id: string; message: string }> {
    return this.request('/ideas', {
      method: 'POST',
      body: JSON.stringify(ideaData),
    });
  }

  // Firebase config
  async getFirebaseConfig(): Promise<any> {
    return this.request('/firebase-config');
  }
}

export const apiService = new ApiService();
export default apiService;
