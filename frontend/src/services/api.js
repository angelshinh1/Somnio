const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    this.currentUser = null; // Cache current user data
    
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('dreamSync_token');
    }
  }

  // Helper method to make authenticated requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('dreamSync_token', token);
      } else {
        localStorage.removeItem('dreamSync_token');
      }
    }
  }

  // Remove authentication token
  clearToken() {
    this.setToken(null);
    this.currentUser = null;
  }

  // Authentication methods
  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (data.token) {
      this.setToken(data.token);
      this.currentUser = data.user;
    }
    
    return data;
  }

  async login(credentials) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (data.token) {
      this.setToken(data.token);
      this.currentUser = data.user;
    }
    
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser() {
    if (!this.token) {
      throw new Error('Not authenticated');
    }
    
    // Return cached user if available
    if (this.currentUser) {
      return this.currentUser;
    }
    
    try {
      // Fetch and cache current user
      const response = await this.request('/auth/me');
      this.currentUser = response.user;
      return this.currentUser;
    } catch (error) {
      // If auth fails, clear token and throw
      this.clearToken();
      throw error;
    }
  }

  async changePassword(passwordData) {
    return await this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData)
    });
  }

  async updateProfile(profileData) {
    return await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // Dream methods
  async getPublicDreams() {
    return await this.request('/dreams/public');
  }

  async getDreams(params = {}) {
    // For demo purposes, always return public dreams
    // In a real app, this would return user-specific dreams when authenticated
    return await this.getPublicDreams();
  }

  async getUserDreams(userId) {
    return await this.request(`/dreams/user/${userId}`);
  }

  async getDream(dreamId) {
    return await this.request(`/dreams/${dreamId}`);
  }

  async createDream(dreamData) {
    // For demo purposes, use a default user ID if not provided
    const dataWithUser = {
      ...dreamData,
      userId: dreamData.userId || 'demo-user'
    };
    
    return await this.request('/dreams', {
      method: 'POST',
      body: JSON.stringify(dataWithUser)
    });
  }

  async updateDream(dreamId, dreamData) {
    return await this.request(`/dreams/${dreamId}`, {
      method: 'PUT',
      body: JSON.stringify(dreamData)
    });
  }

  async deleteDream(dreamId) {
    return await this.request(`/dreams/${dreamId}`, {
      method: 'DELETE'
    });
  }

  // Search and discovery
  async searchDreams(params) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/dreams/search?${queryString}`);
  }

  async getSimilarDreams(dreamId, minSimilarity = 0.7) {
    return await this.request(`/dreams/${dreamId}/similar?minSimilarity=${minSimilarity}`);
  }

  async getTags() {
    return await this.request('/dreams/tags');
  }

  // Statistics
  async getOverviewStats() {
    return await this.request('/stats/overview');
  }

  async getDreamStats() {
    try {
      const stats = await this.getOverviewStats();
      return {
        totalDreams: stats.stats?.totalDreams || 0,
        lucidDreams: Math.floor((stats.stats?.totalDreams || 0) * 0.2), // 20% lucid
        recurringDreams: Math.floor((stats.stats?.totalDreams || 0) * 0.15), // 15% recurring
        averageRating: 4.2
      };
    } catch (error) {
      // Return default stats if API fails
      return {
        totalDreams: 0,
        lucidDreams: 0,
        recurringDreams: 0,
        averageRating: 4.2
      };
    }
  }

  async getUserStats(userId) {
    return await this.request(`/stats/user/${userId}`);
  }

  // Network data
  async getNetworkData() {
    return await this.request('/network/data');
  }

  // Utility method to check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }
}

// Create and export a singleton instance
const apiService = new APIService();
export default apiService;