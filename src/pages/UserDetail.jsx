import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import userService from '../services/userService';
import taskService from '../services/taskService';
import useAuthStore from '../store/authStore';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const [userData, tasksData] = await Promise.all([
        userService.getUser(id),
        taskService.getTasks({ assignedTo: id }).catch(() => [])
      ]);

      setUser(userData);
      setUserTasks(tasksData);

      // If user is a manager, fetch their team
      if (userData.role === 'jefe_desarrollo' || userData.role === 'jefe_workforce') {
        try {
          const teamData = await userService.getUsers({ managerId: id });
          setTeam(teamData);
        } catch (err) {
          console.error('Error fetching team:', err);
        }
      }

      // Calculate user stats
      const userStats = {
        totalTasks: tasksData.length,
        completedTasks: tasksData.filter(task => task.status === 'completado').length,
        pendingTasks: tasksData.filter(task => task.status === 'pendiente').length,
        inProgressTasks: tasksData.filter(task => task.status === 'en_progreso').length
      };
      setStats(userStats);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${user.firstName} ${user.lastName}?`)) {
      try {
        await userService.deleteUser(id);
        navigate('/users');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const getRoleConfig = (role) => {
    const configs = {
      jefe_desarrollo: {
        label: 'Jefe de Desarrollo',
        color: 'text-blue-600',
        bg: 'bg-blue-100',
        icon: '👨‍💼'
      },
      jefe_workforce: {
        label: 'Jefe de Workforce',
        color: 'text-purple-600',
        bg: 'bg-purple-100',
        icon: '👔'
      },
      desarrollador: {
        label: 'Desarrollador',
        color: 'text-indigo-600',
        bg: 'bg-indigo-100',
        icon: '💻'
      },
      workforce: {
        label: 'Workforce',
        color: 'text-green-600',
        bg: 'bg-green-100',
        icon: '⚡'
      }
    };
    return configs[role] || configs.desarrollador;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pendiente: { 
        color: 'text-amber-600', 
        bg: 'bg-amber-100', 
        label: 'Pendiente'
      },
      en_progreso: { 
        color: 'text-blue-600', 
        bg: 'bg-blue-100', 
        label: 'En Progreso'
      },
      completado: { 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-100', 
        label: 'Completado'
      }
    };
    return configs[status] || configs.pendiente;
  };

  const canManage = () => {
    if (!currentUser || !user) return false;
    return (
      currentUser.role === 'jefe_desarrollo' || 
      currentUser.role === 'jefe_workforce' || 
      user.managerId === currentUser.id
    );
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

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Usuario no encontrado</div>
      </div>
    );
  }

  const roleConfig = getRoleConfig(user.role);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/users')}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-white">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-blue-100 flex items-center">
                    <span className="mr-2">{roleConfig.icon}</span>
                    {roleConfig.label}
                  </p>
                </div>
              </div>
            </div>
            
            {canManage() && user.id !== currentUser?.id && (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/users/${user.id}/edit`}
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
        {/* User Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Info */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Correo Electrónico</div>
                  <div className="font-medium">{user.email}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <BuildingOffice2Icon className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Rol</div>
                  <span className={`inline-flex items-center px-2 py-1 text-sm font-semibold rounded-full ${roleConfig.bg} ${roleConfig.color}`}>
                    <span className="mr-1">{roleConfig.icon}</span>
                    {roleConfig.label}
                  </span>
                </div>
              </div>

              {user.manager && (
                <div className="flex items-center space-x-3">
                  <UserCircleIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Jefe/Supervisor</div>
                    <div className="font-medium">
                      {user.manager.firstName} {user.manager.lastName}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Fecha de Registro</div>
                  <div className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                <div>
                  <div className="text-sm text-gray-500">Estado</div>
                  <div className="font-medium">
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Tareas Recientes</h2>
            {userTasks.length > 0 ? (
              <div className="space-y-3">
                {userTasks.slice(0, 5).map((task) => {
                  const statusConfig = getStatusConfig(task.status);
                  return (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                      <div className="flex-1">
                        <Link
                          to={`/tasks/${task.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {task.title}
                        </Link>
                        <div className="text-sm text-gray-500">
                          {task.project?.name}
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  );
                })}
                {userTasks.length > 5 && (
                  <Link
                    to="/tasks"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Ver todas las tareas →
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay tareas asignadas</p>
            )}
          </div>

          {/* Team Members (if user is a manager) */}
          {team.length > 0 && (
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Equipo a Cargo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {team.map((member) => {
                  const memberRoleConfig = getRoleConfig(member.role);
                  return (
                    <Link
                      key={member.id}
                      to={`/users/${member.id}`}
                      className="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {memberRoleConfig.label}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Task Statistics */}
          {stats && (
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Estadísticas de Tareas
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total de Tareas</span>
                  <span className="font-bold text-2xl text-gray-900">{stats.totalTasks}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-600">Completadas</span>
                    <span className="font-semibold text-emerald-600">{stats.completedTasks}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-600">En Progreso</span>
                    <span className="font-semibold text-blue-600">{stats.inProgressTasks}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-amber-600">Pendientes</span>
                    <span className="font-semibold text-amber-600">{stats.pendingTasks}</span>
                  </div>
                </div>

                {stats.totalTasks > 0 && (
                  <div className="pt-4">
                    <div className="text-sm text-gray-500 mb-2">Progreso General</div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((stats.completedTasks / stats.totalTasks) * 100)}% completado
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Team Stats (if user is a manager) */}
          {team.length > 0 && (
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Equipo
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Miembros del Equipo</span>
                  <span className="font-bold text-2xl text-gray-900">{team.length}</span>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(
                    team.reduce((acc, member) => {
                      acc[member.role] = (acc[member.role] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([role, count]) => {
                    const roleConfig = getRoleConfig(role);
                    return (
                      <div key={role} className="flex items-center justify-between">
                        <span className={`text-sm ${roleConfig.color}`}>
                          {roleConfig.icon} {roleConfig.label}
                        </span>
                        <span className={`font-semibold ${roleConfig.color}`}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;