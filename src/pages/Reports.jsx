import React, { useState, useEffect, useCallback } from 'react';
import { getReports } from '../services/api';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import SearchBar from '../components/ui/SearchBar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import {
  FiDownload, FiEye, FiShare2, FiFileText,
  FiPlus, FiCheck, FiAlertCircle, FiRefreshCw
} from 'react-icons/fi';
import { exportToCSV } from '../utils/exportUtils';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & Notifications
  const [viewingReport, setViewingReport] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Financial');
  const [newPeriod, setNewPeriod] = useState('Q3 FY26');
  const [toastMessage, setToastMessage] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getReports({ type: typeFilter, search });
      setReports(res.data || []);
    } catch (err) {
      console.error('Error fetching reports', err);
      setError('Unable to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleDownload = (report) => {
    const reportTitle = report.name || report.title || 'Executive_Audit_Report';
    const sampleAuditData = [
      { Parameter: 'Report Document', Value: reportTitle },
      { Parameter: 'Document Type', Value: report.type || 'Audit' },
      { Parameter: 'Fiscal Period', Value: report.period || 'Q3 FY26' },
      { Parameter: 'Last Updated', Value: report.lastUpdated || 'Recent' },
      { Parameter: 'Gross Volume Verified', Value: '₹1,42,00,000' },
      { Parameter: 'Operating Margin', Value: '26.2%' },
      { Parameter: 'GST Filing Compliance', Value: '100% Reconciled (GSTR-1 & 3B)' },
      { Parameter: 'Entity', Value: 'Enterprise Account' },
    ];
    exportToCSV(sampleAuditData, `${reportTitle.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    showToast(`Downloaded: ${reportTitle}`);
  };

  const handleShare = (report) => {
    navigator.clipboard?.writeText?.(window.location.href);
    showToast(`Share link copied for: ${report.name}`);
  };

  const handleCreateReport = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = {
      id: Date.now(),
      name: newTitle,
      type: newType,
      period: newPeriod,
      status: 'Ready',
      lastUpdated: 'Just now',
      pages: '12 Pages',
      size: '1.6 MB',
      summary: `Custom synthesized ${newType.toLowerCase()} audit compiled for ${newPeriod}.`,
    };

    setReports([created, ...reports]);
    setIsCreateModalOpen(false);
    setNewTitle('');
    showToast(`Compiled report: ${created.name}`);
  };

  // Section 21: Table columns (Report name, Type, Period, Status, Last updated, Actions: View, Download, Share)
  const reportCols = [
    {
      key: 'name',
      label: 'Report Name',
      sortable: true,
      render: (name) => (
        <div className="flex items-center gap-2 flex-shrink-0">
          <FiFileText className="w-3.5 h-3.5 text-light-text-muted dark:text-dark-text-muted flex-shrink-0" />
          <span className="font-medium text-light-text-primary dark:text-dark-text-primary">{name}</span>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (type) => (
        <Badge variant={type === 'Financial' ? 'primary' : type === 'Performance' ? 'neutral' : 'warning'}>
          {type}
        </Badge>
      ),
    },
    {
      key: 'period',
      label: 'Period',
      sortable: true,
      render: (p) => <span className="font-mono text-xs">{p}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (status) => (
        <Badge variant={status === 'Ready' ? 'success' : 'warning'} dot>
          {status}
        </Badge>
      ),
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      sortable: true,
      render: (date) => <span className="text-light-text-muted dark:text-dark-text-muted text-xs">{date}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* View */}
          <button
            onClick={() => setViewingReport(row)}
            className="p-1.5 rounded-md hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors cursor-pointer"
            title="View report details"
            aria-label="View report details"
          >
            <FiEye className="w-3.5 h-3.5" />
          </button>

          {/* Download */}
          <button
            onClick={() => handleDownload(row)}
            disabled={row.status !== 'Ready'}
            className="p-1.5 rounded-md hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Download CSV"
            aria-label="Download CSV"
          >
            <FiDownload className="w-3.5 h-3.5" />
          </button>

          {/* Share */}
          <button
            onClick={() => handleShare(row)}
            className="p-1.5 rounded-md hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors cursor-pointer"
            title="Share report"
            aria-label="Share report"
          >
            <FiShare2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Ã¢"€Ã¢"€Ã¢"€ Header Ã¢"€Ã¢"€Ã¢"€ */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Financial & Operational Reports
          </h1>
          <p className="page-subtitle">
            Audit-ready statements, P&L reconciliations, and executive board summaries.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <FiPlus className="w-3.5 h-3.5" />
          <span>Generate Report</span>
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-danger/10 border border-danger/30 text-danger text-xs font-semibold rounded-xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-1 hover:underline font-bold text-xs cursor-pointer"
          >
            <FiRefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card dark:shadow-card-dark text-light-text-primary dark:text-dark-text-primary text-xs font-medium rounded-lg flex items-center gap-2 animate-fade-in">
          <FiCheck className="w-4 h-4 text-success" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Ã¢"€Ã¢"€Ã¢"€ Filter & Search Bar (Section 21: Table/List, avoid decorative cards) Ã¢"€Ã¢"€Ã¢"€ */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Type Filter Tabs */}
        <div className="tab-bar">
          {['All', 'Financial', 'Performance', 'Growth'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={typeFilter === type ? 'tab-btn-active' : 'tab-btn'}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search report titles..."
          />
        </div>
      </div>

      {/* Ã¢"€Ã¢"€Ã¢"€ Professional Table (Section 21) Ã¢"€Ã¢"€Ã¢"€ */}
      <Card padding={false} className="overflow-hidden">
        <Table
          columns={reportCols}
          data={reports}
          loading={loading}
          emptyMessage="No reports match your selected criteria."
          onRowClick={(row) => setViewingReport(row)}
        />
      </Card>

      {/* Ã¢"€Ã¢"€Ã¢"€ View Report Modal Ã¢"€Ã¢"€Ã¢"€ */}
      {viewingReport && (
        <Modal
          isOpen={!!viewingReport}
          onClose={() => setViewingReport(null)}
          title={viewingReport.name}
          subtitle={`Audit Document • ${viewingReport.type} • Period: ${viewingReport.period}`}
          size="lg"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setViewingReport(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleDownload(viewingReport);
                  setViewingReport(null);
                }}
                disabled={viewingReport.status !== 'Ready'}
                className="flex items-center gap-1.5"
              >
                <FiDownload className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-light-text-muted dark:text-dark-text-muted block mb-1">
                Executive Summary
              </span>
              <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                {viewingReport.summary}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-y border-light-border dark:border-dark-border text-xs">
              <div>
                <span className="text-light-text-muted dark:text-dark-text-muted block text-[10px]">Document Status</span>
                <span className="font-semibold text-success">{viewingReport.status}</span>
              </div>
              <div>
                <span className="text-light-text-muted dark:text-dark-text-muted block text-[10px]">Pages</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{viewingReport.pages}</span>
              </div>
              <div>
                <span className="text-light-text-muted dark:text-dark-text-muted block text-[10px]">File Size</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{viewingReport.size}</span>
              </div>
              <div>
                <span className="text-light-text-muted dark:text-dark-text-muted block text-[10px]">Last Reconciled</span>
                <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{viewingReport.lastUpdated}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-light-surface/60 dark:bg-dark-surface/60 border border-light-border dark:border-dark-border text-xs text-light-text-muted dark:text-dark-text-muted space-y-1">
              <p>
                <strong>Audit Compliance:</strong> Formatted to Indian GST and Ministry of Corporate Affairs (MCA) filing standards.
              </p>
              <p>
                <strong>Authorized Signatory:</strong> Dhwanit Goswami, Vardaan Electronics Pvt. Ltd.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Ã¢"€Ã¢"€Ã¢"€ Generate Custom Report Modal Ã¢"€Ã¢"€Ã¢"€ */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate Intelligence Report"
        subtitle="Compile verified ledger entries into an executive audit statement."
        size="md"
      >
        <form onSubmit={handleCreateReport} className="space-y-4">
          <Input
            label="Report Title / Name"
            placeholder="e.g. Q4 Regional Tax Compliance Audit"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Report Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="input-field py-1.5 text-xs font-medium cursor-pointer"
              >
                <option value="Financial">Financial</option>
                <option value="Performance">Performance</option>
                <option value="Growth">Growth</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-1">
                Period Scope
              </label>
              <select
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value)}
                className="input-field py-1.5 text-xs font-medium cursor-pointer"
              >
                <option value="Q3 FY26">Q3 FY26</option>
                <option value="Sep 2026">Sep 2026</option>
                <option value="FY 2025-26">FY 2025-26</option>
                <option value="Next 6 Months">Next 6 Months</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Compile & Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Reports;
