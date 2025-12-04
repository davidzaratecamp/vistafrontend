import { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  UserIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BellIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../../store/authStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white/70 backdrop-blur-lg shadow-lg border-b border-white/20 relative z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-all duration-200"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex-shrink-0 flex items-center ml-4 md:ml-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-sm font-bold text-white">V</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  VISTA
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-all duration-200 relative">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            <Menu as="div" className="relative z-[9999]">
              <Menu.Button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-all duration-200">
                <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-white/20">
                  <span className="text-sm font-medium text-white">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <span className="block text-sm font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="block text-xs text-gray-500 capitalize">
                    {user?.role}
                  </span>
                </div>
              </Menu.Button>

              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-lg rounded-xl shadow-xl ring-1 ring-black/10 focus:outline-none z-[9999] border border-white/20 transform">
                  <div className="py-2">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/profile"
                          className={`${
                            active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                          } flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-all duration-200`}
                        >
                          <UserIcon className="mr-3 h-5 w-5" />
                          Mi Perfil
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/settings"
                          className={`${
                            active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                          } flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-all duration-200`}
                        >
                          <Cog6ToothIcon className="mr-3 h-5 w-5" />
                          Configuración
                        </a>
                      )}
                    </Menu.Item>
                    <div className="border-t border-gray-200/50 my-2"></div>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-red-50 text-red-600' : 'text-gray-700'
                          } flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-all duration-200`}
                        >
                          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                          Cerrar Sesión
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;