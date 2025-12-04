import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import useAuthStore from '../store/authStore';

const Tasks = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    projectId: searchParams.get('projectId') || '',
    assignedTo: ''
  });

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'completado', label: 'Completado' }
  ];

  const priorityOptions = [
    { value: '', label: 'Todas las prioridades' },
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [tasksData, projectsData] = await Promise.all([
        taskService.getTasks(),
        projectService.getProjects()
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = tasks;

    if (filters.search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.projectId) {
      filtered = filtered.filter(task => task.projectId === parseInt(filters.projectId));
    }

    if (filters.assignedTo) {
      filtered = filtered.filter(task => task.assignedTo === parseInt(filters.assignedTo));
    }

    setFilteredTasks(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await taskService.deleteTask(taskId);
        setTasks(prev => prev.filter(t => t.id !== taskId));
      } catch (err) {
        alert('Error al eliminar la tarea: ' + err.message);
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updatedTask = await taskService.updateTaskStatus(taskId, newStatus);
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    } catch (err) {
      alert('Error al actualizar el estado: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critica':
        return 'bg-red-100 text-red-800';
      case 'alta':
        return 'bg-orange-100 text-orange-800';
      case 'media':
        return 'bg-blue-100 text-blue-800';
      case 'baja':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueAssignees = Array.from(
    new Map(tasks.filter(task => task.assignee).map(task => [task.assignee.id, task.assignee])).values()
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-600">Gestiona todas las tareas del equipo</p>
        </div>
        <Link to="/tasks/new" className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Nueva Tarea
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tareas..."
              className="form-input pl-10"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <select
              className="form-input"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <select
              className="form-input"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <select
              className="form-input"
              value={filters.projectId}
              onChange={(e) => handleFilterChange('projectId', e.target.value)}
            >
              <option value="">Todos los proyectos</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            
            <select
              className="form-input"
              value={filters.assignedTo}
              onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
            >
              <option value="">Todos los asignados</option>
              {uniqueAssignees.map(assignee => (
                <option key={assignee.id} value={assignee.id}>
                  {assignee.firstName} {assignee.lastName}
                </option>
              ))}
            </select>

            <button
              onClick={() => setFilters({
                search: '',
                status: '',
                priority: '',
                projectId: '',
                assignedTo: ''
              })}
              className="btn-secondary text-sm"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Responsive Tasks Display */}
        <div className="overflow-hidden">
          
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarea
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proyecto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asignado a
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha estimada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          to={`/tasks/${task.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {task.title}
                        </Link>
                        {task.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/projects/${task.project?.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 truncate block max-w-[120px]"
                      >
                        {task.project?.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center min-w-0">
                        {task.assignee ? (
                          <>
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                              <span className="text-xs font-medium text-white">
                                {task.assignee.firstName?.charAt(0)}{task.assignee.lastName?.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm text-gray-900 truncate">
                              {task.assignee.firstName} {task.assignee.lastName}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Sin asignar</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className={`text-xs font-medium rounded-lg px-3 py-1.5 border focus:ring-2 focus:ring-blue-500 ${getStatusColor(task.status)} cursor-pointer`}
                        disabled={!(task.createdBy === user?.id || task.assignedTo === user?.id || user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce')}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_progreso">En Progreso</option>
                        <option value="completado">Completado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 min-w-[100px]">
                      {task.estimatedDate 
                        ? new Date(task.estimatedDate).toLocaleDateString()
                        : 'No definida'
                      }
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex space-x-1 justify-end">
                        <Link
                          to={`/tasks/${task.id}`}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/tasks/${task.id}?tab=comments`}
                          className="text-green-600 hover:text-green-800 p-1 rounded"
                          title="Comentarios"
                        >
                          <ChatBubbleLeftIcon className="h-4 w-4" />
                        </Link>
                        {(task.createdBy === user?.id || task.assignedTo === user?.id || user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce') && (
                          <Link
                            to={`/tasks/${task.id}/edit`}
                            className="text-yellow-600 hover:text-yellow-800 p-1 rounded"
                            title="Editar"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                        )}
                        {(task.createdBy === user?.id || user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce') && (
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded"
                            title="Eliminar"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                {/* Task Header */}
                <div className="flex justify-between items-start mb-3">
                  <Link
                    to={`/tasks/${task.id}`}
                    className="text-lg font-medium text-gray-900 hover:text-blue-600 flex-1 mr-4"
                  >
                    {task.title}
                  </Link>
                  <div className="flex space-x-2 flex-shrink-0">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Ver detalles"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    {(task.createdBy === user?.id || task.assignedTo === user?.id || user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce') && (
                      <Link
                        to={`/tasks/${task.id}/edit`}
                        className="text-yellow-600 hover:text-yellow-800 p-1"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Task Description */}
                {task.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Task Info Grid */}
                <div className="grid grid-cols-1 gap-3 text-sm mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Proyecto:</span>
                    <Link
                      to={`/projects/${task.project?.id}`}
                      className="text-blue-600 hover:text-blue-800 truncate max-w-[180px]"
                    >
                      {task.project?.name}
                    </Link>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Fecha estimada:</span>
                    <span className="text-gray-900">
                      {task.estimatedDate 
                        ? new Date(task.estimatedDate).toLocaleDateString()
                        : 'No definida'
                      }
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Asignado a:</span>
                    <div className="flex items-center">
                      {task.assignee ? (
                        <>
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs font-medium text-white">
                              {task.assignee.firstName?.charAt(0)}{task.assignee.lastName?.charAt(0)}
                            </span>
                          </div>
                          <span className="text-gray-900 text-sm truncate max-w-[120px]">
                            {task.assignee.firstName} {task.assignee.lastName}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-500 text-sm">Sin asignar</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Prioridad:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                {/* Status Control */}
                <div>
                  <span className="text-gray-500 font-medium text-sm block mb-2">Estado:</span>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`text-sm font-medium rounded-lg px-4 py-2 border focus:ring-2 focus:ring-blue-500 w-full ${getStatusColor(task.status)}`}
                    disabled={!(task.createdBy === user?.id || task.assignedTo === user?.id || user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce')}
                  >
                    <option value="pendiente">📋 Pendiente</option>
                    <option value="en_progreso">⚡ En Progreso</option>
                    <option value="completado">✅ Completado</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <FunnelIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron tareas
              </h3>
              <p className="text-gray-500 mb-6">
                {tasks.length === 0
                  ? 'Aún no hay tareas creadas.'
                  : 'Intenta ajustar los filtros de búsqueda.'}
              </p>
              {tasks.length === 0 && (
                <Link to="/tasks/new" className="btn-primary">
                  Crear primera tarea
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;