import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, List, Settings, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ onLogout }) => {
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-header">
          <h2>Stationary Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink to="/" end>
                <Home size={20} />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/add-student">
                <PlusCircle size={20} />
                <span>Add Student</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/items">
                <List size={20} />
                <span>Items List</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings">
                <Settings size={20} />
                <span>Settings</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div className="sidebar-footer">
        <button onClick={onLogout} className="logout-button">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;