import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  UserIcon,
  FlagIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import taskService from '../services/taskService';
import useAuthStore from '../store/authStore';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      setIsLoading(true);
      const taskData = await taskService.getTask(id);
      setTask(taskData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await taskService.deleteTask(id);
        navigate('/tasks');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      baja: { 
        color: 'text-gray-600', 
        bg: 'bg-gray-100', 
        icon: <FlagIcon className="h-4 w-4" />,
        label: 'Baja'
      },
      media: { 
        color: 'text-blue-600', 
        bg: 'bg-blue-100', 
        icon: <FlagIcon className="h-4 w-4" />,
        label: 'Media'
      },
      alta: { 
        color: 'text-orange-600', 
        bg: 'bg-orange-100', 
        icon: <ExclamationTriangleIcon className="h-4 w-4" />,
        label: 'Alta'
      },
      critica: { 
        color: 'text-red-600', 
        bg: 'bg-red-100', 
        icon: <ExclamationTriangleIcon className="h-4 w-4" />,
        label: 'Crítica'
      }
    };
    return configs[priority] || configs.media;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pendiente: { 
        color: 'text-amber-600', 
        bg: 'bg-amber-100', 
        icon: <ClockIcon className="h-4 w-4" />,
        label: 'Pendiente'
      },
      en_progreso: { 
        color: 'text-blue-600', 
        bg: 'bg-blue-100', 
        icon: <ClockIcon className="h-4 w-4" />,
        label: 'En Progreso'
      },
      completado: { 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-100', 
        icon: <CheckCircleIcon className="h-4 w-4" />,
        label: 'Completado'
      }
    };
    return configs[status] || configs.pendiente;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-indigo-600 rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl p-6">
        <div className="text-red-800 font-semibold mb-2">Error</div>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Tarea no encontrada</div>
      </div>
    );
  }

  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status);
  const canEdit = task.createdBy === user?.id || task.assignedTo === user?.id;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-3xl shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/tasks')}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{task.title}</h1>
                  <p className="text-blue-100 text-sm">
                    Proyecto: {task.project?.name}
                  </p>
                </div>
              </div>
            </div>
            
            {canEdit && (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/tasks/${task.id}/edit`}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                  <PencilIcon className="h-5 w-5" />
                </Link>
                <button
                  onClick={handleDelete}
                  className="p-2 text-white/70 hover:text-red-200 hover:bg-red-500/20 rounded-xl transition-all duration-200"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descripción */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Descripción</h2>
            <div className="text-gray-600">
              {task.description ? (
                <p className="whitespace-pre-wrap">{task.description}</p>
              ) : (
                <p className="italic text-gray-400">Sin descripción</p>
              )}
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Fechas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Fecha Estimada</div>
                  <div className="font-medium">
                    {task.estimatedDate ? 
                      new Date(task.estimatedDate).toLocaleDateString() : 
                      'No definida'
                    }
                  </div>
                </div>
              </div>
              
              {task.completedDate && (
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                  <div>
                    <div className="text-sm text-gray-500">Fecha de Finalización</div>
                    <div className="font-medium">
                      {new Date(task.completedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estado y Prioridad */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                  {statusConfig.icon}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Estado</div>
                  <div className={`font-semibold ${statusConfig.color}`}>
                    {statusConfig.label}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${priorityConfig.bg}`}>
                  {priorityConfig.icon}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Prioridad</div>
                  <div className={`font-semibold ${priorityConfig.color}`}>
                    {priorityConfig.label}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Asignación */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Asignación</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Asignado a</div>
                  <div className="font-medium">
                    {task.assignee ? 
                      `${task.assignee.firstName} ${task.assignee.lastName}` : 
                      'Sin asignar'
                    }
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <UserIcon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Creado por</div>
                  <div className="font-medium">
                    {task.creator ? 
                      `${task.creator.firstName} ${task.creator.lastName}` : 
                      'Usuario desconocido'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proyecto */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Proyecto</h3>
            <Link
              to={`/projects/${task.project?.id}`}
              className="block p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
            >
              <div className="font-semibold text-blue-800">{task.project?.name}</div>
              <div className="text-sm text-blue-600">Ver proyecto →</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;