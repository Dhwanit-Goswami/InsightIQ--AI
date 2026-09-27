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

const Inventory = () => {
  const [stockItems, setStockItems] = useState([
    { sku: 'SKU-8821', name: 'Enterprise Analytics Dedicated Instance', category: 'Software Assets', stock: 12, price: '₹4,20,000', status: 'Low Stock' },
    { sku: 'SKU-4532', name: 'Vardaan Gateway Edge Node', category: 'Hardware Nodes', stock: 45, price: '₹12,000', status: 'In Stock' },
    { sku: 'SKU-9901', name: 'Database Mirroring Appliance v3', category: 'Hardware Nodes', stock: 8, price: '₹85,000', status: 'Low Stock' },
    { sku: 'SKU-1024', name: 'Developer REST API Token Pack', category: 'Virtual Assets', stock: 840, price: '₹900', status: 'In Stock' },
    { sku: 'SKU-2048', name: 'Copilot AI Vector Query Tokens', category: 'Virtual Assets', stock: 1420, price: '₹400', status: 'In Stock' },
  ]);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Software Assets',
    stock: '',
    price: '',
    status: 'In Stock',
  });

  const distribution = [
    { name: 'Virtual Assets', value: 55, color: '#5278A6' },
    { name: 'Software Assets', value: 30, color: '#5A8065' },
    { name: 'Hardware Nodes', value: 15, color: '#8178A2' },
  ];

  const handleExport = () => {
    const exportData = stockItems.map(({ sku, name, category, stock, price, status }) => ({
      'SKU Code': sku,
      'Resource Item': name,
      'Category': category,
      'Stock Quantity': stock,
      'Unit Rate': price,
      'Status': status,
    }));
    exportToCSV(exportData, `Asset_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const formattedPrice = formData.price.startsWith('₹') ? formData.price : `₹${formData.price}`;
    const newItem = {
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name,
      category: formData.category,
      stock: parseInt(formData.stock, 10) || 1,
      price: formattedPrice,
      status: formData.status,
    };

    setStockItems([newItem, ...stockItems]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      category: 'Software Assets',
      stock: '',
      price: '',
      status: 'In Stock',
    });
  };

  const filteredItems = stockItems.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'sku', label: 'SKU Code', sortable: true, render: (s) => <span className="font-mono text-xs">{s}</span> },
    {
      key: 'name',
      label: 'Resource Item',
      sortable: true,
      render: (n) => <span className="font-medium text-light-text-primary dark:text-dark-text-primary">{n}</span>,
    },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'stock',
      label: 'Quantity Available',
      sortable: true,
      render: (q) => <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{q.toLocaleString('en-IN')}</span>,
    },
    { key: 'price', label: 'Unit Rate (₹)', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (s) => (
        <Badge variant={s === 'In Stock' ? 'success' : 'warning'} dot>
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
            Inventory & Asset Management
          </h1>
          <p className="page-subtitle">
            Monitor stock thresholds, hardware node balances, and software license availability.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="secondary" size="sm" onClick={handleExport} className="flex items-center gap-1.5">
            <FiDownload className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5">
            <FiPlus className="w-3.5 h-3.5" />
            <span>Add SKU Item</span>
          </Button>
        </div>
      </div>

      {/* ─── Summary KPIs & Donut ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            label="Total Tracked SKUs"
            value={`${stockItems.length} Products`}
            change="All active"
            trend="neutral"
            period="across 3 asset categories"
          />
          <StatCard
            label="Stock Valuation"
            value="₹78.4L"
            change="+4.2%"
            trend="up"
            period="current book value"
          />
          <StatCard
            label="Low Buffer Thresholds"
            value="2 SKUs"
            change="Action needed"
            trend="down"
            period="Surat & Pune warehouses"
          />
          <StatCard
            label="Average Turnover Days"
            value="38 Days"
            change="-4 days"
            trend="up"
            period="DSI benchmark: 45 days"
          />
        </div>

        {/* Asset Category Distribution */}
        <Card padding={true}>
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-light-border dark:border-dark-border">
            <div>
              <span className="text-[10px] font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
                Category Split
              </span>
              <h4 className="text-xs sm:text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                Asset Allocation
              </h4>
            </div>
            <Badge variant="neutral">3 Tiers</Badge>
          </div>
          <div className="h-[150px]">
            <DonutChartWidget
              data={distribution}
              centerLabel="Active Inventory"
              centerValue="₹78.4L"
              height={150}
            />
          </div>
        </Card>
      </div>

      {/* ─── Search & Table ─── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
            SKU Registry & Stock Levels
          </h3>
          <div className="w-64">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search SKUs or categories..."
            />
          </div>
        </div>

        <Card padding={false} className="overflow-hidden">
          <Table
            columns={columns}
            data={filteredItems}
            emptyMessage="No inventory assets match your search."
          />
        </Card>
      </div>

      {/* ─── Add Item Modal ─── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Inventory Resource Item"
        subtitle="Register a new software license, virtual token, or hardware node."
        size="md"
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          <Input
            label="Item Description / Name"
            placeholder="e.g. Dedicated Enterprise Node v2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Asset Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field py-1.5 text-xs font-medium cursor-pointer"
              >
                <option value="Software Assets">Software Assets</option>
                <option value="Hardware Nodes">Hardware Nodes</option>
                <option value="Virtual Assets">Virtual Assets</option>
              </select>
            </div>

            <Input
              label="Available Quantity"
              type="number"
              placeholder="e.g. 50"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Unit Rate (₹)"
              placeholder="e.g. ₹24,000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Initial Stock Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field py-1.5 text-xs font-medium cursor-pointer"
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
