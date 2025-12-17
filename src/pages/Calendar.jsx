import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  CalendarDaysIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import useAuthStore from '../store/authStore';

const Calendar = () => {
  const { user } = useAuthStore();
  const calendarRef = useRef(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    showProjects: true,
    showTasks: true,
    taskStatus: 'all', // all, pendiente, en_progreso, completado
    projectStatus: 'all' // all, activo, en_pausa, terminado
  });

  useEffect(() => {
    fetchData();
    
    // Auto scroll to calendar after component mounts
    const scrollToCalendar = () => {
      if (calendarRef.current) {
        calendarRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    };

    // Wait for calendar to render, then scroll
    const timer = setTimeout(scrollToCalendar, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (tasks.length > 0 || projects.length > 0) {
      generateEvents();
    }
  }, [tasks, projects, filters]);

  const fetchData = async () => {
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

  const generateEvents = () => {
    const calendarEvents = [];

    // Add task events
    if (filters.showTasks) {
      const filteredTasks = tasks.filter(task => {
        if (filters.taskStatus === 'all') return true;
        return task.status === filters.taskStatus;
      });

      const taskEvents = filteredTasks.map(task => {
        const baseEvent = {
          id: `task-${task.id}`,
          title: `📋 ${task.title}`,
          extendedProps: {
            type: 'task',
            task: task,
            description: task.description,
            status: task.status,
            priority: task.priority,
            project: task.project
          },
          allDay: true
        };

        // Simple single-day events for tasks
        if (task.status === 'completado' && task.completedDate) {
          baseEvent.start = task.completedDate;
          baseEvent.title = `✅ ${task.title}`;
        } else if (task.estimatedDate) {
          baseEvent.start = task.estimatedDate;
          baseEvent.title = `📋 ${task.title}`;
        } else {
          baseEvent.start = task.createdAt;
          baseEvent.title = `📋 ${task.title}`;
        }

        // Set color based on status and priority
        if (task.status === 'completado') {
          baseEvent.backgroundColor = '#10b981'; // emerald-500
          baseEvent.borderColor = '#059669'; // emerald-600
        } else if (task.status === 'en_progreso') {
          baseEvent.backgroundColor = '#3b82f6'; // blue-500
          baseEvent.borderColor = '#2563eb'; // blue-600
        } else {
          // Pending tasks - color by priority
          switch (task.priority) {
            case 'critica':
              baseEvent.backgroundColor = '#ef4444'; // red-500
              baseEvent.borderColor = '#dc2626'; // red-600
              break;
            case 'alta':
              baseEvent.backgroundColor = '#f97316'; // orange-500
              baseEvent.borderColor = '#ea580c'; // orange-600
              break;
            case 'media':
              baseEvent.backgroundColor = '#eab308'; // yellow-500
              baseEvent.borderColor = '#ca8a04'; // yellow-600
              break;
            case 'baja':
              baseEvent.backgroundColor = '#6b7280'; // gray-500
              baseEvent.borderColor = '#4b5563'; // gray-600
              break;
            default:
              baseEvent.backgroundColor = '#6b7280'; // gray-500
              baseEvent.borderColor = '#4b5563'; // gray-600
          }
        }

        return baseEvent;
      });

      calendarEvents.push(...taskEvents);
    }

    // Add project events
    if (filters.showProjects) {
      const filteredProjects = projects.filter(project => {
        if (filters.projectStatus === 'all') return true;
        return project.status === filters.projectStatus;
      });

      const projectEvents = [];
      
      filteredProjects.forEach(project => {
        // Create start event
        if (project.startDate || project.createdAt) {
          const startEvent = {
            id: `project-${project.id}-start`,
            title: `🚀 ${project.name} (Inicio)`,
            start: project.startDate || project.createdAt,
            allDay: true,
            extendedProps: {
              type: 'project',
              project: project,
              description: project.description,
              status: project.status,
              priority: project.priority,
              eventType: 'start'
            }
          };

          // Set color for start events - always violet (light shade)
          startEvent.backgroundColor = '#c4b5fd'; // violet-300
          startEvent.borderColor = '#8b5cf6'; // violet-500
          projectEvents.push(startEvent);
        }

        // Create end event if exists
        if (project.endDate) {
          const endEvent = {
            id: `project-${project.id}-end`,
            title: `🏁 ${project.name} (Fin)`,
            start: project.endDate,
            allDay: true,
            extendedProps: {
              type: 'project',
              project: project,
              description: project.description,
              status: project.status,
              priority: project.priority,
              eventType: 'end'
            }
          };

          // Set color for end events - always violet (dark shade)
          endEvent.backgroundColor = '#7c3aed'; // violet-600
          endEvent.borderColor = '#5b21b6'; // violet-700
          projectEvents.push(endEvent);
        }
      });

      calendarEvents.push(...projectEvents);
    }

    setEvents(calendarEvents);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent({
      event: clickInfo.event,
      type: clickInfo.event.extendedProps.type,
      task: clickInfo.event.extendedProps.task,
      project: clickInfo.event.extendedProps.project
    });
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
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

  const getPriorityConfig = (priority) => {
    const configs = {
      baja: { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Baja' },
      media: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Media' },
      alta: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Alta' },
      critica: { color: 'text-red-600', bg: 'bg-red-100', label: 'Crítica' }
    };
    return configs[priority] || configs.media;
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
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <CalendarDaysIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Calendario de Proyectos y Tareas</h1>
              <p className="text-blue-100">
                Visualiza todos los proyectos y tareas con sus fechas en un calendario interactivo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Leyenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filtros de Tipo */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mostrar</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showProjects}
                onChange={(e) => handleFilterChange('showProjects', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700 font-medium">📁 Proyectos</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showTasks}
                onChange={(e) => handleFilterChange('showTasks', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700 font-medium">📋 Tareas</span>
            </label>
          </div>
        </div>

        {/* Filtros de Estado de Tareas */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Tareas</h3>
          <select
            value={filters.taskStatus}
            onChange={(e) => handleFilterChange('taskStatus', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_progreso">En Progreso</option>
            <option value="completado">Completadas</option>
          </select>
        </div>

        {/* Filtros de Estado de Proyectos */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Proyectos</h3>
          <select
            value={filters.projectStatus}
            onChange={(e) => handleFilterChange('projectStatus', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="en_pausa">En Pausa</option>
            <option value="terminado">Terminados</option>
          </select>
        </div>
      </div>

      {/* Leyenda de Colores */}
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leyenda de Colores</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tareas */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">📋 Tareas</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                <span className="text-xs text-gray-600">Completada</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-xs text-gray-600">En Progreso</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-xs text-gray-600">Pendiente (Crítica)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-xs text-gray-600">Pendiente (Alta)</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">&nbsp;</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-xs text-gray-600">Pendiente (Media)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span className="text-xs text-gray-600">Pendiente (Baja)</span>
              </div>
            </div>
          </div>

          {/* Proyectos */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">📁 Proyectos (Siempre Morado)</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-violet-300 rounded"></div>
                <span className="text-xs text-gray-600">🚀 Inicio del Proyecto</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-violet-600 rounded"></div>
                <span className="text-xs text-gray-600">🏁 Fin del Proyecto</span>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">📊 Estadísticas</h4>
            <div className="space-y-1">
              <div className="text-xs text-gray-600">
                📋 Tareas: {tasks.filter(task => {
                  if (filters.taskStatus === 'all') return true;
                  return task.status === filters.taskStatus;
                }).length}
              </div>
              <div className="text-xs text-gray-600">
                📁 Proyectos: {projects.filter(project => {
                  if (filters.projectStatus === 'all') return true;
                  return project.status === filters.projectStatus;
                }).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div ref={calendarRef} className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          locale="es"
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
          }}
          dayNames={['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']}
          dayNamesShort={['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']}
          monthNames={[
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ]}
          monthNamesShort={[
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
          ]}
          eventDisplay="block"
          dayMaxEvents={3}
          moreLinkText="más"
        />
      </div>

      {/* Modal for Event Details */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedEvent.type === 'task' ? selectedEvent.task?.title : selectedEvent.project?.name}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Tipo:</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedEvent.type === 'task' ? 'bg-blue-100 text-blue-600' : 'bg-violet-100 text-violet-600'
                  }`}>
                    {selectedEvent.type === 'task' ? '📋 Tarea' : '📁 Proyecto'}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Descripción:</p>
                  <p className="text-gray-800">
                    {selectedEvent.type === 'task' 
                      ? selectedEvent.task?.description || 'Sin descripción'
                      : selectedEvent.project?.description || 'Sin descripción'
                    }
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Estado:</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedEvent.type === 'task' 
                        ? getStatusConfig(selectedEvent.task?.status).bg + ' ' + getStatusConfig(selectedEvent.task?.status).color
                        : selectedEvent.project?.status === 'activo' ? 'bg-green-100 text-green-600' :
                          selectedEvent.project?.status === 'en_pausa' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedEvent.type === 'task' 
                        ? getStatusConfig(selectedEvent.task?.status).label
                        : selectedEvent.project?.status === 'activo' ? 'Activo' :
                          selectedEvent.project?.status === 'en_pausa' ? 'En Pausa' : 'Terminado'
                      }
                    </span>
                  </div>
                  
                  {selectedEvent.type === 'task' && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Prioridad:</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityConfig(selectedEvent.task?.priority).bg} ${getPriorityConfig(selectedEvent.task?.priority).color}`}>
                        {getPriorityConfig(selectedEvent.task?.priority).label}
                      </span>
                    </div>
                  )}

                  {selectedEvent.type === 'project' && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Prioridad:</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityConfig(selectedEvent.project?.priority).bg} ${getPriorityConfig(selectedEvent.project?.priority).color}`}>
                        {getPriorityConfig(selectedEvent.project?.priority).label}
                      </span>
                    </div>
                  )}
                </div>

                {selectedEvent.type === 'task' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Proyecto:</p>
                    <p className="text-gray-800 font-medium">
                      {selectedEvent.task?.project?.name || 'Sin proyecto'}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-1">Fechas:</p>
                  <div className="text-gray-800">
                    {selectedEvent.type === 'task' ? (
                      <div className="space-y-1 text-sm">
                        {selectedEvent.task?.estimatedDate && (
                          <div>
                            <span className="font-medium">Estimada:</span> {new Date(selectedEvent.task.estimatedDate).toLocaleDateString()}
                          </div>
                        )}
                        {selectedEvent.task?.completedDate && (
                          <div>
                            <span className="font-medium">Completada:</span> {new Date(selectedEvent.task.completedDate).toLocaleDateString()}
                          </div>
                        )}
                        {!selectedEvent.task?.estimatedDate && !selectedEvent.task?.completedDate && (
                          <div>
                            <span className="font-medium">Creada:</span> {new Date(selectedEvent.task.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1 text-sm">
                        {selectedEvent.project?.startDate && (
                          <div>
                            <span className="font-medium">Inicio:</span> {new Date(selectedEvent.project.startDate).toLocaleDateString()}
                          </div>
                        )}
                        {selectedEvent.project?.endDate && (
                          <div>
                            <span className="font-medium">Fin:</span> {new Date(selectedEvent.project.endDate).toLocaleDateString()}
                          </div>
                        )}
                        {!selectedEvent.project?.startDate && (
                          <div>
                            <span className="font-medium">Creado:</span> {new Date(selectedEvent.project.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
                <Link
                  to={selectedEvent.type === 'task' ? `/tasks/${selectedEvent.task?.id}` : `/projects/${selectedEvent.project?.id}`}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={closeModal}
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Ver Detalle
                </Link>
                
                {selectedEvent.type === 'task' 
                  ? (selectedEvent.task?.createdBy === user?.id || selectedEvent.task?.assignedTo === user?.id || user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce') && (
                      <Link
                        to={`/tasks/${selectedEvent.task?.id}/edit`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                        onClick={closeModal}
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Editar
                      </Link>
                    )
                  : (selectedEvent.project?.createdBy === user?.id || user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce') && (
                      <Link
                        to={`/projects/${selectedEvent.project?.id}/edit`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                        onClick={closeModal}
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Editar
                      </Link>
                    )
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;