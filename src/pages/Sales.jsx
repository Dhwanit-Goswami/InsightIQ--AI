import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { BarChartWidget } from '../components/charts/Charts';
import { FiPlus, FiDownload, FiShoppingCart, FiDollarSign } from 'react-icons/fi';
import { exportToCSV } from '../utils/exportUtils';

const Sales = () => {
  const [salesHistory, setSalesHistory] = useState([
    { date: 'Oct 5, 2025', id: '#SL-9901', customer: 'Arvind Textiles Pvt. Ltd.', items: 'Enterprise ERP Suite x1', total: '₹24.5L', method: 'NEFT Transfer', status: 'Settled' },
    { date: 'Oct 3, 2025', id: '#SL-9887', customer: 'NovaMart Retail Pvt. Ltd.', items: 'Analytics Pro x2', total: '₹12.8L', method: 'RTGS Invoice', status: 'Settled' },
    { date: 'Sep 29, 2025', id: '#SL-9844', customer: 'Shreeji Foods Pvt. Ltd.', items: 'GST Addon Module x1', total: '₹8.5L', method: 'Corporate NetBanking', status: 'Settled' },
    { date: 'Sep 28, 2025', id: '#SL-9821', customer: 'BluePeak Logistics', items: 'SME Starter Pack x1', total: '₹4.2L', method: 'NEFT Invoice', status: 'Pending' },
    { date: 'Sep 25, 2025', id: '#SL-9802', customer: 'Kesar Healthcare', items: 'Annual Support Pack x12', total: '₹19.2L', method: 'RTGS Transfer', status: 'Settled' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    items: '',
    total: '',
    method: 'NEFT Transfer',
    status: 'Settled'
  });

  const chartData = [
    { month: 'Jul', sales: 194 },
    { month: 'Aug', sales: 206 },
    { month: 'Sep', sales: 193 },
    { month: 'Oct', sales: 218 },
    { month: 'Nov', sales: 238 },
    { month: 'Dec', sales: 264 },
  ];

  const handleExport = () => {
    const exportData = salesHistory.map(({ date, id, customer, items, total, method, status }) => ({
      'Date': date,
      'Order ID': id,
      'Client': customer,
      'Line Items': items,
      'Total Value': total,
      'Payment Channel': method,
      'Settlement': status
    }));
    exportToCSV(exportData, `Sales_Journal_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleAddSale = (e) => {
    e.preventDefault();
    if (!formData.customer || !formData.total) return;

    const formattedTotal = formData.total.startsWith('₹') ? formData.total : `₹${formData.total}`;
    const newSale = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      id: `#SL-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: formData.customer,
      items: formData.items || 'Standard Service Pack x1',
      total: formattedTotal,
      method: formData.method,
      status: formData.status
    };

    setSalesHistory([newSale, ...salesHistory]);
    setIsModalOpen(false);
    setFormData({
      customer: '',
      items: '',
      total: '',
      method: 'NEFT Transfer',
      status: 'Settled'
    });
  };

  const columns = [
    { key: 'date', label: 'Sale Date', sortable: true },
    { key: 'id', label: 'Sale ID' },
    { key: 'customer', label: 'Client', sortable: true, render: (c) => <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{c}</span> },
    { key: 'items', label: 'Line Items' },
    { key: 'total', label: 'Total Value', sortable: true },
    { key: 'method', label: 'Payment Channel' },
    { key: 'status', label: 'Settlement', sortable: true, render: (s) => (
      <Badge variant={s === 'Settled' ? 'success' : 'warning'}>{s}</Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight">Sales Order Journal</h1>
          <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mt-0.5">Track transactional orders, payment channels, and settlement status (in ₹).</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={handleExport} className="flex items-center gap-1.5">
            <FiDownload className="w-4 h-4" /> Export Journal CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5">
            <FiPlus className="w-4 h-4" /> Record New Sale
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" padding={false}>
          <Table columns={columns} data={salesHistory} />
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Monthly Sales Trajectory</h3>
          <BarChartWidget
            data={chartData}
            keys={[{ key: 'sales', name: 'Sales (₹L)', color: '#5278A6' }]}
            formatter={(v) => `₹${v}L`}
            height={220}
          />
        </Card>
      </div>

      {/* Record New Sale Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Sales Order"
        subtitle="Log a completed or pending enterprise sales transaction."
        size="md"
      >
        <form onSubmit={handleAddSale} className="space-y-4">
          <Input
            label="Client Name"
            placeholder="e.g. Vardaan Solutions Pvt. Ltd."
            icon={FiShoppingCart}
            value={formData.customer}
            onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
            required
          />

          <Input
            label="Line Items / Products"
            placeholder="e.g. Analytics Suite Pro x2"
            value={formData.items}
            onChange={(e) => setFormData({ ...formData, items: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Value (₹)"
              placeholder="e.g. 15.4L"
              icon={FiDollarSign}
              value={formData.total}
              onChange={(e) => setFormData({ ...formData, total: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1.5">
                Payment Channel
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-primary"
              >
                <option value="NEFT Transfer">NEFT Transfer</option>
                <option value="RTGS Invoice">RTGS Invoice</option>
                <option value="Corporate NetBanking">Corporate NetBanking</option>
                <option value="UPI Business">UPI Business</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1.5">
              Settlement Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-primary"
            >
              <option value="Settled">Settled</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-4">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Submit Sales Journal Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sales;
