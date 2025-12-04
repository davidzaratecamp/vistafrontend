import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import dashboardService from '../services/dashboardService';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await dashboardService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
      <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-lg">⚠</span>
          </div>
          <div>
            <h3 className="text-red-800 font-semibold">Error al cargar el dashboard</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { summary, recentTasks, myProjects, tasksByStatus, recentActivity } = dashboardData;

  const stats = [
    {
      name: 'Proyectos Activos',
      value: summary.activeProjects,
      total: summary.totalProjects,
      icon: FolderIcon,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      percentage: Math.round((summary.activeProjects / (summary.totalProjects || 1)) * 100)
    },
    {
      name: 'Tareas Pendientes',
      value: summary.pendingTasks,
      total: summary.totalTasks,
      icon: ClockIcon,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-100',
      percentage: Math.round((summary.pendingTasks / (summary.totalTasks || 1)) * 100)
    },
    {
      name: 'En Progreso',
      value: summary.inProgressTasks,
      total: summary.totalTasks,
      icon: ArrowTrendingUpIcon,
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-100',
      percentage: Math.round((summary.inProgressTasks / (summary.totalTasks || 1)) * 100)
    },
    {
      name: 'Completadas',
      value: summary.completedTasks,
      total: summary.totalTasks,
      icon: CheckCircleIcon,
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-100',
      percentage: Math.round((summary.completedTasks / (summary.totalTasks || 1)) * 100)
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header con gradiente */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-xl">👋</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    ¡Hola, {user?.firstName}!
                  </h1>
                  <p className="text-blue-100 text-sm">
                    {new Date().toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <p className="text-white/90 max-w-md">
                Gestiona tus proyectos y tareas de manera eficiente
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {(user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce') && (
                <Link
                  to="/projects/new"
                  className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nuevo Proyecto
                </Link>
              )}
              <Link
                to="/tasks/new"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Nueva Tarea
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}></div>
            
            {/* Content */}
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-600">
                    {stat.percentage}%
                  </div>
                  <div className="text-xs text-gray-500">del total</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">
                  {stat.name}
                </h3>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </span>
                  {stat.total && (
                    <span className="text-lg text-gray-500">
                      / {stat.total}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-2 bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${stat.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Tareas Recientes */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Tareas Recientes</h3>
            </div>
            <Link 
              to="/tasks" 
              className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Ver todas →
            </Link>
          </div>
          <div className="space-y-4">
            {recentTasks.slice(0, 5).map((task, index) => (
              <div key={task.id} className="group p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="block font-semibold text-gray-900 group-hover:text-blue-600 transition-colors"
                    >
                      {task.title}
                    </Link>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-sm text-gray-500">
                        📁 {task.project?.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <span
                      className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                        task.status === 'completado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : task.status === 'en_progreso'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {task.status === 'completado' ? '✅ Completado' : 
                       task.status === 'en_progreso' ? '⏳ En progreso' : '📋 Pendiente'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mis Proyectos */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                <FolderIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Mis Proyectos</h3>
            </div>
            <Link 
              to="/projects" 
              className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Ver todos →
            </Link>
          </div>
          <div className="space-y-4">
            {myProjects.slice(0, 5).map((project) => (
              <div key={project.id} className="group p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <Link
                    to={`/projects/${project.id}`}
                    className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors"
                  >
                    {project.name}
                  </Link>
                  <span
                    className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                      project.status === 'activo'
                        ? 'bg-emerald-100 text-emerald-800'
                        : project.status === 'en_pausa'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {project.status === 'activo' ? '🟢 Activo' : 
                     project.status === 'en_pausa' ? '🟡 En pausa' : '⚫ Terminado'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-gray-700">
                      {project.taskStats?.pendiente || 0}
                    </div>
                    <div className="text-xs text-gray-500">Pendientes</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-amber-700">
                      {project.taskStats?.en_progreso || 0}
                    </div>
                    <div className="text-xs text-gray-500">En progreso</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-emerald-700">
                      {project.taskStats?.completado || 0}
                    </div>
                    <div className="text-xs text-gray-500">Completadas</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
            <ChartBarIcon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Actividad Reciente</h3>
        </div>
        
        <div className="flow-root">
          <ul className="space-y-4">
            {recentActivity.slice(0, 8).map((activity, idx) => (
              <li key={idx} className="group">
                <div className="relative flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50/50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">
                        {activity.user?.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">
                        <span className="font-semibold text-gray-900">{activity.user}</span>{' '}
                        <span className="text-gray-600">{activity.action} la tarea</span>{' '}
                        <span className="font-medium text-gray-900">"{activity.title}"</span>
                        {activity.project && (
                          <span className="text-gray-600"> en <span className="font-medium">{activity.project}</span></span>
                        )}
                      </p>
                      <time className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {new Date(activity.timestamp).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </time>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;