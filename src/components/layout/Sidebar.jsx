import React, { useRef, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiGrid, FiBarChart2, FiFileText, FiZap, FiActivity,
  FiUsers, FiShoppingBag, FiPackage, FiDollarSign,
  FiBriefcase, FiUser, FiSettings, FiX,
} from 'react-icons/fi';

const navSections = [
  {
    title: 'OVERVIEW',
    items: [
      { path: '/dashboard', icon: FiGrid, label: 'Dashboard' },
      { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
      { path: '/reports', icon: FiFileText, label: 'Reports' },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { path: '/ai-insights', icon: FiZap, label: 'AI Insights', badge: 'New' },
      { path: '/ai-assistant', icon: FiActivity, label: 'AI Assistant' },
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
    title: 'COMPANY',
    items: [
      { path: '/company', icon: FiBriefcase, label: 'Company' },
      { path: '/profile', icon: FiUser, label: 'Profile' },
      { path: '/settings', icon: FiSettings, label: 'Settings' },
    ],
  },
];

const SidebarSection = ({ section, location, onClose }) => {
  const containerRef = useRef(null);
  const [pillStyle, setPillStyle] = useState({ top: 0, height: 0, opacity: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector('[data-active="true"]');
    if (activeEl) {
      const { offsetTop, offsetHeight } = activeEl;
      setPillStyle({
        top: offsetTop,
        height: offsetHeight,
        opacity: 1,
      });
    } else {
      setPillStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [location.pathname]);

  return (
    <div className="space-y-1">
      <p className="px-3 mb-1.5 text-[10px] font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
        {section.title}
      </p>
      <div ref={containerRef} className="relative space-y-1">
        {/* Dynamic Sliding Capsule Indicator */}
        <div
          className="absolute left-0 right-0 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/20 transition-all duration-220 ease-out pointer-events-none"
          style={{
            transform: `translateY(${pillStyle.top}px)`,
            height: `${pillStyle.height}px`,
            opacity: pillStyle.opacity,
          }}
        />

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
                relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium
                transition-all duration-180 ease-out group select-none z-10
                ${isActive
                  ? 'text-primary dark:text-white font-semibold'
                  : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-surface/60 dark:hover:bg-dark-surface/60'
                }
              `}
            >
              {/* Subtle active left accent dot */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 animate-fade-in" />
              )}

              {/* Icon with subtle 1-2px shift on hover, inactive uses muted slate */}
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-transform duration-180 ease-out group-hover:translate-x-0.5 ${
                  isActive
                    ? 'text-primary dark:text-white'
                    : 'text-light-text-muted dark:text-dark-text-muted group-hover:text-light-text-primary dark:group-hover:text-dark-text-primary'
                }`}
              />

              {/* Text remains stable */}
              <span className="flex-1 truncate">{item.label}</span>

              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-primary/15 text-primary dark:bg-primary/30 dark:text-primary-100 rounded-md border border-primary/20">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        w-64 bg-light-sidebar dark:bg-dark-sidebar border-r border-light-border dark:border-dark-border
        transition-transform duration-250 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Header / Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-light-border dark:border-dark-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs">
              <FiZap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-light-text-primary dark:text-dark-text-primary font-bold text-base leading-none tracking-tight">NexusAI</span>
              <p className="text-light-text-muted dark:text-dark-text-muted text-[10px] mt-0.5 font-medium">Decision Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section) => (
            <SidebarSection
              key={section.title}
              section={section}
              location={location}
              onClose={onClose}
            />
          ))}
        </nav>

        {/* Footer / Account / Credits Status */}
        <div className="p-4 border-t border-light-border dark:border-dark-border flex-shrink-0">
          <div className="rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiZap className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">AI Credits</span>
              </div>
              <span className="text-[10px] font-semibold text-light-text-muted dark:text-dark-text-muted">72%</span>
            </div>
            <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-1.5 overflow-hidden">
              <div className="h-1.5 rounded-full bg-primary transition-all duration-300" style={{ width: '72%' }} />
            </div>
            <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted font-medium">720 / 1000 credits remaining</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
