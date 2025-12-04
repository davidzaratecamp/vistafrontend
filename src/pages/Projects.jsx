import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import projectService from '../services/projectService';
import useAuthStore from '../store/authStore';

const Projects = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: ''
  });

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'activo', label: 'Activo' },
    { value: 'en_pausa', label: 'En pausa' },
    { value: 'terminado', label: 'Terminado' }
  ];

  const priorityOptions = [
    { value: '', label: 'Todas las prioridades' },
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' }
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [projects, filters]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = projects;

    if (filters.search) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(project => project.priority === filters.priority);
    }

    setFilteredProjects(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      try {
        await projectService.deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } catch (err) {
        alert('Error al eliminar el proyecto: ' + err.message);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'en_pausa':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminado':
        return 'bg-gray-100 text-gray-800';
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
            <h3 className="text-red-800 font-semibold">Error al cargar proyectos</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header con estadísticas */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 rounded-3xl shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-xl">📁</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Proyectos
                  </h1>
                  <p className="text-indigo-100 text-sm">
                    {filteredProjects.length} {filteredProjects.length === 1 ? 'proyecto' : 'proyectos'} {filters.search || filters.status || filters.priority ? 'encontrados' : 'activos'}
                  </p>
                </div>
              </div>
              <p className="text-white/90 max-w-md">
                Gestiona y organiza todos los proyectos de tu equipo
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                to="/tasks/new" 
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-white/20"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Nueva Tarea
              </Link>
              {(user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce' || user?.role === 'desarrollador' || user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce') && (
                <Link 
                  to="/projects/new" 
                  className="inline-flex items-center px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nuevo Proyecto
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
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
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <div key={project.id} className="group relative overflow-hidden bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            {/* Background gradient based on status */}
            <div className={`absolute inset-0 opacity-5 ${
              project.status === 'activo' ? 'bg-gradient-to-br from-emerald-400 to-green-600' :
              project.status === 'en_pausa' ? 'bg-gradient-to-br from-amber-400 to-orange-600' :
              'bg-gradient-to-br from-gray-400 to-gray-600'
            }`}></div>
            
            {/* Content */}
            <div className="relative">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      project.status === 'activo' ? 'bg-emerald-100 text-emerald-800' :
                      project.status === 'en_pausa' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status === 'activo' ? '🟢 Activo' :
                       project.status === 'en_pausa' ? '🟡 En pausa' : '⚫ Terminado'}
                    </span>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      project.priority === 'critica' ? 'bg-red-100 text-red-800' :
                      project.priority === 'alta' ? 'bg-orange-100 text-orange-800' :
                      project.priority === 'media' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.priority === 'critica' ? '🔴 Crítica' :
                       project.priority === 'alta' ? '🟠 Alta' :
                       project.priority === 'media' ? '🔵 Media' : '⚪ Baja'}
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Link
                    to={`/projects/${project.id}`}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Ver proyecto"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </Link>
                  {(user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce' || project.createdBy === user?.id) && (
                    <>
                      <Link
                        to={`/projects/${project.id}/edit`}
                        className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                        title="Editar proyecto"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Eliminar proyecto"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              {/* Project Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">📅 Inicio:</span>
                  <span className="font-medium text-gray-700">
                    {new Date(project.startDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                {project.endDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">🎯 Fin:</span>
                    <span className="font-medium text-gray-700">
                      {new Date(project.endDate).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">👤 Creador:</span>
                  <span className="font-medium text-gray-700 truncate ml-2">
                    {project.creator?.firstName} {project.creator?.lastName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">👥 Miembros:</span>
                  <span className="font-bold text-indigo-600">
                    {project.members?.length || 0}
                  </span>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="pt-3 border-t border-gray-200/50">
                <div className="flex items-center justify-center">
                  <Link 
                    to={`/projects/${project.id}`}
                    className="w-full text-center py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                  >
                    Ver detalles →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <FunnelIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            No se encontraron proyectos
          </h3>
          <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
            {projects.length === 0
              ? 'Aún no hay proyectos creados. ¡Comienza creando tu primer proyecto!'
              : 'No hay proyectos que coincidan con tus filtros. Intenta ajustar la búsqueda.'}
          </p>
          {(user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce' || user?.role === 'desarrollador') && projects.length === 0 && (
            <Link 
              to="/projects/new" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Crear primer proyecto
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Projects;