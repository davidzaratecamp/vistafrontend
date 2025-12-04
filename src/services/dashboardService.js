import api from '../utils/api';

class DashboardService {
  async getDashboardData() {
    try {
      const response = await api.get('/dashboard');
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch dashboard data');
    }
  }

  async getFilteredTasks(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/dashboard/tasks/filtered?${params}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch filtered tasks');
    }
  }

  async getSummaryStats() {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch summary stats');
    }
  }

  async getRecentActivity(limit = 15) {
    try {
      const response = await api.get(`/dashboard/activity?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch recent activity');
    }
  }
}

export default new DashboardService();