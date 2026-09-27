import React, { useState } from 'react';
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

const Sales = () => {
  const [salesHistory, setSalesHistory] = useState([
    { date: 'Oct 5, 2026', id: '#SL-9901', customer: 'Arvind Textiles Pvt. Ltd.', items: 'Enterprise Analytics Suite x1', total: '₹24.5L', method: 'NEFT Transfer', status: 'Settled' },
    { date: 'Oct 3, 2026', id: '#SL-9887', customer: 'NovaMart Retail Pvt. Ltd.', items: 'Analytics Pro Edition x2', total: '₹12.8L', method: 'RTGS Transfer', status: 'Settled' },
    { date: 'Sep 29, 2026', id: '#SL-9844', customer: 'Shreeji Foods Pvt. Ltd.', items: 'GST Reconciliation Module x1', total: '₹8.5L', method: 'Corporate NetBanking', status: 'Settled' },
    { date: 'Sep 28, 2026', id: '#SL-9821', customer: 'BluePeak Logistics Pvt. Ltd.', items: 'SME Starter Pack x1', total: '₹4.2L', method: 'NEFT Transfer', status: 'Pending' },
    { date: 'Sep 25, 2026', id: '#SL-9802', customer: 'Kesar Healthcare Solutions', items: 'Annual Support SLA x12', total: '₹19.2L', method: 'RTGS Transfer', status: 'Settled' },
  ]);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    items: '',
    total: '',
    method: 'NEFT Transfer',
    status: 'Settled',
  });

  const chartData = [
    { month: 'May', sales: 172 },
    { month: 'Jun', sales: 185 },
    { month: 'Jul', sales: 194 },
    { month: 'Aug', sales: 206 },
    { month: 'Sep', sales: 218 },
    { month: 'Oct', sales: 238 },
  ];

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

  const handleAddSale = (e) => {
    e.preventDefault();
    if (!formData.customer || !formData.total) return;

    const formattedTotal = formData.total.startsWith('₹') ? formData.total : `₹${formData.total}`;
    const newSale = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      id: `#SL-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: formData.customer,
      items: formData.items || 'Standard Solution Pack x1',
      total: formattedTotal,
      method: formData.method,
      status: formData.status,
    };

    setSalesHistory([newSale, ...salesHistory]);
    setIsModalOpen(false);
    setFormData({
      customer: '',
      items: '',
      total: '',
      method: 'NEFT Transfer',
      status: 'Settled',
    });
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
          <h1 className="page-title">
            Commercial Sales Orders
          </h1>
          <p className="page-subtitle">
            Track wholesale orders, invoice reconciliation, and RTGS/NEFT settlement channels (in ₹).
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
            value="₹69.2L"
            change="+14.2%"
            trend="up"
            period="current 30-day run"
          />
          <StatCard
            label="Average Deal Value"
            value="₹13.8L"
            change="+6.5%"
            trend="up"
            period="across corporate orders"
          />
          <StatCard
            label="Settlement Rate"
            value="93.8%"
            change="+2.1%"
            trend="up"
            period="on-time RTGS / NEFT"
          />
          <StatCard
            label="Receivables Pipeline"
            value="₹4.2L"
            change="1 pending"
            trend="neutral"
            period="due in 14 days"
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
                Monthly Orders Completed
              </h4>
            </div>
            <Badge variant="neutral">238 Orders</Badge>
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

      {/* ─── Search & Table ─── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
            Sales Journal Entries
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
          <Table
            columns={columns}
            data={filteredSales}
            emptyMessage="No sales transactions found matching search."
          />
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
