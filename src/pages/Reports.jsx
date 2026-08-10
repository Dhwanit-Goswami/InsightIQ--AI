import React, { useState, useEffect } from 'react';
import { getReports } from '../services/api';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import SearchBar from '../components/ui/SearchBar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { FiDownload, FiFileText, FiPlus, FiCheckCircle } from 'react-icons/fi';
import { exportToCSV } from '../utils/exportUtils';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportClass, setReportClass] = useState('Financial');
  const [downloadSuccess, setDownloadSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getReports({ type: typeFilter, search });
        setReports(res.data);
      } catch (err) {
        console.error('Error fetching reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [typeFilter, search]);

  const handleDownloadReport = (report) => {
    // Generate realistic formatted report data CSV
    const sampleAuditData = [
      { Metric: 'Report Name', Value: report.name },
      { Metric: 'Category Class', Value: report.type },
      { Metric: 'Generated Date', Value: report.date || 'Oct 2025' },
      { Metric: 'Total Q3 Revenue', Value: '₹24,50,00,000' },
      { Metric: 'Net Profit Margin', Value: '18.4%' },
      { Metric: 'GST Compliance Rate', Value: '100% Verified' },
      { Metric: 'Active SME Client Base', Value: '1,420 Enterprises' },
      { Metric: 'Status', Value: 'Audit Ready / Cleared' }
    ];

    exportToCSV(sampleAuditData, `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    setDownloadSuccess(`Downloaded report: ${report.name}`);
    setTimeout(() => setDownloadSuccess(''), 4000);
  };

  const handleGenerateCustomReport = (e) => {
    e.preventDefault();
    if (!reportTitle) return;

    const newReport = {
      id: Date.now(),
      name: reportTitle,
      type: reportClass,
      pages: '12 Pages',
      size: '2.4 MB',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Ready'
    };

    setReports([newReport, ...reports]);
    setIsModalOpen(false);
    handleDownloadReport(newReport);
    setReportTitle('');
  };

  const reportCols = [
    { key: 'name', label: 'Report Name', sortable: true, render: (name) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <FiFileText className="w-4 h-4" />
        </div>
        <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{name}</span>
      </div>
    )},
    { key: 'type', label: 'Class', sortable: true },
    { key: 'pages', label: 'Pages', sortable: true },
    { key: 'size', label: 'File Size' },
    { key: 'date', label: 'Generated Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (status) => (
      <Badge variant={status === 'Ready' ? 'success' : 'warning'}>{status}</Badge>
    )},
    { key: 'action', label: 'Action', render: (_, row) => (
      <Button
        variant="secondary"
        size="xs"
        disabled={row.status !== 'Ready'}
        className="flex items-center gap-1"
        onClick={(e) => { e.stopPropagation(); handleDownloadReport(row); }}
      >
        <FiDownload className="w-3 h-3" />
        Download
      </Button>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight">Corporate Document Registry</h1>
          <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mt-0.5">Access and download financial audits, GST filings, and performance reports (in ₹).</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5">
          <FiPlus className="w-4 h-4" /> Request Custom Report
        </Button>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-success/15 border border-success/30 text-success text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-down">
          <FiCheckCircle className="w-4 h-4" />
          {downloadSuccess}
        </div>
      )}

      {/* Filters Card */}
      <Card className="flex flex-wrap items-center gap-4 py-4">
        <div className="flex gap-1 bg-light-surface dark:bg-dark-surface p-1 rounded-xl border border-light-border dark:border-dark-border">
          {['All', 'Financial', 'Performance', 'Growth'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === type
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Filter report titles..."
          className="flex-1 max-w-xs ml-auto"
        />
      </Card>

      {/* Table Card */}
      <Card className="overflow-hidden" padding={false}>
        <Table
          columns={reportCols}
          data={reports}
          loading={loading}
          emptyMessage="No reports found matching your selected filters."
        />
      </Card>

      {/* Request Custom Report Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Custom Intelligence Report"
        subtitle="Specify audit parameters to synthesize and compile a downloadable document."
        size="md"
      >
        <form onSubmit={handleGenerateCustomReport} className="space-y-4">
          <Input
            label="Report Title / Topic"
            placeholder="e.g. Q4 Regional Tax Compliance Audit"
            icon={FiFileText}
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1.5">
              Report Class
            </label>
            <select
              value={reportClass}
              onChange={(e) => setReportClass(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:border-primary"
            >
              <option value="Financial">Financial</option>
              <option value="Performance">Performance</option>
              <option value="Growth">Growth</option>
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-4">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Synthesize & Download Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Reports;
