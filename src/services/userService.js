import api from '../utils/api';

const userService = {
  async getUsers(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.role) params.append('role', filters.role);
      if (filters.managerId) params.append('managerId', filters.managerId);
      if (filters.search) params.append('search', filters.search);
      
      const response = await api.get(`/users?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error fetching users');
    }
  },

  async getUser(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error fetching user');
    }
  },

  async createUser(userData) {
    try {
      const response = await api.post('/users', userData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error creating user');
    }
  },

  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error updating user');
    }
  },

  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error deleting user');
    }
  },

  async getMyTeam() {
    try {
      const response = await api.get('/users/my-team');
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error fetching team');
    }
  },

  async getUserStats() {
    try {
      const response = await api.get('/users/stats');
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Error fetching user stats');
    }
  }
};

export default userService;