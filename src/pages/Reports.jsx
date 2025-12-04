import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  FolderIcon,
  UsersIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import userService from '../services/userService';
import reportService from '../services/reportService';
import useAuthStore from '../store/authStore';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

const Reports = () => {
  const { user } = useAuthStore();
  const [taskStats, setTaskStats] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [tasksByProject, setTasksByProject] = useState([]);
  const [monthlyProgress, setMonthlyProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Excel reports state
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [reportPreview, setReportPreview] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    fetchReportsData();
    if (user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce') {
      fetchAvailableMonths();
    }
  }, []);

  const fetchReportsData = async () => {
    try {
      setIsLoading(true);
      
      const [tasksData, projectsData, usersData] = await Promise.all([
        taskService.getTasks(),
        projectService.getProjects(),
        userService.getUsers().catch(() => []) // May fail if user doesn't have permissions
      ]);

      // Calculate task statistics
      const taskStatistics = {
        total: tasksData.length,
        pendiente: tasksData.filter(t => t.status === 'pendiente').length,
        en_progreso: tasksData.filter(t => t.status === 'en_progreso').length,
        completado: tasksData.filter(t => t.status === 'completado').length,
        by_priority: {
          baja: tasksData.filter(t => t.priority === 'baja').length,
          media: tasksData.filter(t => t.priority === 'media').length,
          alta: tasksData.filter(t => t.priority === 'alta').length,
          critica: tasksData.filter(t => t.priority === 'critica').length
        }
      };

      // Calculate project statistics
      const projectStatistics = {
        total: projectsData.length,
        activo: projectsData.filter(p => p.status === 'activo').length,
        en_pausa: projectsData.filter(p => p.status === 'en_pausa').length,
        terminado: projectsData.filter(p => p.status === 'terminado').length
      };

      // Calculate user statistics (only if user has access)
      let userStatistics = null;
      if (usersData.length > 0) {
        userStatistics = {
          total: usersData.length,
          active: usersData.filter(u => u.isActive).length,
          inactive: usersData.filter(u => !u.isActive).length,
          by_role: {
            jefe_desarrollo: usersData.filter(u => u.role === 'jefe_desarrollo').length,
            jefe_workforce: usersData.filter(u => u.role === 'jefe_workforce').length,
            desarrollador: usersData.filter(u => u.role === 'desarrollador').length,
            workforce: usersData.filter(u => u.role === 'workforce').length
          }
        };
      }

      // Tasks by project
      const tasksByProj = projectsData.map(project => ({
        name: project.name,
        tasks: tasksData.filter(task => task.projectId === project.id).length
      })).filter(item => item.tasks > 0);

      // Monthly progress (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        
        const tasksCompleted = tasksData.filter(task => {
          if (!task.completedDate) return false;
          const completedDate = new Date(task.completedDate);
          return completedDate.getMonth() === date.getMonth() && 
                 completedDate.getFullYear() === date.getFullYear();
        }).length;

        monthlyData.push({
          month: monthName,
          completed: tasksCompleted
        });
      }

      setTaskStats(taskStatistics);
      setProjectStats(projectStatistics);
      setUserStats(userStatistics);
      setTasksByProject(tasksByProj);
      setMonthlyProgress(monthlyData);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableMonths = async () => {
    try {
      const months = await reportService.getAvailableMonths();
      setAvailableMonths(months.availableMonths);
      
      // Set current month as default and load its preview
      if (months.currentMonth) {
        const monthValue = `${months.currentMonth.year}-${months.currentMonth.month}`;
        setSelectedMonth(monthValue);
        await fetchReportPreview(months.currentMonth.year, months.currentMonth.month);
      }
    } catch (err) {
      console.error('Error fetching available months:', err);
    }
  };

  const handleMonthChange = async (monthValue) => {
    setSelectedMonth(monthValue);
    setReportPreview(null);
    
    if (monthValue) {
      const [year, month] = monthValue.split('-');
      await fetchReportPreview(parseInt(year), parseInt(month));
    }
  };

  const fetchReportPreview = async (year, month) => {
    try {
      setIsLoadingPreview(true);
      const preview = await reportService.getReportPreview(year, month);
      setReportPreview(preview);
    } catch (err) {
      setError('Error al obtener la vista previa del reporte');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!selectedMonth) return;
    
    try {
      setIsLoadingReport(true);
      const [year, month] = selectedMonth.split('-');
      await reportService.downloadMonthlyReport(parseInt(year), parseInt(month));
    } catch (err) {
      setError('Error al descargar el reporte: ' + err.message);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Chart configurations
  const taskStatusChartData = {
    labels: ['Pendiente', 'En Progreso', 'Completado'],
    datasets: [
      {
        data: taskStats ? [taskStats.pendiente, taskStats.en_progreso, taskStats.completado] : [],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)', // amber
          'rgba(59, 130, 246, 0.8)', // blue
          'rgba(16, 185, 129, 0.8)'  // emerald
        ],
        borderColor: [
          'rgb(251, 191, 36)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)'
        ],
        borderWidth: 2,
        hoverOffset: 10
      }
    ]
  };

  const taskPriorityChartData = {
    labels: ['Baja', 'Media', 'Alta', 'Crítica'],
    datasets: [
      {
        label: 'Tareas por Prioridad',
        data: taskStats ? [
          taskStats.by_priority.baja,
          taskStats.by_priority.media,
          taskStats.by_priority.alta,
          taskStats.by_priority.critica
        ] : [],
        backgroundColor: [
          'rgba(156, 163, 175, 0.8)', // gray
          'rgba(251, 191, 36, 0.8)',  // amber
          'rgba(249, 115, 22, 0.8)',  // orange
          'rgba(239, 68, 68, 0.8)'    // red
        ],
        borderColor: [
          'rgb(156, 163, 175)',
          'rgb(251, 191, 36)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const projectStatusChartData = {
    labels: ['Activo', 'En Pausa', 'Terminado'],
    datasets: [
      {
        data: projectStats ? [projectStats.activo, projectStats.en_pausa, projectStats.terminado] : [],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',  // green
          'rgba(251, 191, 36, 0.8)', // amber
          'rgba(156, 163, 175, 0.8)' // gray
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(156, 163, 175)'
        ],
        borderWidth: 2,
        hoverOffset: 10
      }
    ]
  };

  const userRoleChartData = {
    labels: ['Jefe Desarrollo', 'Jefe Workforce', 'Desarrollador', 'Workforce'],
    datasets: [
      {
        label: 'Usuarios por Rol',
        data: userStats ? [
          userStats.by_role.jefe_desarrollo,
          userStats.by_role.jefe_workforce,
          userStats.by_role.desarrollador,
          userStats.by_role.workforce
        ] : [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // blue
          'rgba(147, 51, 234, 0.8)',   // purple
          'rgba(99, 102, 241, 0.8)',   // indigo
          'rgba(34, 197, 94, 0.8)'     // green
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(147, 51, 234)',
          'rgb(99, 102, 241)',
          'rgb(34, 197, 94)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const userStatusChartData = {
    labels: ['Activos', 'Inactivos'],
    datasets: [
      {
        data: userStats ? [userStats.active, userStats.inactive] : [],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',  // green
          'rgba(156, 163, 175, 0.8)' // gray
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(156, 163, 175)'
        ],
        borderWidth: 2,
        hoverOffset: 10
      }
    ]
  };

  const tasksByProjectChartData = {
    labels: tasksByProject.map(item => item.name),
    datasets: [
      {
        label: 'Tareas por Proyecto',
        data: tasksByProject.map(item => item.tasks),
        backgroundColor: 'rgba(99, 102, 241, 0.8)', // indigo
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const monthlyProgressChartData = {
    labels: monthlyProgress.map(item => item.month),
    datasets: [
      {
        label: 'Tareas Completadas',
        data: monthlyProgress.map(item => item.completed),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8,
        padding: 12,
        displayColors: true
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
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
      <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl p-6">
        <div className="text-red-800 font-semibold mb-2">Error</div>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 rounded-3xl shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <ChartBarIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Reportes y Analíticas</h1>
              <p className="text-purple-100">
                Visualiza el progreso y rendimiento de tus proyectos y tareas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Tareas</p>
              <p className="text-3xl font-bold text-gray-900">{taskStats?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Proyectos Activos</p>
              <p className="text-3xl font-bold text-gray-900">{projectStats?.activo || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FolderIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tareas Completadas</p>
              <p className="text-3xl font-bold text-gray-900">{taskStats?.completado || 0}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Proyectos</p>
              <p className="text-3xl font-bold text-gray-900">{projectStats?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FolderIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {userStats && (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-3xl font-bold text-gray-900">{userStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Excel Reports Section - Only for department heads */}
      {(user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce') && (
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <DocumentArrowDownIcon className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">📊 Reportes Ejecutivos Excel</h3>
              <p className="text-sm text-gray-600">Descarga reportes detallados con datos profesionalmente estructurados</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Month Selection */}
            <div className="space-y-4">
              <div>
                <label htmlFor="monthSelect" className="block text-sm font-semibold text-gray-700 mb-2">
                  Seleccionar Mes
                </label>
                <select
                  id="monthSelect"
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">Selecciona un mes</option>
                  {availableMonths.map((month) => (
                    <option key={`${month.year}-${month.month}`} value={`${month.year}-${month.month}`}>
                      {month.label} {month.isCurrent && '(Mes Actual)'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMonth && (
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadReport}
                    disabled={isLoadingReport}
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isLoadingReport ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generando...
                      </>
                    ) : (
                      <>
                        <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                        Descargar Reporte Excel
                      </>
                    )}
                  </button>

                  <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                    <p className="font-semibold mb-1">📋 El reporte incluye:</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Resumen ejecutivo con KPIs</li>
                      <li>• Rendimiento por trabajador</li>
                      <li>• Detalles de proyectos y tareas</li>
                      <li>• Métricas por área</li>
                      <li>• Cronología de actividades</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Report Preview */}
            <div className="space-y-4">
              {isLoadingPreview && (
                <div className="flex justify-center items-center h-32">
                  <div className="relative">
                    <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                  </div>
                </div>
              )}

              {reportPreview && !isLoadingPreview && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <EyeIcon className="h-5 w-5 text-emerald-600" />
                    <h4 className="font-semibold text-emerald-800">Vista Previa del Reporte</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-emerald-700">Período:</span>
                      <span className="text-sm text-emerald-800">
                        {reportPreview.period.monthName} {reportPreview.period.year}
                      </span>
                    </div>

                    {reportPreview.hasData ? (
                      <>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">👥 Personal:</span>
                            <span className="font-semibold">{reportPreview.metrics.totalUsers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">📁 Proyectos:</span>
                            <span className="font-semibold">{reportPreview.metrics.totalProjects}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">📋 Tareas:</span>
                            <span className="font-semibold">{reportPreview.metrics.totalTasks}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">✅ Completadas:</span>
                            <span className="font-semibold text-emerald-600">{reportPreview.metrics.completedTasks}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-emerald-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-emerald-700">Tasa de Finalización:</span>
                            <span className="text-lg font-bold text-emerald-600">
                              {reportPreview.metrics.completionRate}%
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">No hay datos disponibles para este período</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedMonth && !reportPreview && !isLoadingPreview && (
                <div className="text-center py-8 text-gray-500">
                  <EyeIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Selecciona un mes para ver la vista previa</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Status Chart */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Estado de Tareas</h3>
          <div className="h-80">
            <Doughnut data={taskStatusChartData} options={chartOptions} />
          </div>
        </div>

        {/* Project Status Chart */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Estado de Proyectos</h3>
          <div className="h-80">
            <Doughnut data={projectStatusChartData} options={chartOptions} />
          </div>
        </div>

        {/* Task Priority Chart */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Prioridad de Tareas</h3>
          <div className="h-80">
            <Bar data={taskPriorityChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Tasks by Project Chart */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Tareas por Proyecto</h3>
          <div className="h-80">
            <Bar data={tasksByProjectChartData} options={barChartOptions} />
          </div>
        </div>

        {/* User Role Chart - Only show if user has access to user data */}
        {userStats && (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Distribución por Roles</h3>
            <div className="h-80">
              <Bar data={userRoleChartData} options={barChartOptions} />
            </div>
          </div>
        )}

        {/* User Status Chart - Only show if user has access to user data */}
        {userStats && (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Estado de Usuarios</h3>
            <div className="h-80">
              <Doughnut data={userStatusChartData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Monthly Progress Chart - Full Width */}
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-800">Progreso Mensual de Tareas Completadas</h3>
        </div>
        <div className="h-80">
          <Line data={monthlyProgressChartData} options={lineChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Reports;