import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { DonutChartWidget } from '../components/charts/Charts';
import { FiPlus, FiDownload, FiBox, FiTag, FiDollarSign } from 'react-icons/fi';
import { exportToCSV } from '../utils/exportUtils';

const Inventory = () => {
  const [stockItems, setStockItems] = useState([
    { sku: 'SKU-8821', name: 'Enterprise Analytics Dedicated Instance', category: 'Software Assets', stock: 12, price: '₹4,20,000', status: 'Low Stock' },
    { sku: 'SKU-4532', name: 'Vardaan Gateway Edge Node', category: 'Hardware Nodes', stock: 45, price: '₹12,000', status: 'In Stock' },
    { sku: 'SKU-9901', name: 'Database Mirroring Appliance v3', category: 'Hardware Nodes', stock: 8, price: '₹85,000', status: 'Low Stock' },
    { sku: 'SKU-1024', name: 'Developer REST API Token Pack', category: 'Virtual Assets', stock: 840, price: '₹900', status: 'In Stock' },
    { sku: 'SKU-2048', name: 'Copilot AI Vector Query Tokens', category: 'Virtual Assets', stock: 1420, price: '₹400', status: 'In Stock' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Software Assets',
    stock: '',
    price: '',
    status: 'In Stock'
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
      'Status': status
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
      status: formData.status
    };

    setStockItems([newItem, ...stockItems]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      category: 'Software Assets',
      stock: '',
      price: '',
      status: 'In Stock'
    });
  };

  const columns = [
    { key: 'sku', label: 'SKU Code', sortable: true },
    { key: 'name', label: 'Resource Item', sortable: true, render: (n) => <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{n}</span> },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'stock', label: 'Quantity Available', sortable: true },
    { key: 'price', label: 'Unit Rate', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (s) => (
      <Badge variant={s === 'In Stock' ? 'success' : 'warning'}>{s}</Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight">Enterprise Asset Inventory</h1>
          <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mt-0.5">Manage virtual API tokens, software licenses, and hardware node assets.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={handleExport} className="flex items-center gap-1.5">
            <FiDownload className="w-4 h-4" /> Export Assets CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5">
            <FiPlus className="w-4 h-4" /> Add Asset Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" padding={false}>
          <Table columns={columns} data={stockItems} />
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Stock Category Allocation</h3>
          <DonutChartWidget data={distribution} centerLabel="Asset Breakdown" centerValue="3 Classes" height={220} />
        </Card>
      </div>

      {/* Add Asset Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Resource Asset"
        subtitle="Catalog a new license, token pack, or hardware node."
        size="md"
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          <Input
            label="Resource Item Name"
            placeholder="e.g. Dedicated GPU Inference Cluster"
            icon={FiBox}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                <option value="Software Assets">Software Assets</option>
                <option value="Virtual Assets">Virtual Assets</option>
                <option value="Hardware Nodes">Hardware Nodes</option>
              </select>
            </div>

            <Input
              label="Stock Quantity"
              type="number"
              placeholder="e.g. 50"
              icon={FiTag}
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Unit Rate (₹)"
              placeholder="e.g. 15,000"
              icon={FiDollarSign}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1.5">
                Stock Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-primary"
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Resource Asset
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
