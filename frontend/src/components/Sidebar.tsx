import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/leads', label: 'Leads', icon: Users },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Logo area */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-brand-600 to-violet-400 p-2 rounded-lg text-white shadow-md shadow-brand-500/10">
            <Zap className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
            QualiAI
          </span>
        </div>

        {/* User profile preview */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-semibold text-brand-400 uppercase">
              {user?.name ? user.name.substring(0, 2) : 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name || 'Administrator'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@quali.ai'}</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-600/10 text-brand-400 border border-brand-500/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
