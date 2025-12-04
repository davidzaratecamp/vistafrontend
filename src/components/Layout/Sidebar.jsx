import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UsersIcon,
  PlusIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../../store/authStore';

const Sidebar = () => {
  const { user } = useAuthStore();
  const canManageUsers = user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce';
  const canCreateProjects = user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce' || user?.role === 'desarrollador' || user?.role === 'jefe_desarrollo' || user?.role === 'jefe_workforce';

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Proyectos', href: '/projects', icon: FolderIcon },
    { name: 'Calendario', href: '/calendar', icon: CalendarDaysIcon },
    { name: 'Tareas', href: '/tasks', icon: ClipboardDocumentListIcon },
    { name: 'Reportes', href: '/reports', icon: ChartBarIcon },
  ];

  if (canManageUsers) {
    navigation.push({ name: 'Usuarios', href: '/users', icon: UsersIcon });
  }

  const quickActions = [
    { name: 'Nuevo Proyecto', href: '/projects/new', icon: PlusIcon, show: canCreateProjects },
    { name: 'Nueva Tarea', href: '/tasks/new', icon: PlusIcon, show: true },
  ].filter(action => action.show);

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white/80 backdrop-blur-xl shadow-2xl border-r border-gray-200/50">
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">V</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              VISTA
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                  } group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'} group-hover:text-current`} />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {quickActions.length > 0 && (
            <div className="mt-8 px-4">
              <h3 className="px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Acciones Rápidas
              </h3>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <NavLink
                    key={action.name}
                    to={action.href}
                    className="group flex items-center px-4 py-3 text-sm font-semibold rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-600 hover:text-white transition-all duration-200"
                  >
                    <action.icon className="mr-3 h-5 w-5 group-hover:text-white" />
                    {action.name}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100/50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm font-semibold text-white">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-600 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;