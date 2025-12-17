import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import projectService from '../services/projectService';
import userService from '../services/userService';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'activo',
    priority: 'media',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    members: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    fetchUsers();
    if (isEdit) {
      fetchProject();
    }
  }, [id, isEdit]);

  const fetchUsers = async () => {
    try {
      const usersData = await userService.getUsers();
      setUsers(usersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      const project = await projectService.getProject(id);
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'activo',
        priority: project.priority || 'media',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        members: project.members ? project.members.map(m => m.id) : []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      const submitData = {
        ...formData,
        endDate: formData.endDate || null,
        members: formData.members
      };
      
      if (isEdit) {
        await projectService.updateProject(id, submitData);
      } else {
        await projectService.createProject(submitData);
      }
      
      navigate('/projects');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  const handleSelectAllMembers = () => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.length === users.length ? [] : users.map(u => u.id)
    }));
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/projects')}
          className="text-gray-400 hover:text-gray-600"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Actualiza la información del proyecto' : 'Crea un nuevo proyecto para tu equipo'}
          </p>
        </div>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="form-label" htmlFor="name">
              Nombre del Proyecto *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="form-input"
              placeholder="Ingresa el nombre del proyecto"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="description">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="form-input"
              placeholder="Describe el proyecto y sus objetivos"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label" htmlFor="status">
                Estado
              </label>
              <select
                id="status"
                name="status"
                className="form-input"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="activo">Activo</option>
                <option value="en_pausa">En Pausa</option>
                <option value="terminado">Terminado</option>
              </select>
            </div>

            <div>
              <label className="form-label" htmlFor="priority">
                Prioridad
              </label>
              <select
                id="priority"
                name="priority"
                className="form-input"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label" htmlFor="startDate">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                required
                className="form-input"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="form-label" htmlFor="endDate">
                Fecha de Fin
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-input"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
              />
            </div>
          </div>

          {/* Miembros del equipo */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="form-label">
                Miembros del Equipo
              </label>
              <button
                type="button"
                onClick={handleSelectAllMembers}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                {formData.members.length === users.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>
            <div className="border border-gray-300 rounded-md p-3 bg-gray-50 max-h-40 overflow-y-auto">
              {isLoadingData ? (
                <p className="text-xs text-gray-500 text-center py-2">
                  Cargando usuarios...
                </p>
              ) : users.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-2">
                  No hay usuarios disponibles
                </p>
              ) : (
                <div className="space-y-2">
                  {users.map(user => (
                    <label 
                      key={user.id}
                      className="flex items-center space-x-3 p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.members.includes(user.id)}
                        onChange={() => handleMemberToggle(user.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.role} • {user.email}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {formData.members.length > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                {formData.members.length} miembro{formData.members.length !== 1 ? 's' : ''} seleccionado{formData.members.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;