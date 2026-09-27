import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import StatCard from '../components/ui/StatCard';
import SearchBar from '../components/ui/SearchBar';
import { DonutChartWidget } from '../components/charts/Charts';
import { FiPlus, FiDownload } from 'react-icons/fi';
import { exportToCSV } from '../utils/exportUtils';
import { getExpenses } from '../services/api';

// ── helpers ───────────────────────────────────────────────────────────────────
const formatINR = (value) => {
  const num = Number(value);
  if (isNaN(num)) return '₹0';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000)     return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString('en-IN')}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return dateStr; }
};

const capitalize = (str = '') => str.charAt(0).toUpperCase() + str.slice(1);

const mapExpense = (e) => ({
  _id:      e.id,
  date:     formatDate(e.expense_date),
  desc:     e.description,
  category: capitalize(e.category),
  amount:   formatINR(e.amount),
  status:   e.status === 'paid' ? 'Approved' : capitalize(e.status),
  rawAmount: Number(e.amount || 0),
  rawStatus: e.status,
});

// Build donut chart from real expense data
const CHART_COLORS = ['#5278A6', '#5A8065', '#8178A2', '#B07040', '#A65278', '#408065'];

const buildCategoryShare = (expenses) => {
  const catTotals = {};
  expenses.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.rawAmount;
  });
  const total = Object.values(catTotals).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value], i) => ({
      name,
      value: Math.round((value / total) * 100),
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
};

// ── component ──────────────────────────────────────────────────────────────────
const Expenses = () => {
  const [expenseLogs, setExpenseLogs] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData]       = useState({
    desc: '', category: 'salaries', amount: '', status: 'paid',
  });

  // Computed stats
  const totalOutflow    = expenseLogs.reduce((s, e) => s + e.rawAmount, 0);
  const pendingAmount   = expenseLogs.filter(e => e.rawStatus !== 'paid').reduce((s, e) => s + e.rawAmount, 0);
  const topCategory     = expenseLogs.length
    ? Object.entries(
        expenseLogs.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.rawAmount;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0]
    : null;
  const categoryShare = expenseLogs.length ? buildCategoryShare(expenseLogs) : [
    { name: 'No Data', value: 100, color: '#94a3b8' },
  ];
  const totalStr = formatINR(totalOutflow);

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getExpenses({ limit: 200 });
        setExpenseLogs((res.data || []).map(mapExpense));
      } catch (err) {
        setError('Unable to load expense data. Please try again.');
        console.error('[Expenses] fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  const handleExport = () => {
    const exportData = expenseLogs.map(({ date, desc, category, amount, status }) => ({
      'Incurred Date': date,
      'Expenditure Item': desc,
      'Category': category,
      'Amount (₹)': amount,
      'Approval Status': status,
    }));
    exportToCSV(exportData, `Expense_Journal_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!formData.desc || !formData.amount) return;
    const amt = formData.amount.replace(/[₹,]/g, '');
    const newExpense = {
      _id:       `local-${Date.now()}`,
      date:      new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      desc:      formData.desc,
      category:  capitalize(formData.category),
      amount:    formatINR(Number(amt) || 0),
      status:    formData.status === 'paid' ? 'Approved' : 'Pending',
      rawAmount: Number(amt) || 0,
      rawStatus: formData.status,
    };
    setExpenseLogs([newExpense, ...expenseLogs]);
    setIsModalOpen(false);
    setFormData({ desc: '', category: 'salaries', amount: '', status: 'paid' });
  };

  const filteredExpenses = expenseLogs.filter(e =>
    e.desc.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'date', label: 'Incurred Date', sortable: true },
    {
      key: 'desc',
      label: 'Expenditure Item',
      sortable: true,
      render: (d) => <span className="font-medium text-light-text-primary dark:text-dark-text-primary">{d}</span>,
    },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'amount',
      label: 'Amount (₹)',
      sortable: true,
      render: (a) => <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{a}</span>,
    },
    {
      key: 'status',
      label: 'Approval Status',
      sortable: true,
      render: (s) => (
        <Badge variant={s === 'Approved' ? 'success' : 'warning'} dot>
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
          <h1 className="page-title">Corporate Operating Expenses</h1>
          <p className="page-subtitle">
            Audit operational disbursements, vendor payments, and expense allocations (in ₹).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="secondary" size="sm" onClick={handleExport} className="flex items-center gap-1.5">
            <FiDownload className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5">
            <FiPlus className="w-3.5 h-3.5" />
            <span>Log Expense</span>
          </Button>
        </div>
      </div>

      {/* ─── Summary KPIs & Donut ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            label="Total Outflow (All Time)"
            value={loading ? '—' : formatINR(totalOutflow)}
            change={`${expenseLogs.length} records`}
            trend="neutral"
            period="across all expense categories"
          />
          <StatCard
            label="Top Category"
            value={loading ? '—' : topCategory ? topCategory[0] : 'No data'}
            change={topCategory ? formatINR(topCategory[1]) : '—'}
            trend="neutral"
            period="highest spend category"
          />
          <StatCard
            label="Paid Expenses"
            value={loading ? '—' : formatINR(totalOutflow - pendingAmount)}
            change={`${expenseLogs.filter(e => e.rawStatus === 'paid').length} items`}
            trend="up"
            period="settled & approved"
          />
          <StatCard
            label="Pending / Unpaid"
            value={loading ? '—' : formatINR(pendingAmount)}
            change={pendingAmount > 0 ? 'Needs attention' : 'All clear'}
            trend={pendingAmount > 0 ? 'down' : 'neutral'}
            period="awaiting approval or payment"
          />
        </div>

        {/* Cost Structure Donut */}
        <Card padding={true}>
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-light-border dark:border-dark-border">
            <div>
              <span className="text-[10px] font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                Cost Breakdown
              </span>
              <h4 className="text-xs sm:text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                Department Spend
              </h4>
            </div>
            <Badge variant="neutral">{loading ? '…' : totalStr}</Badge>
          </div>
          <div className="h-[150px]">
            <DonutChartWidget
              data={categoryShare}
              centerLabel="Total Spend"
              centerValue={loading ? '…' : totalStr}
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
            Expense Journal Records
            {loading && <span className="ml-2 text-xs font-normal text-light-text-muted dark:text-dark-text-muted">Loading…</span>}
          </h3>
          <div className="w-64">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search expenses or categories..."
            />
          </div>
        </div>

        <Card padding={false} className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-light-text-muted dark:text-dark-text-muted">
              Loading expense data…
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredExpenses}
              emptyMessage="No expenses found."
            />
          )}
        </Card>
      </div>

      {/* ─── Log Expense Modal ─── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Corporate Expenditure"
        subtitle="Record an operating disbursement into the corporate ledger."
        size="md"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <Input
            label="Item Description"
            placeholder="e.g. Server compute reservation extension"
            value={formData.desc}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Disbursement Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field py-1.5 text-xs font-medium cursor-pointer"
              >
                <option value="salaries">Salaries</option>
                <option value="rent">Rent</option>
                <option value="utilities">Utilities</option>
                <option value="marketing">Marketing</option>
                <option value="transportation">Transportation</option>
                <option value="technology">Technology</option>
                <option value="maintenance">Maintenance</option>
                <option value="taxes">Taxes</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Input
              label="Amount (₹)"
              placeholder="e.g. 120000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
              Payment Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-field py-1.5 text-xs font-medium cursor-pointer"
            >
              <option value="paid">Paid / Approved</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
