import React, { useState, useEffect } from 'react';
import { getCustomers } from '../services/api';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import StatCard from '../components/ui/StatCard';
import { FiPlus, FiDownload } from 'react-icons/fi';
import { exportToCSV } from '../utils/exportUtils';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: 'Textiles & Garments',
    revenue: '',
    plan: 'Enterprise',
    since: '2026',
    status: 'Active',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCustomers();
        setCustomers(res.data || []);
      } catch (err) {
        console.error('Error fetching customers', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExport = () => {
    const exportData = customers.map(({ name, industry, revenue, plan, since, status }) => ({
      'Company Name': name,
      'Sector': industry,
      'Annual ARR': revenue,
      'Service Tier': plan,
      'Client Since': since,
      'Account Health': status,
    }));
    exportToCSV(exportData, `Enterprise_Clients_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.revenue) return;

    const formattedRevenue = formData.revenue.startsWith('₹') ? formData.revenue : `₹${formData.revenue}`;
    const newCustomer = {
      id: Date.now(),
      ...formData,
      revenue: formattedRevenue,
    };

    setCustomers([newCustomer, ...customers]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      industry: 'Textiles & Garments',
      revenue: '',
      plan: 'Enterprise',
      since: '2026',
      status: 'Active',
    });
  };

  const filtered = customers.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase());
    const matchesSector = sectorFilter === 'All' || c.industry.includes(sectorFilter);
    return matchesSearch && matchesSector;
  });

  const columns = [
    {
      key: 'name',
      label: 'Enterprise Account',
      sortable: true,
      render: (n) => <span className="font-medium text-light-text-primary dark:text-dark-text-primary">{n}</span>,
    },
    { key: 'industry', label: 'Sector', sortable: true },
    {
      key: 'revenue',
      label: 'Annual Contract ARR',
      sortable: true,
      render: (v) => <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{v}</span>,
    },
    {
      key: 'plan',
      label: 'Service Tier',
      sortable: true,
      render: (p) => <Badge variant={p === 'Enterprise' ? 'primary' : 'neutral'}>{p}</Badge>,
    },
    { key: 'since', label: 'Client Since', sortable: true },
    {
      key: 'status',
      label: 'Health Status',
      sortable: true,
      render: (s) => (
        <Badge variant={s === 'Active' ? 'success' : s === 'At Risk' ? 'danger' : 'warning'} dot>
          {s}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Enterprise Client Registry</h1>
          <p className="page-subtitle">Monitor client accounts, contract values, sector distribution, and health statuses.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="secondary" size="sm" onClick={handleExport} className="flex items-center gap-1.5">
            <FiDownload className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5">
            <FiPlus className="w-3.5 h-3.5" />
            <span>Add Account</span>
          </Button>
        </div>
      </div>

      {/* ─── Summary KPIs ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Active Accounts"
          value={`${customers.length} Enterprises`}
          change="+8.9%"
          trend="up"
          period="vs prior quarter"
        />
        <StatCard
          label="Total Contracted ARR"
          value="₹5.82Cr"
          change="+14.2%"
          trend="up"
          period="annual run-rate"
        />
        <StatCard
          label="Average ARR per Account"
          value="₹72.8L"
          change="+4.8%"
          trend="up"
          period="per enterprise client"
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="tab-bar">
          {['All', 'Textiles', 'Retail', 'Food', 'Manufacturing'].map((sector) => (
            <button
              key={sector}
              onClick={() => setSectorFilter(sector)}
              className={sectorFilter === sector ? 'tab-btn-active' : 'tab-btn'}
            >
              {sector}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search clients or sectors..."
          />
        </div>
      </div>

      {/* ─── Table ─── */}
      <Card padding={false} className="overflow-hidden">
        <Table
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage="No customer accounts match your search filters."
        />
      </Card>

      {/* ─── Add Customer Modal ─── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Onboard Corporate Account"
        subtitle="Add a new commercial client to the enterprise intelligence registry."
        size="md"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <Input
            label="Company Name"
            placeholder="e.g. Vardaan Electronics Pvt. Ltd."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Industry Sector
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="input-field py-1.5 text-xs font-medium cursor-pointer"
              >
                <option value="Textiles & Garments">Textiles & Garments</option>
                <option value="Retail & FMCG">Retail & FMCG</option>
                <option value="Food Processing">Food Processing</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Service Tier
              </label>
              <select
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                className="input-field py-1.5 text-xs font-medium cursor-pointer"
              >
                <option value="Enterprise">Enterprise Tier</option>
                <option value="Pro Tier">Pro Tier</option>
                <option value="Starter">Starter Tier</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Annual ARR (₹)"
              placeholder="e.g. ₹85.0L"
              value={formData.revenue}
              onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field py-1.5 text-xs font-medium cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Onboarding">Onboarding</option>
                <option value="At Risk">At Risk</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
