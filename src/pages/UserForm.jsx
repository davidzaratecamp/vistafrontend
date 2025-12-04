import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  UserPlusIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import userService from '../services/userService';
import useAuthStore from '../store/authStore';

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'workforce',
    managerId: '',
    isActive: true
  });

  const [availableManagers, setAvailableManagers] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing && id) {
      fetchUser();
    } else {
      fetchInitialData();
      setIsLoadingData(false);
    }
  }, [id, isEditing, user?.id]);

  const fetchInitialData = async () => {
    try {
      // Fetch potential managers based on current user's role
      const users = await userService.getUsers();

      let managers = [];
      if (user?.role === 'jefe_desarrollo') {
        // Development heads can assign themselves or other development heads
        managers = users.filter(u => u.role === 'jefe_desarrollo' && u.id !== id);
      } else if (user?.role === 'jefe_workforce') {
        // Workforce heads can assign themselves or other workforce heads
        managers = users.filter(u => u.role === 'jefe_workforce' && u.id !== id);
      }

      setAvailableManagers(managers);

      // Set current user as default manager and correct default role for new users
      if (!isEditing && user) {
        const defaultRole = user.role === 'jefe_workforce' ? 'workforce' : 'desarrollador';
        setFormData(prev => ({
          ...prev,
          managerId: user.id.toString(),
          role: defaultRole
        }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchUser = async () => {
    try {
      // Fetch both user data and available managers
      const [userData, users] = await Promise.all([
        userService.getUser(id),
        userService.getUsers()
      ]);

      // Set available managers based on current user role
      let managers = [];
      if (user?.role === 'jefe_desarrollo') {
        managers = users.filter(u => u.role === 'jefe_desarrollo' && u.id !== parseInt(id));
      } else if (user?.role === 'jefe_workforce') {
        managers = users.filter(u => u.role === 'jefe_workforce' && u.id !== parseInt(id));
      }
      setAvailableManagers(managers);

      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        password: '', // Never pre-fill password
        role: userData.role || 'desarrollador',
        managerId: userData.managerId?.toString() || '',
        isActive: userData.isActive !== undefined ? userData.isActive : true
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        managerId: formData.managerId ? parseInt(formData.managerId) : null
      };

      // Don't send empty password on edit
      if (isEditing && !submitData.password) {
        delete submitData.password;
      }

      if (isEditing) {
        await userService.updateUser(id, submitData);
      } else {
        await userService.createUser(submitData);
      }

      navigate('/users');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCancel = () => {
    navigate('/users');
  };

  const getRoleOptions = () => {
    const allRoles = [
      { value: 'jefe_desarrollo', label: 'Jefe de Desarrollo', icon: '👨‍💼' },
      { value: 'jefe_workforce', label: 'Jefe de Workforce', icon: '👔' },
      { value: 'desarrollador', label: 'Desarrollador', icon: '💻' },
      { value: 'workforce', label: 'Workforce', icon: '⚡' }
    ];

    // Filter based on current user's role
    if (user?.role === 'jefe_desarrollo') {
      return allRoles.filter(role => role.value === 'desarrollador');
    } else if (user?.role === 'jefe_workforce') {
      return allRoles.filter(role => role.value === 'workforce');
    }

    // For admin/superusers (if any) or initial setup
    return allRoles;
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
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

  const roleOptions = getRoleOptions();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl shadow-xl">
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
                {isEditing ? (
                  <PencilIcon className="h-7 w-7 text-white" />
                ) : (
                  <UserPlusIcon className="h-7 w-7 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h1>
                <p className="text-blue-100 text-sm">
                  {isEditing ? 'Modifica la información del usuario' : 'Crea un nuevo usuario del equipo'}
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
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="Ingresa el nombre"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="Ingresa el apellido"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
              placeholder="usuario@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña {!isEditing && <span className="text-red-500">*</span>}
              {isEditing && <span className="text-gray-500 text-xs">(dejar en blanco para mantener actual)</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                required={!isEditing}
                className="w-full px-4 py-3 pr-20 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder={isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}
                value={formData.password}
                onChange={handleChange}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                  title="Generar contraseña"
                >
                  Gen
                </button>
              </div>
            </div>
          </div>

          {/* Role and Manager */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                Rol <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                value={formData.role}
                onChange={handleChange}
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="managerId" className="block text-sm font-semibold text-gray-700 mb-2">
                Jefe/Supervisor
              </label>
              <select
                id="managerId"
                name="managerId"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                value={formData.managerId}
                onChange={handleChange}
              >
                <option value="">Sin jefe asignado</option>
                {availableManagers.map(manager => (
                  <option key={manager.id} value={manager.id}>
                    {manager.firstName} {manager.lastName} ({manager.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          {isEditing && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Usuario activo
              </label>
            </div>
          )}

          {/* Buttons */}
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
                  {isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
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

export default UserForm;