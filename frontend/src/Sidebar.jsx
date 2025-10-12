import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Users, List, Settings, LogOut, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

const Sidebar = ({ onLogout, isMobile: isMobileProp, sidebarOpen, setSidebarOpen }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use prop values if provided, otherwise use local state
  const currentIsMobile = isMobileProp !== undefined ? isMobileProp : isMobile;
  const currentSidebarOpen = sidebarOpen !== undefined ? sidebarOpen : !isCollapsed;

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (currentIsMobile && currentSidebarOpen) {
      const handleClickOutside = (event) => {
        const sidebar = document.querySelector('.sidebar-modern');
        if (sidebar && !sidebar.contains(event.target)) {
          if (setSidebarOpen) {
            setSidebarOpen(false);
          } else {
            setIsCollapsed(true);
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [currentIsMobile, currentSidebarOpen, setSidebarOpen]);

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home, exact: true },
    { path: '/add-student', label: 'Add Student', icon: PlusCircle },
    { path: '/student-management', label: 'Manage Students', icon: Users },
    { path: '/items', label: 'Manage Products', icon: List },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleToggleSidebar = () => {
    if (setSidebarOpen) {
      setSidebarOpen(!currentSidebarOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {currentIsMobile && currentSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" 
          onClick={() => {
            if (setSidebarOpen) {
              setSidebarOpen(false);
            } else {
              setIsCollapsed(true);
            }
          }}
        />
      )}
      
      <aside className={`
        fixed left-0 top-0 h-full bg-white border-r border-gray-200 flex flex-col z-50 shadow-strong transition-all duration-300
        ${currentIsMobile 
          ? `w-80 ${!currentSidebarOpen ? '-translate-x-full' : 'translate-x-0'}` 
          : `${!currentSidebarOpen ? 'w-20' : 'w-80'}`
        }
      `}>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 relative flex items-center justify-between">
            {currentSidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="text-2xl animate-bounce-gentle">🎓</div>
                <div className="flex flex-col leading-tight">
                  <span className="text-lg font-bold text-gray-900">College</span>
                  <span className="text-sm text-gray-600 font-medium">Stationery</span>
                </div>
              </div>
            )}
            {currentIsMobile ? (
              <button 
                className="absolute top-1/2 right-4 -translate-y-1/2 w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center cursor-pointer text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-800 hover:scale-105 shadow-sm"
                onClick={handleToggleSidebar}
                title="Toggle menu"
              >
                <Menu size={20} />
              </button>
            ) : (
              <button 
                className="absolute top-1/2 right-3 -translate-y-1/2 w-6 h-6 bg-primary-500 text-white border border-primary-500 flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-primary-600 hover:border-primary-600 hover:scale-105 shadow-sm rounded"
                onClick={handleToggleSidebar}
                title={!currentSidebarOpen ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {!currentSidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
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
                        ${!currentSidebarOpen ? 'justify-center px-2' : ''}
                      `}
                      title={!currentSidebarOpen ? item.label : ''}
                    >
                      <IconComponent size={20} className="flex-shrink-0" />
                      {currentSidebarOpen && <span className="truncate">{item.label}</span>}
                      {isActive && currentSidebarOpen && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full"></div>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button 
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-transparent border border-gray-200 rounded-xl text-gray-600 font-medium text-sm cursor-pointer transition-all duration-200 text-left hover:bg-danger-500 hover:border-danger-500 hover:text-white hover:-translate-y-0.5 hover:shadow-md"
            onClick={onLogout}
            title={!currentSidebarOpen ? 'Logout' : ''}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {currentSidebarOpen && <span>Logout</span>}
          </button>
        </div>
    </aside>
    </>
  );
};

export default Sidebar;