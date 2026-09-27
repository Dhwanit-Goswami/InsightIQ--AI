import React, { useRef, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiGrid, FiBarChart2, FiFileText, FiCpu, FiMessageSquare,
  FiUsers, FiShoppingBag, FiPackage, FiDollarSign,
  FiBriefcase, FiUser, FiSettings, FiX,
} from 'react-icons/fi';

const navSections = [
  {
    title: 'OVERVIEW',
    items: [
      { path: '/dashboard', icon: FiGrid, label: 'Dashboard' },
      { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { path: '/ai-insights', icon: FiCpu, label: 'AI Insights' },
      { path: '/ai-assistant', icon: FiMessageSquare, label: 'AI Assistant' },
    ],
  },
  {
    title: 'BUSINESS',
    items: [
      { path: '/customers', icon: FiUsers, label: 'Customers' },
      { path: '/sales', icon: FiShoppingBag, label: 'Sales' },
      { path: '/inventory', icon: FiPackage, label: 'Inventory' },
      { path: '/expenses', icon: FiDollarSign, label: 'Expenses' },
    ],
  },
  {
    title: 'REPORTING',
    items: [
      { path: '/reports', icon: FiFileText, label: 'Reports' },
    ],
  },
  {
    title: 'COMPANY',
    items: [
      { path: '/company', icon: FiBriefcase, label: 'Company' },
      { path: '/profile', icon: FiUser, label: 'Profile' },
      { path: '/settings', icon: FiSettings, label: 'Settings' },
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0, opacity: 0 });

  // Smooth sliding active navigation indicator across all items (Section 12)
  useEffect(() => {
    const updateIndicator = () => {
      if (!navRef.current) return;
      const activeEl = navRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        const navRect = navRef.current.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        setIndicatorStyle({
          top: activeRect.top - navRect.top + navRef.current.scrollTop,
          height: activeRect.height,
          opacity: 1,
        });
      } else {
        setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    // In case fonts or icons adjust layout
    const timer = setTimeout(updateIndicator, 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar Shell */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        w-64 bg-light-sidebar dark:bg-dark-sidebar border-r border-light-border dark:border-dark-border
        transition-transform duration-220 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Header / Brand Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-light-border dark:border-dark-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs shadow-card">
              IQ
            </div>
            <div>
              <span className="text-light-text-primary dark:text-dark-text-primary font-semibold text-sm leading-none tracking-tight block">
                InsightIQ
              </span>
              <span className="text-light-text-muted dark:text-dark-text-muted text-[10px] font-normal leading-none block mt-0.5">
                Decision Intelligence
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sections with Unified Sliding Indicator */}
        <nav
          ref={navRef}
          className="relative flex-1 overflow-y-auto px-3 py-4 space-y-5"
        >
          {/* Dynamic Sliding Indicator (Section 12: 220ms subtle easing, no bounce/glow) */}
          <div
            className="absolute left-3 right-3 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border transition-all duration-220 ease-out pointer-events-none shadow-sm"
            style={{
              transform: `translateY(${indicatorStyle.top}px)`,
              height: `${indicatorStyle.height}px`,
              opacity: indicatorStyle.opacity,
            }}
          />

          {navSections.map((section) => (
            <div key={section.title} className="space-y-0.5">
              <p className="px-2.5 mb-1.5 text-[10px] font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-widest select-none">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      data-active={isActive ? 'true' : 'false'}
                      className={`
                        relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium
                        transition-colors duration-180 select-none z-10
                        ${isActive
                          ? 'text-primary dark:text-primary font-semibold'
                          : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                        }
                      `}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive
                            ? 'text-primary'
                            : 'text-light-text-muted dark:text-dark-text-muted'
                        }`}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Account Status */}
        <div className="p-3 border-t border-light-border dark:border-dark-border flex-shrink-0">
          <div className="rounded-lg bg-light-surface/70 dark:bg-dark-surface/70 border border-light-border dark:border-dark-border p-2.5">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-medium text-light-text-secondary dark:text-dark-text-secondary">AI Capacity</span>
              <span className="text-light-text-muted dark:text-dark-text-muted font-normal">72%</span>
            </div>
            <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-1 overflow-hidden">
              <div className="h-1 rounded-full bg-primary" style={{ width: '72%' }} />
            </div>
            <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-1.5 font-normal">720 / 1,000 queries this cycle</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
