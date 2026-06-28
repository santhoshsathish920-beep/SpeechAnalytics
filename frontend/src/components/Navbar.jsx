import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiActivity, FiHome, FiGrid, FiList, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { name: 'Home', path: '/', icon: FiHome },
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { name: 'History', path: '/history', icon: FiList },
  ];

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Welcome';
      case '/dashboard':
        return 'Analytics Dashboard';
      case '/history':
        return 'Upload History';
      default:
        return 'VoxAnalytics';
    }
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      <header className="h-16 sticky top-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40 z-30 flex items-center justify-between px-6 md:pl-72">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white font-sans hidden md:block">
          {getPageTitle()}
        </h2>

        {/* Mobile Header elements */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
          >
            <FiMenu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7.5 h-7.5 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md">
              <FiActivity className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-wide text-indigo-600 dark:text-indigo-400 uppercase">
              VoxAnalytics
            </span>
          </div>
        </div>

        {/* Right Info Section */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 md:hidden rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            {isDark ? <FiSun className="w-4.5 h-4.5 text-amber-400" /> : <FiMoon className="w-4.5 h-4.5 text-indigo-500" />}
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-950/30 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            System Live (CPU Fallback Enabled)
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Overlay */}
          <div 
            onClick={toggleMobileMenu} 
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-250"
          />

          {/* Drawer content */}
          <div className="w-64 bg-white dark:bg-slate-900 h-full relative z-10 flex flex-col border-r border-slate-200 dark:border-slate-800 p-6 animate-slide-in-right">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <FiActivity className="w-5 h-5 text-indigo-500" />
                <span className="font-extrabold text-sm text-slate-850 dark:text-white uppercase font-sans">
                  VoxAnalytics
                </span>
              </div>
              <button 
                onClick={toggleMobileMenu}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850"
              >
                <FiX className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={toggleMobileMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/10'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Footer */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-slate-600 dark:text-slate-400"
              >
                <span className="flex items-center gap-3">
                  {isDark ? <FiSun className="w-4.5 h-4.5 text-amber-400" /> : <FiMoon className="w-4.5 h-4.5 text-indigo-500" />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/45 text-center text-[10px] text-slate-400">
                Placement-ready Project
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
