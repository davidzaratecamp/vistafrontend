import api from '../utils/api';

class TaskService {
  async getTasks(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/tasks?${params}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch tasks');
    }
  }

  async getTask(id) {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch task');
    }
  }

  async createTask(taskData) {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create task');
    }
  }

  async updateTask(id, taskData) {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update task');
    }
  }

  async deleteTask(id) {
    try {
      await api.delete(`/tasks/${id}`);
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete task');
    }
  }

  async getMyTasks(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/tasks/my-tasks?${params}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch my tasks');
    }
  }

  async getTaskStats(projectId = null) {
    try {
      const params = projectId ? `?projectId=${projectId}` : '';
      const response = await api.get(`/tasks/stats${params}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch task stats');
    }
  }

  async addComment(taskId, comment) {
    try {
      const response = await api.post(`/tasks/${taskId}/comments`, { comment });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to add comment');
    }
  }

  async getTaskComments(taskId) {
    try {
      const response = await api.get(`/tasks/${taskId}/comments`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch comments');
    }
  }

  async updateTaskStatus(taskId, status) {
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, { status });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update task status');
    }
  }
}

export default new TaskService();