import api from '../utils/api';

class ProjectService {
  async getProjects(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/projects?${params}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch projects');
    }
  }

  async getProject(id) {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch project');
    }
  }

  async createProject(projectData) {
    try {
      const response = await api.post('/projects', projectData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create project');
    }
  }

  async updateProject(id, projectData) {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update project');
    }
  }

  async deleteProject(id) {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete project');
    }
  }

  async addMember(projectId, userId, role = 'desarrollador') {
    try {
      const response = await api.post(`/projects/${projectId}/members`, {
        userId,
        role
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to add member');
    }
  }

  async removeMember(projectId, userId) {
    try {
      await api.delete(`/projects/${projectId}/members`, {
        data: { userId }
      });
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to remove member');
    }
  }

  async getProjectStats(id) {
    try {
      const response = await api.get(`/projects/${id}/stats`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch project stats');
    }
  }
}

export default new ProjectService();