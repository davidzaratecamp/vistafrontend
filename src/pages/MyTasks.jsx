import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClockIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import taskService from '../services/taskService';
import useAuthStore from '../store/authStore';

const MyTasks = () => {
  const { user } = useAuthStore();
  const [myTasks, setMyTasks] = useState([]);
  const [taskStats, setTaskStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyTasks();
    fetchTaskStats();
  }, []);

  const fetchMyTasks = async () => {
    try {
      setIsLoading(true);
      const data = await taskService.getMyTasks();
      setMyTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTaskStats = async () => {
    try {
      const stats = await taskService.getTaskStats();
      setTaskStats(stats);
    } catch (err) {
      console.error('Error fetching task stats:', err);
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

  const filteredTasks = myTasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const stats = taskStats ? [
    {
      name: 'Pendientes',
      value: taskStats.pendiente,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      filter: 'pendiente'
    },
    {
      name: 'En Progreso',
      value: taskStats.en_progreso,
      icon: ArrowTrendingUpIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      filter: 'en_progreso'
    },
    {
      name: 'Completadas',
      value: taskStats.completado,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      filter: 'completado'
    },
    {
      name: 'Total',
      value: taskStats.total,
      icon: ExclamationTriangleIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      filter: 'all'
    }
  ] : [];

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
          <h1 className="text-2xl font-bold text-gray-900">Mis Tareas</h1>
          <p className="text-gray-600">Tareas asignadas a mí o creadas por mí</p>
        </div>
        <Link to="/tasks/new" className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Nueva Tarea
        </Link>
      </div>

      {taskStats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <button
              key={stat.name}
              onClick={() => setFilter(stat.filter)}
              className={`card hover:shadow-md transition-shadow text-left ${
                filter === stat.filter ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            {filter === 'all' ? 'Todas las tareas' : `Tareas ${filter}`}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('pendiente')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'pendiente'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilter('en_progreso')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'en_progreso'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              En Progreso
            </button>
            <button
              onClick={() => setFilter('completado')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'completado'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Completadas
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <Link
                    to={`/tasks/${task.id}`}
                    className="text-lg font-medium text-gray-900 hover:text-blue-600"
                  >
                    {task.title}
                  </Link>
                  <p className="text-sm text-gray-600">
                    Proyecto: <Link 
                      to={`/projects/${task.project?.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {task.project?.name}
                    </Link>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>

              {task.description && (
                <p className="text-gray-600 text-sm mb-3">
                  {task.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex space-x-4">
                  {task.estimatedDate && (
                    <span>
                      Estimada: {new Date(task.estimatedDate).toLocaleDateString()}
                    </span>
                  )}
                  {task.completedDate && (
                    <span>
                      Completada: {new Date(task.completedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <span>
                  Actualizada: {new Date(task.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes tareas {filter === 'all' ? '' : filter}
              </h3>
              <p className="text-gray-500 mb-6">
                {filter === 'all' 
                  ? 'Aún no tienes tareas asignadas.'
                  : `No tienes tareas con estado "${filter}".`
                }
              </p>
              {filter === 'all' && (
                <Link to="/tasks/new" className="btn-primary">
                  Crear nueva tarea
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTasks;