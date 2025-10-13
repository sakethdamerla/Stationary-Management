import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Users, List, Settings, LogOut, ChevronLeft, ChevronRight, Menu, UserPlus, X, User } from 'lucide-react';

const Sidebar = ({ onLogout, isMobile: isMobileProp, sidebarOpen, setSidebarOpen, currentUser }) => {
  const location = useLocation();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (isMobileProp && sidebarOpen) {
      const handleClickOutside = (event) => {
        const sidebar = document.querySelector('.sidebar-modern');
        if (sidebar && !sidebar.contains(event.target)) {
          setSidebarOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobileProp, sidebarOpen, setSidebarOpen]);

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home, exact: true },
    { path: '/add-student', label: 'Add Student', icon: PlusCircle },
    { path: '/student-management', label: 'Manage Students', icon: Users },
    { path: '/sub-admin-management', label: 'Manage Sub-Admins', icon: UserPlus },
    { path: '/items', label: 'Manage Products', icon: List },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileProp && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={`
        fixed left-0 top-0 h-full bg-white border-r border-gray-200 flex flex-col z-50 shadow-strong transition-all duration-300
        ${isMobileProp 
          ? `w-80 ${!sidebarOpen ? '-translate-x-full' : 'translate-x-0'}` 
          : `${!sidebarOpen ? 'w-20' : 'w-80'}`
        }
      `}>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 relative flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="text-2xl animate-bounce-gentle">🎓</div>
                <div className="flex flex-col leading-tight">
                  <span className="text-lg font-bold text-gray-900">College</span>
                  <span className="text-sm text-gray-600 font-medium">Stationery</span>
                </div>
              </div>
            )}
            {isMobileProp ? (
              <button 
                className="absolute top-1/2 right-4 -translate-y-1/2 w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center cursor-pointer text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-800 hover:scale-105 shadow-sm"
                onClick={handleToggleSidebar}
                title="Toggle menu"
              >
                <X size={20} />
              </button>
            ) : (
              <button 
                className="absolute top-1/2 right-3 -translate-y-1/2 w-6 h-6 bg-primary-500 text-white border border-primary-500 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-primary-600 hover:border-primary-600 hover:scale-105 shadow-sm rounded"
                onClick={handleToggleSidebar}
                title={!sidebarOpen ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {!sidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            )}
          </div>

          <nav className="flex-1 py-6 overflow-y-auto">
            <ul className="space-y-1 px-3">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
                
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.exact}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 relative group
                        ${isActive 
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 hover:translate-x-1'
                        }
                        ${!sidebarOpen ? 'justify-center px-2' : ''}
                      `}
                      title={!sidebarOpen ? item.label : ''}
                    >
                      <IconComponent size={20} className="flex-shrink-0" />
                      {sidebarOpen && <span className="truncate">{item.label}</span>}
                      {isActive && sidebarOpen && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full"></div>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          {sidebarOpen && currentUser && (
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 flex items-center justify-center text-white">
                <User size={20} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-sm text-gray-800 truncate">{currentUser.name || 'Admin User'}</span>
                <span className="text-xs text-gray-500">{currentUser.role || 'Administrator'}</span>
              </div>
            </div>
          )}
          <button 
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 bg-transparent border border-gray-200 rounded-xl text-gray-600 font-medium text-sm cursor-pointer transition-all duration-200 text-left hover:bg-danger-500 hover:border-danger-500 hover:text-white hover:-translate-y-0.5 hover:shadow-md
              ${!sidebarOpen ? 'justify-center' : ''}
            `}
            onClick={onLogout}
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
    </aside>
    </>
  );
};

export default Sidebar;