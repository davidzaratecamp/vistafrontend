import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import projectService from '../services/projectService';
import userService from '../services/userService';
import useAuthStore from '../store/authStore';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [workforceUsers, setWorkforceUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setIsLoading(true);
      const [projectData, statsData] = await Promise.all([
        projectService.getProject(id),
        projectService.getProjectStats(id)
      ]);
      setProject(projectData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      try {
        await projectService.deleteProject(id);
        navigate('/projects');
      } catch (err) {
        alert('Error al eliminar el proyecto: ' + err.message);
      }
    }
  };

  const fetchWorkforceUsers = async () => {
    try {
      const allUsers = await userService.getUsers();
      // Filter for workforce users (jefe_workforce and workforce)
      const workforce = allUsers.filter(user => 
        user.role === 'jefe_workforce' || user.role === 'workforce'
      );
      setWorkforceUsers(workforce);
    } catch (err) {
      console.error('Error fetching workforce users:', err);
    }
  };

  const handleAddMemberClick = () => {
    setShowAddMember(true);
    fetchWorkforceUsers();
  };

  const handleAssignToMe = async () => {
    try {
      const role = user.role === 'workforce' ? 'workforce' : 'desarrollador';
      await projectService.addMember(id, user.id, role);
      await fetchProjectData(); // Refresh project data
      setShowAddMember(false);
    } catch (err) {
      alert('Error al asignarte al proyecto: ' + err.message);
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUserId) return;
    
    try {
      const selectedUser = workforceUsers.find(u => u.id === parseInt(selectedUserId));
      const role = selectedUser.role === 'workforce' ? 'workforce' : 'desarrollador';
      
      await projectService.addMember(id, selectedUserId, role);
      await fetchProjectData(); // Refresh project data
      setShowAddMember(false);
      setSelectedUserId('');
    } catch (err) {
      alert('Error al asignar usuario: ' + err.message);
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
            <h3 className="text-red-800 font-semibold">Error al cargar el proyecto</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Proyecto no encontrado</p>
      </div>
    );
  }

  const canEdit = user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce' || user?.role === 'workforce' || project.createdBy === user?.id;

  return (
    <div className="space-y-8">
      {/* Header del Proyecto */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-600 via-gray-700 to-slate-800 rounded-3xl shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={() => navigate('/projects')}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">📁</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {project.name}
                    </h1>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                        project.status === 'activo' ? 'bg-emerald-100/90 text-emerald-800' :
                        project.status === 'en_pausa' ? 'bg-amber-100/90 text-amber-800' :
                        'bg-gray-100/90 text-gray-800'
                      }`}>
                        {project.status === 'activo' ? '🟢 Activo' :
                         project.status === 'en_pausa' ? '🟡 En pausa' : '⚫ Terminado'}
                      </span>
                      <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                        project.priority === 'critica' ? 'bg-red-100/90 text-red-800' :
                        project.priority === 'alta' ? 'bg-orange-100/90 text-orange-800' :
                        project.priority === 'media' ? 'bg-blue-100/90 text-blue-800' :
                        'bg-gray-100/90 text-gray-800'
                      }`}>
                        {project.priority === 'critica' ? '🔴 Crítica' :
                         project.priority === 'alta' ? '🟠 Alta' :
                         project.priority === 'media' ? '🔵 Media' : '⚪ Baja'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {project.description && (
                <p className="text-white/90 max-w-2xl">
                  {project.description}
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={`/tasks/new?projectId=${project.id}`}
                className="inline-flex items-center px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Nueva Tarea
              </Link>
              {canEdit && (
                <div className="flex gap-2">
                  <Link
                    to={`/projects/${project.id}/edit`}
                    className="inline-flex items-center px-4 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20"
                  >
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Editar
                  </Link>
                  <button
                    onClick={handleDeleteProject}
                    className="inline-flex items-center px-4 py-3 bg-red-500/20 backdrop-blur-sm text-red-100 font-semibold rounded-xl hover:bg-red-500/30 transition-all duration-200 border border-red-400/20"
                  >
                    <TrashIcon className="h-5 w-5 mr-2" />
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.total}</div>
            <div className="text-sm text-gray-600 font-medium">Total de Tareas</div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-gray-400 to-gray-600 h-2 rounded-full" style={{width: '100%'}}></div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">{stats.pendiente}</div>
            <div className="text-sm text-gray-600 font-medium">Pendientes</div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full" style={{width: `${stats.total ? (stats.pendiente / stats.total) * 100 : 0}%`}}></div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.en_progreso}</div>
            <div className="text-sm text-gray-600 font-medium">En Progreso</div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full" style={{width: `${stats.total ? (stats.en_progreso / stats.total) * 100 : 0}%`}}></div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">{stats.completado}</div>
            <div className="text-sm text-gray-600 font-medium">Completadas</div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full" style={{width: `${stats.total ? (stats.completado / stats.total) * 100 : 0}%`}}></div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Tareas del Proyecto */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Tareas del Proyecto</h3>
              </div>
              <Link
                to={`/tasks?projectId=${project.id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Ver todas →
              </Link>
            </div>

            <div className="space-y-4">
              {project.tasks?.slice(0, 8).map((task) => (
                <div key={task.id} className="group p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200 bg-white/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="block font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2"
                      >
                        {task.title}
                      </Link>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full ${
                          task.status === 'completado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : task.status === 'en_progreso'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {task.status === 'completado' ? '✅ Completado' : 
                           task.status === 'en_progreso' ? '⏳ En progreso' : '📋 Pendiente'}
                        </span>
                        {task.assignee && (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {task.assignee.firstName?.charAt(0)}
                              </span>
                            </div>
                            <span className="text-xs text-gray-600 font-medium">
                              {task.assignee.firstName} {task.assignee.lastName}
                            </span>
                          </div>
                        )}
                      </div>
                      {task.estimatedDate && (
                        <div className="text-xs text-gray-500">
                          📅 Fecha estimada: {new Date(task.estimatedDate).toLocaleDateString('es-ES')}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                        title="Ver tarea"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      {(task.createdBy === user?.id || user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce' || user?.role === 'workforce') && (
                        <Link
                          to={`/tasks/${task.id}/edit`}
                          className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Editar tarea"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {(!project.tasks || project.tasks.length === 0) && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay tareas en este proyecto</h3>
                  <p className="text-gray-500 mb-6">Comienza agregando la primera tarea a tu proyecto.</p>
                  <Link
                    to={`/tasks/new?projectId=${project.id}`}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Crear primera tarea
                  </Link>
                </div>
              )}
              
              {project.tasks && project.tasks.length > 8 && (
                <div className="text-center pt-4">
                  <Link
                    to={`/tasks?projectId=${project.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                  >
                    Ver todas las {project.tasks.length} tareas →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Información del Proyecto */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Información del Proyecto</h3>
            </div>
            <dl className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <dt className="text-sm font-semibold text-gray-700">👤 Creado por</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {project.creator?.firstName} {project.creator?.lastName}
                </dd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
                <dt className="text-sm font-semibold text-gray-700">📅 Fecha de inicio</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {new Date(project.startDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </dd>
              </div>
              {project.endDate && (
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                  <dt className="text-sm font-semibold text-gray-700">🎯 Fecha de fin</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {new Date(project.endDate).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <dt className="text-sm font-semibold text-gray-700">🔄 Última actualización</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {new Date(project.updatedAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </dd>
              </div>
            </dl>
          </div>

          {/* Miembros del Equipo */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Miembros del Equipo</h3>
              </div>
              {canEdit && (
                <button 
                  onClick={handleAddMemberClick}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Agregar miembro"
                >
                  <UserPlusIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {project.members?.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-gray-600 capitalize font-medium">
                      {member.role}
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                </div>
              ))}
              
              {(!project.members || project.members.length === 0) && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">No hay miembros asignados</p>
                  <p className="text-xs text-gray-400 mt-1">Agrega miembros para colaborar en este proyecto</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Asignación de Miembros */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Asignar Miembro</h3>
            
            {/* Botón Asignarme a mí */}
            {!project.members?.some(member => member.id === user.id) && (
              <button
                onClick={handleAssignToMe}
                className="w-full mb-4 px-4 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors duration-200"
              >
                Asignarme a mí
              </button>
            )}

            {!project.members?.some(member => member.id === user.id) && workforceUsers.filter(workforceUser => !project.members?.some(member => member.id === workforceUser.id)).length > 0 && (
              <div className="text-center text-gray-500 text-sm mb-4">o</div>
            )}

            {/* Selector de usuarios */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar usuario de workforce:
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar usuario...</option>
                {workforceUsers
                  .filter(workforceUser => !project.members?.some(member => member.id === workforceUser.id))
                  .map((workforceUser) => (
                  <option key={workforceUser.id} value={workforceUser.id}>
                    {workforceUser.firstName} {workforceUser.lastName} ({workforceUser.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddMember(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignUser}
                disabled={!selectedUserId}
                className="flex-1 px-4 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;