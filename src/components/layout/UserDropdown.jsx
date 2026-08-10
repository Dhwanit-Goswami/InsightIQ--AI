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
        className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-light-surface dark:hover:bg-dark-surface transition-all select-none"
      >
        <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-xs">
          {userData.initials}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary leading-none">{userData.firstName}</p>
          <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-0.5 font-medium">{userData.role}</p>
        </div>
        <FiChevronDown className={`w-3.5 h-3.5 text-light-text-muted dark:text-dark-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-60 bg-light-card dark:bg-dark-card rounded-2xl shadow-card-lg dark:shadow-card-lg-dark border border-light-border dark:border-dark-border z-50 animate-fade-up overflow-hidden">
          {/* Profile header */}
          <div className="px-4 py-3 border-b border-light-border dark:border-dark-border bg-light-surface/50 dark:bg-dark-surface/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {userData.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary truncate">{userData.fullName}</p>
                <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted truncate">{userData.email}</p>
                <span className="inline-flex items-center px-1.5 py-0.5 mt-1 text-[9px] font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-white rounded border border-primary/20">
                  {userData.plan}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-1">
            {[
              { icon: FiUser, label: 'View Profile', path: '/profile' },
              { icon: FiSettings, label: 'Settings', path: '/settings' },
              { icon: FiShield, label: 'Security', path: '/settings' },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-surface dark:hover:bg-dark-surface transition-colors"
              >
                <item.icon className="w-3.5 h-3.5 text-light-text-muted dark:text-dark-text-muted" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-light-border dark:border-dark-border py-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-xs font-medium text-danger hover:bg-danger-bg/50 transition-colors"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
