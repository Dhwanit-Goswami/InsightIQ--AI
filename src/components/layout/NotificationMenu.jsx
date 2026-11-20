import React, { useState, useRef, useEffect } from 'react';
import {
  FiBell, FiCheckCircle, FiAlertTriangle, FiInfo,
  FiX, FiCheck
} from 'react-icons/fi';
import { getInventory, getSales, getAIInsights } from '../../services/api';

const typeIcon = {
  success: <FiCheckCircle className="w-3.5 h-3.5 text-success" />,
  warning: <FiAlertTriangle className="w-3.5 h-3.5 text-warning" />,
  info: <FiInfo className="w-3.5 h-3.5 text-primary" />,
};

const NotificationMenu = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const unread = items.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const loadSystemEvents = async () => {
      setLoading(true);
      try {
        const events = [];
        const [invRes, salesRes, insRes] = await Promise.allSettled([
          getInventory(),
          getSales({ limit: 3 }),
          getAIInsights(),
        ]);

        if (invRes.status === 'fulfilled') {
          const invList = invRes.value.data || [];
          const lowStock = invList.filter(i => Number(i.quantity || 0) <= Number(i.reorder_level || 10));
          lowStock.slice(0, 3).forEach((item, idx) => {
            events.push({
              id: `low-stock-${item.id || idx}`,
              type: 'warning',
              title: 'Low Stock Alert',
              message: `${item.product?.name || 'Item'} is at ${Number(item.quantity || 0)} units (reorder threshold: ${Number(item.reorder_level || 10)})`,
              time: 'Inventory Telemetry',
              read: false,
            });
          });
        }

        if (salesRes.status === 'fulfilled') {
          const salesList = salesRes.value.data || [];
          salesList.slice(0, 2).forEach((s, idx) => {
            events.push({
              id: `sale-${s.id || idx}`,
              type: 'success',
              title: s.status === 'completed' ? 'Order Settled' : 'Order Recorded',
              message: `${s.invoice_number || 'Sale'}: ₹${Number(s.total_amount || 0).toLocaleString('en-IN')} via ${(s.payment_method || 'bank').toUpperCase()}`,
              time: s.sale_date ? new Date(s.sale_date).toLocaleDateString('en-IN') : 'Recent',
              read: false,
            });
          });
        }

        if (insRes.status === 'fulfilled') {
          const insList = insRes.value.data || [];
          if (insList.length > 0) {
            const ins = insList[0];
            events.push({
              id: `insight-${ins.id || 0}`,
              type: 'info',
              title: ins.title || 'AI Intelligence Flag',
              message: ins.summary || ins.description || 'New operational pattern detected.',
              time: 'Decision Intelligence',
              read: false,
            });
          }
        }

        setItems(events);
      } catch (e) {
        console.warn('Failed to load system notifications', e);
      } finally {
        setLoading(false);
      }
    };

    loadSystemEvents();
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
              <h3 className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">System Notifications</h3>
              <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted">
                {items.length === 0 ? 'All clear' : `${unread} unread alert${unread === 1 ? '' : 's'}`}
              </p>
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] text-primary hover:underline transition-colors font-medium cursor-pointer"
              >
                <FiCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-light-border dark:divide-dark-border">
            {loading ? (
              <div className="p-4 text-center text-xs text-light-text-muted dark:text-dark-text-muted">
                Checking system events…
              </div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-xs text-light-text-muted dark:text-dark-text-muted space-y-1">
                <FiCheckCircle className="w-5 h-5 mx-auto text-success/80 mb-1" />
                <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">No pending alerts</p>
                <p className="text-[11px]">Transactional ledgers and inventory stock are normal.</p>
              </div>
            ) : (
              items.map(n => (
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
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-light-border dark:border-dark-border bg-light-surface/20 dark:bg-dark-surface/20">
            <span className="block text-[11px] text-center text-light-text-muted dark:text-dark-text-muted">
              Auto-synced with live company event stream
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
