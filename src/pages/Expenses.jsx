import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { PieChartWidget } from '../components/charts/Charts';
import { FiPlus, FiDownload, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { exportToCSV } from '../utils/exportUtils';

const Expenses = () => {
  const [expenseLogs, setExpenseLogs] = useState([
    { date: 'Oct 6, 2025', desc: 'AWS Mumbai Cloud Datacenter Infrastructure', category: 'Infrastructure', amount: '₹14,24,000', status: 'Approved' },
    { date: 'Oct 4, 2025', desc: 'B2B Enterprise Marketing Campaign', category: 'Marketing', amount: '₹8,50,000', status: 'Approved' },
    { date: 'Sep 30, 2025', desc: 'Enterprise SaaS Software Seat Renewals', category: 'Operations', amount: '₹3,80,000', status: 'Approved' },
    { date: 'Sep 28, 2025', desc: 'Bengaluru R&D Center Hardware Upgrades', category: 'Infrastructure', amount: '₹1,90,000', status: 'Pending Approval' },
    { date: 'Sep 24, 2025', desc: 'Tech Conference & Developer Hackathon Sponsorship', category: 'R&D', amount: '₹2,40,000', status: 'Approved' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    desc: '',
    category: 'Infrastructure',
    amount: '',
    status: 'Approved'
  });

  const categoryShare = [
    { name: 'Infrastructure', value: 45, color: '#5278A6' },
    { name: 'Marketing', value: 25, color: '#8178A2' },
    { name: 'R&D', value: 20, color: '#B18A4A' },
    { name: 'Operations', value: 10, color: '#5A8065' },
  ];

  const handleExport = () => {
    const exportData = expenseLogs.map(({ date, desc, category, amount, status }) => ({
      'Incurred Date': date,
      'Expenditure Item': desc,
      'Category': category,
      'Amount': amount,
      'Approval Status': status
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
      status: formData.status
    };

    setExpenseLogs([newExpense, ...expenseLogs]);
    setIsModalOpen(false);
    setFormData({
      desc: '',
      category: 'Infrastructure',
      amount: '',
      status: 'Approved'
    });
  };

  const columns = [
    { key: 'date', label: 'Incurred Date', sortable: true },
    { key: 'desc', label: 'Expenditure Item', sortable: true, render: (d) => <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{d}</span> },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'amount', label: 'Value', sortable: true },
    { key: 'status', label: 'Approval Status', sortable: true, render: (s) => (
      <Badge variant={s === 'Approved' ? 'success' : 'warning'}>{s}</Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight">Corporate Expenditure Logs</h1>
          <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mt-0.5">Track and review corporate operational expenses, SaaS costs, and cloud infrastructure limits (in ₹).</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={handleExport} className="flex items-center gap-1.5">
            <FiDownload className="w-4 h-4" /> Export Expenses CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5">
            <FiPlus className="w-4 h-4" /> Log Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" padding={false}>
          <Table columns={columns} data={expenseLogs} />
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Expenditure Category Allocation</h3>
          <PieChartWidget data={categoryShare} height={220} />
        </Card>
      </div>

      {/* Log Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Expenditure Item"
        subtitle="Submit a corporate expense for budget tracking and approval."
        size="md"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <Input
            label="Item Description"
            placeholder="e.g. AWS Cloud Infrastructure Expansion"
            icon={FiCreditCard}
            value={formData.desc}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-primary"
              >
                <option value="Infrastructure">Infrastructure</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
                <option value="R&D">R&D</option>
              </select>
            </div>

            <Input
              label="Amount (₹)"
              placeholder="e.g. ₹2,50,000"
              icon={FiDollarSign}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1.5">
              Approval Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-primary"
            >
              <option value="Approved">Approved</option>
              <option value="Pending Approval">Pending Approval</option>
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-4">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Expense Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
