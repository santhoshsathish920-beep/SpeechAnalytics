import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiList, FiHome, FiSun, FiMoon, FiActivity } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { name: 'Home', path: '/', icon: FiHome },
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { name: 'History', path: '/history', icon: FiList },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 hidden md:flex flex-col border-r border-slate-200/50 dark:border-slate-800/40 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-200/50 dark:border-slate-800/40">
        <div className="flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
          <FiActivity className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent uppercase font-sans">
            VoxAnalytics
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold -mt-0.5">Speech Insights</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/10 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle & User Info at Bottom */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/40">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <span className="flex items-center gap-3">
            {isDark ? <FiSun className="w-4.5 h-4.5 text-amber-400" /> : <FiMoon className="w-4.5 h-4.5 text-indigo-500" />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
          <div className="w-8 h-4 rounded-full bg-slate-200 dark:bg-slate-850 relative flex items-center px-0.5">
            <div className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-250 ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        {/* Developer Badge */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40 text-center">
          <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Project Tier</span>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Placement Demonstration</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
