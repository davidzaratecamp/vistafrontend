import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import userService from '../services/userService';
import useAuthStore from '../store/authStore';

const TaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const isEditing = !!id;
  const projectIdParam = searchParams.get('projectId');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: projectIdParam || '',
    assignedTo: '',
    assignees: [],
    priority: 'media',
    status: 'pendiente',
    estimatedDate: '',
    actualDate: ''
  });

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState(null);

  const priorityOptions = [
    { value: 'baja', label: 'Baja', color: 'text-gray-600', bg: 'bg-gray-100' },
    { value: 'media', label: 'Media', color: 'text-blue-600', bg: 'bg-blue-100' },
    { value: 'alta', label: 'Alta', color: 'text-orange-600', bg: 'bg-orange-100' },
    { value: 'critica', label: 'Crítica', color: 'text-red-600', bg: 'bg-red-100' }
  ];

  const statusOptions = [
    { value: 'pendiente', label: 'Pendiente', color: 'text-amber-600', bg: 'bg-amber-100' },
    { value: 'en_progreso', label: 'En Progreso', color: 'text-blue-600', bg: 'bg-blue-100' },
    { value: 'completado', label: 'Completado', color: 'text-emerald-600', bg: 'bg-emerald-100' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      fetchTask();
    }
  }, [id, isEditing]);

  const fetchInitialData = async () => {
    try {
      setIsLoadingData(true);
      const [projectsData, usersData] = await Promise.all([
        projectService.getProjects(),
        userService.getUsers()
      ]);
      setProjects(projectsData);
      setUsers(usersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchTask = async () => {
    try {
      const taskData = await taskService.getTask(id);
      setFormData({
        title: taskData.title || '',
        description: taskData.description || '',
        projectId: taskData.projectId || '',
        assignedTo: taskData.assignedTo || '',
        assignees: taskData.assignees ? taskData.assignees.map(a => a.id) : [],
        priority: taskData.priority || 'media',
        status: taskData.status || 'pendiente',
        estimatedDate: taskData.estimatedDate ? taskData.estimatedDate.split('T')[0] : '',
        actualDate: taskData.actualDate ? taskData.actualDate.split('T')[0] : ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        projectId: parseInt(formData.projectId),
        assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : null,
        assignees: formData.assignees.length > 0 ? formData.assignees.map(id => parseInt(id)) : [],
        estimatedDate: formData.estimatedDate || null,
        actualDate: formData.actualDate || null
      };


      if (isEditing) {
        await taskService.updateTask(id, submitData);
      } else {
        await taskService.createTask(submitData);
      }

      // Navigate back to project detail if we came from there
      if (projectIdParam) {
        navigate(`/projects/${projectIdParam}`);
      } else {
        navigate('/tasks');
      }
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

  const handleAssigneeToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter(id => id !== userId)
        : [...prev.assignees, userId]
    }));
  };

  const handleSelectAllAssignees = () => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.length === users.length ? [] : users.map(u => u.id)
    }));
  };

  const handleCancel = () => {
    if (projectIdParam) {
      navigate(`/projects/${projectIdParam}`);
    } else {
      navigate('/tasks');
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-indigo-600 rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-3xl shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative px-6 py-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
                </h1>
                <p className="text-blue-100 text-sm">
                  {isEditing ? 'Modifica los detalles de la tarea' : 'Crea una nueva tarea para tu proyecto'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
        {error && (
          <div className="mb-6 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <XMarkIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-red-800 font-semibold">Error</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              Título de la Tarea <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
              placeholder="Ingresa el título de la tarea"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
              placeholder="Describe los detalles de la tarea..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Proyecto y Estado en una fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="projectId" className="block text-sm font-semibold text-gray-700 mb-2">
                Proyecto <span className="text-red-500">*</span>
              </label>
              <select
                id="projectId"
                name="projectId"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                value={formData.projectId}
                onChange={handleChange}
              >
                <option value="">Selecciona un proyecto</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                Estado
              </label>
              <select
                id="status"
                name="status"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                value={formData.status}
                onChange={handleChange}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prioridad y Asignado en una fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                id="priority"
                name="priority"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                value={formData.priority}
                onChange={handleChange}
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Asignar a
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllAssignees}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {formData.assignees.length === users.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
              </div>
              <div className="border border-gray-200 rounded-xl p-3 bg-white/50 backdrop-blur-sm max-h-40 overflow-y-auto">
                {users.length === 0 && !isLoadingData ? (
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
                          checked={formData.assignees.includes(user.id)}
                          onChange={() => handleAssigneeToggle(user.id)}
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
              {formData.assignees.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  {formData.assignees.length} persona{formData.assignees.length !== 1 ? 's' : ''} seleccionada{formData.assignees.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="estimatedDate" className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha Estimada
              </label>
              <input
                type="date"
                id="estimatedDate"
                name="estimatedDate"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                value={formData.estimatedDate}
                onChange={handleChange}
              />
            </div>

            {isEditing && (
              <div>
                <label htmlFor="actualDate" className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha Real
                </label>
                <input
                  type="date"
                  id="actualDate"
                  name="actualDate"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  value={formData.actualDate}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5 mr-2" />
                  {isEditing ? 'Actualizar Tarea' : 'Crear Tarea'}
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              <XMarkIcon className="h-5 w-5 mr-2" />
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;