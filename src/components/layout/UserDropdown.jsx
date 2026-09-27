import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiSettings, FiLogOut, FiShield, FiChevronDown } from 'react-icons/fi';
import { userData } from '../../data/mockUser';

const UserDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    navigate('/login');
  };

  return (
    <div ref={ref} className="relative">
      <button
        id="user-dropdown-btn"
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 p-1.5 pr-2 rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface transition-colors cursor-pointer select-none"
        aria-label="User menu"
      >
        <div className="w-6 h-6 rounded-md bg-primary text-white flex items-center justify-center text-[11px] font-semibold flex-shrink-0 shadow-sm">
          {userData.initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-medium text-light-text-primary dark:text-dark-text-primary leading-none">{userData.firstName}</p>
          <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-0.5 font-normal truncate max-w-[120px]">{userData.role}</p>
        </div>
        <FiChevronDown className={`w-3 h-3 text-light-text-muted dark:text-dark-text-muted transition-transform duration-180 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-56 bg-light-card dark:bg-dark-card rounded-xl shadow-card-lg dark:shadow-card-lg-dark border border-light-border dark:border-dark-border z-50 animate-fade-in overflow-hidden">
          {/* Profile header */}
          <div className="px-3.5 py-3 border-b border-light-border dark:border-dark-border bg-light-surface/40 dark:bg-dark-surface/40">
            <p className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary truncate">{userData.fullName}</p>
            <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted truncate mt-0.5">{userData.email}</p>
            <span className="inline-block px-1.5 py-0.5 mt-1.5 text-[10px] font-medium bg-light-surface text-light-text-secondary dark:bg-dark-surface dark:text-dark-text-secondary rounded border border-light-border dark:border-dark-border">
              {userData.company}
            </span>
          </div>

          {/* Links */}
          <div className="py-1">
            {[
              { icon: FiUser, label: 'Organization Profile', path: '/profile' },
              { icon: FiSettings, label: 'Preferences', path: '/settings' },
              { icon: FiShield, label: 'Security & Access', path: '/settings' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 text-xs text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-surface/70 dark:hover:bg-dark-surface/70 transition-colors"
              >
                <item.icon className="w-3.5 h-3.5 text-light-text-muted dark:text-dark-text-muted" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="border-t border-light-border dark:border-dark-border py-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-3.5 py-1.5 text-xs text-danger hover:bg-danger/10 transition-colors cursor-pointer"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
