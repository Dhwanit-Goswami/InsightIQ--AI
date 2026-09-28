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
import { getInventory } from '../services/api';

// ── helpers ───────────────────────────────────────────────────────────────────
const formatINR = (value) => {
  const num = Number(value);
  if (isNaN(num)) return '₹0';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000)     return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString('en-IN')}`;
};

const mapInventoryItem = (item) => {
  const qty = Number(item.quantity || 0);
  const reorder = Number(item.reorder_level || 10);
  const isLow = qty <= reorder;
  return {
    _id:      item.id,
    sku:      item.product?.sku || '—',
    name:     item.product?.name || '—',
    category: item.product?.category || 'General',
    stock:    qty,
    price:    formatINR(item.product?.selling_price || 0),
    status:   isLow ? 'Low Stock' : 'In Stock',
    reorder,
    location: item.warehouse_location || '—',
    rawPrice: Number(item.product?.selling_price || 0),
  };
};

// Build donut chart distribution from real inventory data
const buildDistribution = (items) => {
  const COLORS = ['#5278A6', '#5A8065', '#8178A2', '#B07040', '#A65278', '#408065'];
  const catMap = {};
  items.forEach(item => {
    catMap[item.category] = (catMap[item.category] || 0) + 1;
  });
  return Object.entries(catMap).map(([name, count], i) => ({
    name,
    value: Math.round((count / items.length) * 100),
    color: COLORS[i % COLORS.length],
  }));
};

// ── component ──────────────────────────────────────────────────────────────────
const Inventory = () => {
  const [stockItems, setStockItems]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData]       = useState({
    name: '', category: 'POS Hardware', stock: '', price: '', status: 'In Stock',
  });

  // Computed stats
  const lowStockItems  = stockItems.filter(i => i.status === 'Low Stock');
  const totalValuation = stockItems.reduce((s, i) => s + i.rawPrice * i.stock, 0);
  const distribution   = stockItems.length ? buildDistribution(stockItems) : [
    { name: 'No Data', value: 100, color: '#94a3b8' },
  ];

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getInventory();
        setStockItems((res.data || []).map(mapInventoryItem));
      } catch (err) {
        setError('Unable to load inventory data. Please try again.');
        console.error('[Inventory] fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const handleExport = () => {
    const exportData = stockItems.map(({ sku, name, category, stock, price, status, location }) => ({
      'SKU Code': sku,
      'Resource Item': name,
      'Category': category,
      'Quantity Available': stock,
      'Unit Rate': price,
      'Status': status,
      'Location': location,
    }));
    exportToCSV(exportData, `Asset_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;
    const formattedPrice = formData.price.startsWith('₹') ? formData.price : `₹${formData.price}`;
    const qty = parseInt(formData.stock, 10) || 1;
    const newItem = {
      _id:      `local-${Date.now()}`,
      sku:      `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name:     formData.name,
      category: formData.category,
      stock:    qty,
      price:    formattedPrice,
      status:   formData.status,
      reorder:  10,
      location: 'Main Hub',
      rawPrice: 0,
    };
    setStockItems([newItem, ...stockItems]);
    setIsModalOpen(false);
    setFormData({ name: '', category: 'POS Hardware', stock: '', price: '', status: 'In Stock' });
  };

  const filteredItems = stockItems.filter(item =>
    (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.sku || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(search.toLowerCase())
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
      render: (q) => <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{Number(q).toLocaleString('en-IN')}</span>,
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
          <h1 className="page-title">Inventory &amp; Asset Management</h1>
          <p className="page-subtitle">
            Monitor stock thresholds, product quantities, and low-stock alerts.
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
            value={loading ? '—' : `${stockItems.length} Products`}
            change="All active"
            trend="neutral"
            period="across all categories"
          />
          <StatCard
            label="Stock Valuation"
            value={loading ? '—' : formatINR(totalValuation)}
            change="current book value"
            trend="up"
            period="quantity × unit price"
          />
          <StatCard
            label="Low Buffer Thresholds"
            value={loading ? '—' : `${lowStockItems.length} SKUs`}
            change={lowStockItems.length > 0 ? 'Action needed' : 'All levels OK'}
            trend={lowStockItems.length > 0 ? 'down' : 'up'}
            period="at or below reorder level"
          />
          <StatCard
            label="Categories Tracked"
            value={loading ? '—' : `${new Set(stockItems.map(i => i.category)).size} types`}
            change="product categories"
            trend="neutral"
            period="across inventory"
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
            <Badge variant="neutral">{new Set(stockItems.map(i => i.category)).size} Tiers</Badge>
          </div>
          <div className="h-[150px]">
            <DonutChartWidget
              data={distribution}
              centerLabel="Active Inventory"
              centerValue={loading ? '…' : formatINR(totalValuation)}
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
            SKU Registry &amp; Stock Levels
            {loading && <span className="ml-2 text-xs font-normal text-light-text-muted dark:text-dark-text-muted">Loading…</span>}
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
          {loading ? (
            <div className="p-8 text-center text-xs text-light-text-muted dark:text-dark-text-muted">
              Loading inventory data…
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredItems}
              emptyMessage="No inventory items found."
            />
          )}
        </Card>
      </div>

      {/* ─── Add Item Modal ─── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Inventory Resource Item"
        subtitle="Register a new product or asset in the inventory."
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
                <option value="POS Hardware">POS Hardware</option>
                <option value="Networking &amp; IT">Networking &amp; IT</option>
                <option value="Packaging &amp; Supplies">Packaging &amp; Supplies</option>
                <option value="Retail Display">Retail Display</option>
                <option value="Security &amp; Vault">Security &amp; Vault</option>
                <option value="Office Equipment">Office Equipment</option>
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
