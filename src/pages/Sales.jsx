import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import StatCard from '../components/ui/StatCard';
import SearchBar from '../components/ui/SearchBar';
import { BarChartWidget } from '../components/charts/Charts';
import { FiPlus, FiDownload } from 'react-icons/fi';
import { exportToCSV } from '../utils/exportUtils';
import { getSales } from '../services/api';

// ── helpers ──────────────────────────────────────────────────────────────────
const formatINR = (value) => {
  const num = Number(value);
  if (isNaN(num)) return '₹0';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000)     return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString('en-IN')}`;
};

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return iso; }
};

const formatMethod = (m = '') => {
  const map = {
    upi: 'UPI', card: 'Card', cash: 'Cash',
    bank_transfer: 'Bank Transfer', cheque: 'Cheque',
  };
  return map[m.toLowerCase()] || m.toUpperCase();
};

const mapSale = (s) => ({
  _id:       s.id,
  date:      formatDate(s.sale_date),
  id:        s.invoice_number,
  customer:  s.customer?.name || 'Walk-in Customer',
  items:     (s.items || []).map(i => `${i.product?.name || 'Product'} ×${Number(i.quantity)}`).join(', ') || '—',
  total:     formatINR(s.total_amount),
  method:    formatMethod(s.payment_method),
  status:    s.status === 'completed' ? 'Settled' : s.status.charAt(0).toUpperCase() + s.status.slice(1),
  rawTotal:  Number(s.total_amount || 0),
  rawStatus: s.status,
});

// ── component ─────────────────────────────────────────────────────────────────
const Sales = () => {
  const [salesHistory, setSalesHistory]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [search, setSearch]               = useState('');
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [formData, setFormData]           = useState({
    customer: '', items: '', total: '', method: 'NEFT Transfer', status: 'Settled',
  });

  // Derived stats from real data
  const totalRevenue = salesHistory.reduce((s, r) => s + (r.rawTotal || 0), 0);
  const settledCount = salesHistory.filter(r => r.rawStatus === 'completed').length;
  const pendingCount = salesHistory.filter(r => r.rawStatus === 'pending').length;
  const avgDeal = salesHistory.length ? totalRevenue / salesHistory.length : 0;

  // Static 6-month velocity chart — kept as-is (chart data would need separate analytics call)
  const chartData = [
    { month: 'Apr', sales: 95 },
    { month: 'May', sales: 110 },
    { month: 'Jun', sales: 124 },
    { month: 'Jul', sales: 138 },
    { month: 'Aug', sales: 152 },
    { month: 'Sep', sales: salesHistory.length },
  ];

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getSales({ limit: 200 });
        setSalesHistory((res.data || []).map(mapSale));
      } catch (err) {
        setError('Unable to load sales data. Please try again.');
        console.error('[Sales] fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const handleExport = () => {
    const exportData = salesHistory.map(({ date, id, customer, items, total, method, status }) => ({
      'Date': date,
      'Order ID': id,
      'Client': customer,
      'Line Items': items,
      'Total Value': total,
      'Payment Channel': method,
      'Settlement': status,
    }));
    exportToCSV(exportData, `Sales_Journal_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Modal: local-only (no POST endpoint needed for audit)
  const handleAddSale = (e) => {
    e.preventDefault();
    if (!formData.customer || !formData.total) return;
    const formattedTotal = formData.total.startsWith('₹') ? formData.total : `₹${formData.total}`;
    const newSale = {
      _id:      `local-${Date.now()}`,
      date:     new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      id:       `INV-LOCAL-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: formData.customer,
      items:    formData.items || 'Standard Solution Pack ×1',
      total:    formattedTotal,
      method:   formData.method,
      status:   formData.status,
      rawTotal: 0,
      rawStatus: formData.status === 'Settled' ? 'completed' : 'pending',
    };
    setSalesHistory([newSale, ...salesHistory]);
    setIsModalOpen(false);
    setFormData({ customer: '', items: '', total: '', method: 'NEFT Transfer', status: 'Settled' });
  };

  const filteredSales = salesHistory.filter(s =>
    s.customer.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.items.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'date', label: 'Order Date', sortable: true },
    { key: 'id', label: 'Order ID', render: (id) => <span className="font-mono text-xs">{id}</span> },
    {
      key: 'customer',
      label: 'Client Account',
      sortable: true,
      render: (c) => <span className="font-medium text-light-text-primary dark:text-dark-text-primary">{c}</span>,
    },
    { key: 'items', label: 'Contracted Items' },
    {
      key: 'total',
      label: 'Order Value',
      sortable: true,
      render: (v) => <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{v}</span>,
    },
    { key: 'method', label: 'Payment Channel' },
    {
      key: 'status',
      label: 'Settlement',
      sortable: true,
      render: (s) => (
        <Badge variant={s === 'Settled' ? 'success' : 'warning'} dot>
          {s}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Commercial Sales Orders</h1>
          <p className="page-subtitle">
            Track wholesale orders, invoice reconciliation, and payment settlement channels (in ₹).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="secondary" size="sm" onClick={handleExport} className="flex items-center gap-1.5">
            <FiDownload className="w-3.5 h-3.5" />
            <span>Export Journal</span>
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5">
            <FiPlus className="w-3.5 h-3.5" />
            <span>Record Order</span>
          </Button>
        </div>
      </div>

      {/* ─── Summary KPIs & Velocity ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            label="Invoiced Order Volume"
            value={formatINR(totalRevenue)}
            change={`${salesHistory.length} orders`}
            trend="up"
            period="all loaded orders"
          />
          <StatCard
            label="Average Deal Value"
            value={formatINR(avgDeal)}
            change="per order avg"
            trend="up"
            period="across all orders"
          />
          <StatCard
            label="Settlement Rate"
            value={salesHistory.length ? `${Math.round((settledCount / salesHistory.length) * 100)}%` : '—'}
            change={`${settledCount} settled`}
            trend="up"
            period="completed orders"
          />
          <StatCard
            label="Pending Orders"
            value={pendingCount > 0 ? `${pendingCount} orders` : '0 orders'}
            change={pendingCount > 0 ? 'Needs attention' : 'All clear'}
            trend={pendingCount > 0 ? 'down' : 'neutral'}
            period="awaiting settlement"
          />
        </div>

        {/* Monthly Order Velocity Chart */}
        <Card padding={true}>
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-light-border dark:border-dark-border">
            <div>
              <span className="text-[10px] font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                Volume
              </span>
              <h4 className="text-xs sm:text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                Monthly Orders Trend
              </h4>
            </div>
            <Badge variant="neutral">{salesHistory.length} Orders</Badge>
          </div>
          <div className="h-[150px]">
            <BarChartWidget
              data={chartData}
              keys={[{ key: 'sales', name: 'Order Count', color: '#5278A6' }]}
              formatter={(v) => `${v}`}
              height={150}
            />
          </div>
        </Card>
      </div>

      {/* ─── Error state ─── */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* ─── Search & Table ─── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
            Sales Journal Entries
            {loading && <span className="ml-2 text-xs font-normal text-light-text-muted dark:text-dark-text-muted">Loading…</span>}
          </h3>
          <div className="w-64">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search orders or clients..."
            />
          </div>
        </div>

        <Card padding={false} className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-light-text-muted dark:text-dark-text-muted">
              Loading sales data…
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredSales}
              emptyMessage="No sales transactions found."
            />
          )}
        </Card>
      </div>

      {/* ─── Record Sale Modal ─── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Commercial Sale"
        subtitle="Log a new corporate order into the sales journal."
        size="md"
      >
        <form onSubmit={handleAddSale} className="space-y-4">
          <Input
            label="Client Account Name"
            placeholder="e.g. Vardaan Electronics Pvt. Ltd."
            value={formData.customer}
            onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
            required
          />

          <Input
            label="Contracted Items / Solution"
            placeholder="e.g. Enterprise Analytics Suite x1"
            value={formData.items}
            onChange={(e) => setFormData({ ...formData, items: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Total Value (₹)"
              placeholder="e.g. ₹18.5L"
              value={formData.total}
              onChange={(e) => setFormData({ ...formData, total: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Payment Channel
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="input-field py-1.5 text-xs font-medium cursor-pointer"
              >
                <option value="NEFT Transfer">NEFT Transfer</option>
                <option value="RTGS Transfer">RTGS Transfer</option>
                <option value="Corporate NetBanking">Corporate NetBanking</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sales;
