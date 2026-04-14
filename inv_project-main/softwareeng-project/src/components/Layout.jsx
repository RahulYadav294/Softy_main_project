import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart2, 
  Bell, 
  LogOut,
  Archive,
  Menu,
  X
} from 'lucide-react';
import api from '../api';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const userStr = localStorage.getItem('user');
  let user = {};
  if (userStr) {
    try { user = JSON.parse(userStr); } catch(e) {}
  }

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error(error);
    }
    localStorage.removeItem('user');
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/stock', label: 'Stock Levels', icon: Archive },
    { path: '/suppliers', label: 'Suppliers', icon: Users },
    { path: '/sales-purchase', label: 'Sales & Purchase', icon: ShoppingCart },
    { path: '/alerts', label: 'Alerts', icon: Bell },
    { path: '/reports', label: 'Reports', icon: BarChart2 },
  ];

  return (
    <div className="layout">
      {/* Mobile Header / Nav Toggle */}
      <div className="mobile-header">
        <button className="menu-toggle icon-btn" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <span className="mobile-logo">InvSystem</span>
      </div>

      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} 
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-placeholder">
            <Archive size={20} color="var(--bg-secondary)" />
          </div>
          <h2>InvSystem</h2>
          <button 
            className="icon-btn" 
            style={{ marginLeft: 'auto', display: sidebarOpen ? 'block' : 'none' }}
            onClick={closeSidebar}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
             <NavLink 
                key={item.path} 
                to={item.path} 
                className={({isActive}) => isActive ? "nav-item active" : "nav-item"}
                onClick={closeSidebar}
              >
               <item.icon size={20} />
               <span>{item.label}</span>
             </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-text">
              <p className="username">{user.username || 'User'}</p>
              <p className="role">{user.role || 'Admin'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
