import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiCpu, FiSun, FiMoon, FiSearch } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import NotificationMenu from './NotificationMenu';
import UserDropdown from './UserDropdown';

const Topbar = ({ onMenuClick }) => {
  const { isDark, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const searchInputRef = React.useRef(null);

  // Cmd/Ctrl+K keyboard shortcut to open search
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/analytics?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 h-16 z-20 bg-light-card/95 dark:bg-dark-card/95 backdrop-blur-sm border-b border-light-border dark:border-dark-border flex items-center px-4 sm:px-6 gap-3 transition-colors duration-200">
      {/* Mobile Drawer Button */}
      <button
        id="sidebar-toggle"
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-surface dark:hover:bg-dark-surface transition-colors cursor-pointer"
        aria-label="Toggle navigation drawer"
      >
        <FiMenu className="w-5 h-5" />
      </button>

      {/* Global Business Search (Section 13) */}
      <div className="flex-1 max-w-xs sm:max-w-sm">
        {searchOpen ? (
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              ref={searchInputRef}
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search revenue, clients, reports..."
              onBlur={() => !searchQuery && setSearchOpen(false)}
              className="input-field py-1.5 text-xs sm:text-sm pl-8 pr-3"
            />
            <FiSearch className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-light-text-muted dark:text-dark-text-muted" />
          </form>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2.5 w-full text-left px-3 py-1.5 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary hover:border-slate-300 dark:hover:border-slate-600 transition-colors text-xs cursor-pointer select-none"
          >
            <FiSearch className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Search platform data...</span>
            <span className="sm:hidden">Search...</span>
            <kbd className="ml-auto hidden sm:inline-block text-[10px] bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded px-1.5 py-0.5 font-mono text-light-text-muted dark:text-dark-text-muted">⌘K</kbd>
          </button>
        )}
      </div>

      {/* Right Actions: AI Assistant, Theme Toggle, Notifications, Profile */}
      <div className="flex items-center gap-1.5 ml-auto">
        {/* AI Assistant Quick Launcher */}
        <button
          onClick={() => navigate('/ai-assistant')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-light-surface dark:bg-dark-surface hover:bg-slate-200/70 dark:hover:bg-dark-border/60 text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border text-xs font-medium transition-colors cursor-pointer"
        >
          <FiCpu className="w-3.5 h-3.5 text-primary" />
          <span>Ask AI</span>
        </button>

        {/* Theme Toggle */}
        <button
          id="theme-toggle"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-surface dark:hover:bg-dark-surface hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors cursor-pointer"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle visual theme"
        >
          {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <NotificationMenu />

        <div className="w-px h-4 bg-light-border dark:bg-dark-border mx-1" />

        {/* User Profile Dropdown */}
        <UserDropdown />
      </div>
    </header>
  );
};

export default Topbar;
