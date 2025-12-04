import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import userService from '../services/userService';
import useAuthStore from '../store/authStore';

const Users = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await userService.getUsers();
      setUsers(usersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${userName}?`)) {
      try {
        await userService.deleteUser(userId);
        await fetchUsers();
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

  const canCreateUser = user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce';
  const canManageUser = (targetUser) => {
    if (user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce') return true;
    return targetUser.managerId === user?.id;
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <UsersIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
                <p className="text-blue-100">
                  {user?.role === 'jefe_desarrollo' 
                    ? 'Administra el equipo de Desarrollo' 
                    : user?.role === 'jefe_workforce'
                    ? 'Administra el equipo de Workforce'
                    : 'Administra usuarios y permisos del equipo'
                  }
                </p>
              </div>
            </div>

            {canCreateUser && (
              <Link
                to="/users/new"
                className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Nuevo Usuario
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${showFilters
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filtros
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filtrar por Rol
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="">Todos los roles</option>
                  {user?.role === 'jefe_desarrollo' ? (
                    <>
                      <option value="jefe_desarrollo">Jefe de Desarrollo</option>
                      <option value="desarrollador">Desarrollador</option>
                    </>
                  ) : user?.role === 'jefe_workforce' ? (
                    <>
                      <option value="jefe_workforce">Jefe de Workforce</option>
                      <option value="workforce">Workforce</option>
                    </>
                  ) : (
                    <>
                      <option value="jefe_desarrollo">Jefe de Desarrollo</option>
                      <option value="jefe_workforce">Jefe de Workforce</option>
                      <option value="desarrollador">Desarrollador</option>
                      <option value="workforce">Workforce</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('');
                  }}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((userData) => {
          const roleConfig = getRoleConfig(userData.role);
          return (
            <div
              key={userData.id}
              className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {userData.firstName} {userData.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{userData.email}</p>
                  </div>
                </div>

                {canManageUser(userData) && userData.id !== user?.id && (
                  <div className="flex items-center space-x-1">
                    <Link
                      to={`/users/${userData.id}/edit`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(userData.id, `${userData.firstName} ${userData.lastName}`)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Rol:</span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${roleConfig.bg} ${roleConfig.color}`}>
                    <span className="mr-1">{roleConfig.icon}</span>
                    {roleConfig.label}
                  </span>
                </div>

                {userData.manager && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Jefe:</span>
                    <span className="text-sm font-medium text-gray-700">
                      {userData.manager.firstName} {userData.manager.lastName}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Estado:</span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${userData.isActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}>
                    {userData.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  to={`/users/${userData.id}`}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <UserCircleIcon className="h-4 w-4 mr-1" />
                  Ver Perfil
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron usuarios</h3>
          <p className="text-gray-500">
            {searchTerm || roleFilter
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No hay usuarios para mostrar'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Users;