import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiZap, FiSun, FiMoon, FiSearch } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import NotificationMenu from './NotificationMenu';
import UserDropdown from './UserDropdown';

const Topbar = ({ onMenuClick }) => {
  const { isDark, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 h-16 z-20 bg-light-topbar/95 dark:bg-dark-topbar/95 backdrop-blur-xs border-b border-light-border dark:border-dark-border flex items-center px-4 sm:px-6 gap-3 transition-colors duration-200">
      {/* Mobile Sidebar Toggle Button */}
      <button
        id="sidebar-toggle"
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-surface dark:hover:bg-dark-surface transition-all"
        aria-label="Toggle Navigation"
      >
        <FiMenu className="w-5 h-5" />
      </button>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-xs sm:max-w-sm">
        {searchOpen ? (
          <input
            autoFocus
            type="text"
            placeholder="Search accounts, reports, insights..."
            onBlur={() => setSearchOpen(false)}
            className="input-field py-1.5 text-xs sm:text-sm"
          />
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2.5 w-full text-left px-3 py-1.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs sm:text-sm"
          >
            <FiSearch className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Search intelligence...</span>
            <span className="sm:hidden">Search...</span>
            <kbd className="ml-auto hidden sm:inline-block text-[10px] bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded px-1.5 py-0.5 font-mono text-light-text-muted dark:text-dark-text-muted">⌘K</kbd>
          </button>
        )}
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-1.5 ml-auto">
        {/* Ask AI Shortcut */}
        <button
          onClick={() => navigate('/ai-assistant')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 text-primary dark:text-white border border-primary/20 text-xs font-semibold transition-all"
        >
          <FiZap className="w-3.5 h-3.5" />
          Ask AI
        </button>

        {/* Theme Toggle Button */}
        <button
          id="theme-toggle"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-surface dark:hover:bg-dark-surface hover:text-light-text-primary dark:hover:text-dark-text-primary transition-all"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <FiSun className="w-4.5 h-4.5" /> : <FiMoon className="w-4.5 h-4.5" />}
        </button>

        <NotificationMenu />
        <div className="w-px h-5 bg-light-border dark:bg-dark-border mx-1" />
        <UserDropdown />
      </div>
    </header>
  );
};

export default Topbar;
