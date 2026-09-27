import React, { useState } from 'react';
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

const Expenses = () => {
  const [expenseLogs, setExpenseLogs] = useState([
    { date: 'Oct 6, 2026', desc: 'AWS Mumbai Dedicated Cloud Compute Cluster', category: 'Infrastructure', amount: '₹8,24,000', status: 'Approved' },
    { date: 'Oct 4, 2026', desc: 'BluePeak Logistics Regional Freight Dispatches', category: 'Logistics', amount: '₹4,80,000', status: 'Approved' },
    { date: 'Sep 30, 2026', desc: 'Enterprise SaaS Software Seat Subscriptions', category: 'Operations', amount: '₹2,10,000', status: 'Approved' },
    { date: 'Sep 28, 2026', desc: 'Bengaluru Development Center Hardware Nodes', category: 'Infrastructure', amount: '₹1,90,000', status: 'Pending' },
    { date: 'Sep 24, 2026', desc: 'B2B Enterprise Marketing & Trade Event Booth', category: 'Marketing', amount: '₹1,36,000', status: 'Approved' },
  ]);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    desc: '',
    category: 'Infrastructure',
    amount: '',
    status: 'Approved',
  });

  const categoryShare = [
    { name: 'Infrastructure', value: 45, color: '#5278A6' },
    { name: 'Logistics', value: 26, color: '#5A8065' },
    { name: 'Marketing', value: 18, color: '#8178A2' },
    { name: 'Operations', value: 11, color: '#B18A4A' },
  ];

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

    const formattedAmount = formData.amount.startsWith('₹') ? formData.amount : `₹${formData.amount}`;
    const newExpense = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      desc: formData.desc,
      category: formData.category,
      amount: formattedAmount,
      status: formData.status,
    };

    setExpenseLogs([newExpense, ...expenseLogs]);
    setIsModalOpen(false);
    setFormData({
      desc: '',
      category: 'Infrastructure',
      amount: '',
      status: 'Approved',
    });
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
          <h1 className="page-title">
            Corporate Operating Expenses
          </h1>
          <p className="page-subtitle">
            Audit operational disbursements, cloud hosting spend, and logistics disbursements (in ₹).
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
            label="Total Monthly Outflow"
            value="₹18.4L"
            change="+3.2%"
            trend="down"
            period="current 30 days"
          />
          <StatCard
            label="Cloud & Infrastructure"
            value="₹8.24L"
            change="44.8% of spend"
            trend="neutral"
            period="AWS Mumbai region"
          />
          <StatCard
            label="Logistics & Dispatch"
            value="₹4.80L"
            change="+6.2%"
            trend="down"
            period="freight corridor rate"
          />
          <StatCard
            label="Pending Invoices"
            value="₹1.90L"
            change="1 item"
            trend="neutral"
            period="under management review"
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
            <Badge variant="neutral">₹18.4L</Badge>
          </div>
          <div className="h-[150px]">
            <DonutChartWidget
              data={categoryShare}
              centerLabel="Monthly Spend"
              centerValue="₹18.4L"
              height={150}
            />
          </div>
        </Card>
      </div>

      {/* ─── Search & Table ─── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
            Expense Journal Records
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
          <Table
            columns={columns}
            data={filteredExpenses}
            emptyMessage="No expenses found matching search."
          />
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
                <option value="Infrastructure">Infrastructure</option>
                <option value="Logistics">Logistics</option>
                <option value="Operations">Operations</option>
                <option value="Marketing">Marketing</option>
                <option value="R&D">R&D</option>
              </select>
            </div>

            <Input
              label="Amount (₹)"
              placeholder="e.g. ₹1,20,000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
              Approval Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-field py-1.5 text-xs font-medium cursor-pointer"
            >
              <option value="Approved">Approved</option>
              <option value="Pending">Pending Review</option>
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
