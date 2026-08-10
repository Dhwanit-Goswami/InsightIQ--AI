import React, { useState, useEffect } from 'react';
import { getCustomers } from '../services/api';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { FiPlus, FiDownload, FiUserCheck, FiDollarSign } from 'react-icons/fi';
import { exportToCSV } from '../utils/exportUtils';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: 'Software & Technology',
    revenue: '',
    plan: 'Enterprise Tier',
    since: new Date().getFullYear().toString(),
    status: 'Active'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCustomers();
        setCustomers(res.data);
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
      'ARR Value': revenue,
      'Service Tier': plan,
      'Client Since': since,
      'Account Health': status
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
      revenue: formattedRevenue
    };

    setCustomers([newCustomer, ...customers]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      industry: 'Software & Technology',
      revenue: '',
      plan: 'Enterprise Tier',
      since: new Date().getFullYear().toString(),
      status: 'Active'
    });
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'name', label: 'Company Name', sortable: true, render: (n) => <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{n}</span> },
    { key: 'industry', label: 'Sector', sortable: true },
    { key: 'revenue', label: 'Annual ARR', sortable: true },
    { key: 'plan', label: 'Service Tier', sortable: true },
    { key: 'since', label: 'Client Since', sortable: true },
    { key: 'status', label: 'Account Health', sortable: true, render: (s) => (
      <Badge variant={s === 'Active' ? 'success' : s === 'Onboarding' ? 'primary' : 'warning'}>{s}</Badge>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight">Enterprise Client Database</h1>
          <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mt-0.5">View corporate client distributions, service tiers, and contract ARR values (in ₹).</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={handleExport} className="flex items-center gap-1.5">
            <FiDownload className="w-4 h-4" /> Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5">
            <FiPlus className="w-4 h-4" /> Add New Client
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex justify-between items-center">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Filter companies or sectors..."
          className="w-72"
        />
        <span className="text-xs text-light-text-muted dark:text-dark-text-muted font-medium">
          Showing {filtered.length} client accounts
        </span>
      </div>

      {/* Data Table */}
      <Card padding={false}>
        <Table
          columns={columns}
          data={filtered}
          loading={loading}
        />
      </Card>

      {/* Add Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Enterprise Client"
        subtitle="Register a new B2B corporate account to the intelligence platform."
        size="md"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <Input
            label="Company Name"
            placeholder="e.g. Reliance Tech Labs Ltd."
            icon={FiUserCheck}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1.5">
                Industry Sector
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-primary"
              >
                <option value="Software & Technology">Software & Technology</option>
                <option value="Textile Manufacturing">Textile Manufacturing</option>
                <option value="Retail & FMCG">Retail & FMCG</option>
                <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                <option value="Fintech & Banking">Fintech & Banking</option>
              </select>
            </div>

            <Input
              label="Annual ARR (₹)"
              placeholder="e.g. ₹18.5L or ₹1.2Cr"
              icon={FiDollarSign}
              value={formData.revenue}
              onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1.5">
                Service Tier
              </label>
              <select
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-primary"
              >
                <option value="Enterprise Tier">Enterprise Tier</option>
                <option value="Growth Suite">Growth Suite</option>
                <option value="SME Professional">SME Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1.5">
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-primary"
              >
                <option value="Active">Active</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Under Review">Under Review</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Client Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
