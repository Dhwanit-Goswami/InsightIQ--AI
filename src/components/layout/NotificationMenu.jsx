import React, { useState, useRef, useEffect } from 'react';
import {
  FiBell, FiCheckCircle, FiAlertTriangle, FiInfo,
  FiX, FiCheck
} from 'react-icons/fi';

const notifications = [
  { id: 1, type: 'success', title: 'Revenue target exceeded', message: 'Q3 revenue surpassed target by 12.4%', time: '5 min ago', read: false },
  { id: 2, type: 'warning', title: 'Inventory alert', message: 'SKU-8821 stock low in Surat hub (8 units left)', time: '18 min ago', read: false },
  { id: 3, type: 'info', title: 'AI insight generated', message: 'Logistics consolidation identified ₹34L cost savings', time: '1 hr ago', read: false },
  { id: 4, type: 'success', title: 'Invoice payment received', message: 'Arvind Textiles settled ₹24.5L order invoice', time: '2 hr ago', read: true },
  { id: 5, type: 'info', title: 'Financial report ready', message: 'Monthly GST & P&L report compiled for download', time: '3 hr ago', read: true },
];

const typeIcon = {
  success: <FiCheckCircle className="w-3.5 h-3.5 text-success" />,
  warning: <FiAlertTriangle className="w-3.5 h-3.5 text-warning" />,
  info: <FiInfo className="w-3.5 h-3.5 text-primary" />,
};

const NotificationMenu = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifications);
  const ref = useRef(null);
  const unread = items.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setItems(items.map(n => ({ ...n, read: true })));
  const dismiss = (id) => setItems(items.filter(n => n.id !== id));

  return (
    <div ref={ref} className="relative">
      <button
        id="notification-btn"
        onClick={() => setOpen(p => !p)}
        className="relative p-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-surface dark:hover:bg-dark-surface hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <FiBell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-light-card dark:bg-dark-card rounded-xl shadow-card-lg dark:shadow-card-lg-dark border border-light-border dark:border-dark-border z-50 animate-fade-in overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-light-border dark:border-dark-border bg-light-surface/40 dark:bg-dark-surface/40">
            <div>
              <h3 className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">Notifications</h3>
              <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted">{unread} unread updates</p>
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] text-primary hover:underline transition-colors font-medium cursor-pointer"
              >
                <FiCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-light-border dark:divide-dark-border">
            {items.map(n => (
              <div
                key={n.id}
                className={`flex items-start gap-2.5 px-4 py-2.5 hover:bg-light-surface/70 dark:hover:bg-dark-surface/70 transition-colors ${!n.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
              >
                <div className="mt-0.5 flex-shrink-0">{typeIcon[n.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${n.read ? 'font-normal text-light-text-secondary dark:text-dark-text-secondary' : 'font-semibold text-light-text-primary dark:text-dark-text-primary'}`}>
                    {n.title}
                  </p>
                  <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted truncate mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-0.5 font-normal">{n.time}</p>
                </div>
                <button
                  onClick={() => dismiss(n.id)}
                  className="flex-shrink-0 text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors cursor-pointer"
                  aria-label="Dismiss notification"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="px-4 py-2 border-t border-light-border dark:border-dark-border bg-light-surface/20 dark:bg-dark-surface/20">
            <span className="block text-[11px] text-center text-light-text-muted dark:text-dark-text-muted">
              Auto-synced with company event stream
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
