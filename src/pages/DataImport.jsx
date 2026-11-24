import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUploadCloud, FiFileText, FiDownload, FiCheckCircle,
  FiAlertTriangle, FiAlertCircle, FiRefreshCw, FiArrowRight,
  FiCheck, FiUsers, FiShoppingBag,
  FiPackage, FiDollarSign
} from 'react-icons/fi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import Table from '../components/ui/Table';
import {
  downloadImportTemplate,
  validateImportFile,
  commitImportData,
  downloadErrorCSV,
} from '../services/api';

const CATEGORIES = [
  {
    key: 'customers',
    title: 'Customers',
    icon: FiUsers,
    description: 'Enterprise & retail client directory, contact information, and account tiering.',
    navPath: '/customers',
    navLabel: 'Customer Directory',
  },
  {
    key: 'products',
    title: 'Products & Inventory',
    icon: FiPackage,
    description: 'Master SKU catalog, cost/selling pricing, and initial warehouse stock levels.',
    navPath: '/inventory',
    navLabel: 'Asset Inventory',
  },
  {
    key: 'sales',
    title: 'Sales Transactions',
    icon: FiShoppingBag,
    description: 'Commercial invoices, line items, order amounts, and customer settlements.',
    navPath: '/sales',
    navLabel: 'Sales Journal',
  },
  {
    key: 'expenses',
    title: 'Operating Expenses',
    icon: FiDollarSign,
    description: 'Corporate operating expenses, logistics outlays, rent, utilities, and vendor costs.',
    navPath: '/expenses',
    navLabel: 'Expense Records',
  },
];

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const DataImport = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState('customers');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Validation state
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Commit state
  const [commitMode, setCommitMode] = useState('all_or_nothing'); // 'all_or_nothing' | 'skip_errors'
  const [committing, setCommitting] = useState(false);
  const [commitSummary, setCommitSummary] = useState(null);
  const [commitError, setCommitError] = useState('');

  // Reset state when category switches
  const handleSelectCategory = (catKey) => {
    setActiveCategory(catKey);
    setSelectedFile(null);
    setValidationResult(null);
    setValidationError('');
    setCommitSummary(null);
    setCommitError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentCategoryMeta = CATEGORIES.find((c) => c.key === activeCategory) || CATEGORIES[0];

  const handleDownloadTemplate = async (categoryKey = activeCategory) => {
    try {
      await downloadImportTemplate(categoryKey);
    } catch (err) {
      console.error('Failed to download template:', err);
      alert('Unable to download template. Please check your network connection.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setValidationError('Only standard .csv files are supported. Please convert or select a CSV file.');
      return;
    }
    setSelectedFile(file);
    setValidationResult(null);
    setValidationError('');
    setCommitSummary(null);
    setCommitError('');
  };

  const handleValidate = async () => {
    if (!selectedFile) return;
    setValidating(true);
    setValidationError('');
    setCommitError('');
    setCommitSummary(null);

    try {
      const res = await validateImportFile(selectedFile, activeCategory);
      setValidationResult(res.data);
    } catch (err) {
      console.error('Validation failed:', err);
      setValidationError(err.response?.data?.detail || err.message || 'CSV validation failed.');
    } finally {
      setValidating(false);
    }
  };

  const handleCommit = async () => {
    if (!validationResult || !validationResult.valid_records?.length) return;
    setCommitting(true);
    setCommitError('');

    try {
      const res = await commitImportData(
        activeCategory,
        validationResult.valid_records,
        commitMode
      );
      setCommitSummary(res.data);
    } catch (err) {
      console.error('Commit failed:', err);
      setCommitError(err.response?.data?.detail || err.message || 'Failed to commit import records.');
    } finally {
      setCommitting(false);
    }
  };

  const handleDownloadErrors = async () => {
    if (!validationResult?.errors?.length) return;
    try {
      await downloadErrorCSV(validationResult.headers, validationResult.errors);
    } catch (err) {
      console.error('Failed to download error CSV:', err);
      alert('Could not download error CSV.');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setValidationError('');
    setCommitSummary(null);
    setCommitError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Prepare table columns for preview
  const previewColumns = (validationResult?.headers || []).map((h) => ({
    key: h,
    label: h.toUpperCase().replace(/_/g, ' '),
    render: (val) => (
      <span className="font-mono text-xs text-light-text-secondary dark:text-dark-text-secondary truncate block max-w-[160px]">
        {val !== null && val !== undefined && val !== '' ? String(val) : '—'}
      </span>
    ),
  }));

  const errorColumns = [
    {
      key: 'row',
      label: 'Row',
      render: (r) => <span className="font-mono font-bold text-danger text-xs">#{r}</span>,
    },
    {
      key: 'field',
      label: 'Column / Field',
      render: (f) => <span className="font-semibold text-light-text-primary dark:text-dark-text-primary text-xs">{f}</span>,
    },
    {
      key: 'message',
      label: 'Validation Issue',
      render: (m) => <span className="text-danger text-xs">{m}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">CSV Data Ingestion & Processing</h1>
            <Badge variant="primary">Phase 4 Engine</Badge>
          </div>
          <p className="page-subtitle">
            Upload bulk commercial records with pre-flight schema validation, foreign key resolution, and atomic database commits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDownloadTemplate(activeCategory)}
            className="flex items-center gap-1.5"
          >
            <FiDownload className="w-3.5 h-3.5" />
            <span>Download {currentCategoryMeta.title} Template</span>
          </Button>
        </div>
      </div>

      {/* ─── Category Selector Tabs ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => handleSelectCategory(cat.key)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-primary/10 border-primary shadow-sm text-primary dark:bg-primary/20'
                  : 'bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary text-white' : 'bg-light-bg dark:bg-dark-bg text-light-text-muted'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && <Badge variant="success">Selected</Badge>}
              </div>
              <div>
                <h3 className={`text-sm font-semibold ${isSelected ? 'text-primary dark:text-primary-light font-bold' : 'text-light-text-primary dark:text-dark-text-primary'}`}>
                  {cat.title}
                </h3>
                <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── Success Commit Banner ─── */}
      {commitSummary && (
        <Card className="p-6 border-success/40 bg-success/5 dark:bg-success/10 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-success/20 text-success flex items-center justify-center flex-shrink-0 mt-0.5">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-light-text-primary dark:text-dark-text-primary">
                  Import Batch Successfully Committed
                </h3>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                  {commitSummary.message} All records are now stored in PostgreSQL, scoped to your company, and reflected across live analytics.
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleReset}>
              Import Another File
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-light-card dark:bg-dark-card p-3 rounded-lg border border-light-border dark:border-dark-border">
              <span className="text-[10px] text-light-text-muted uppercase font-semibold">Total Processed</span>
              <p className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">{commitSummary.total_processed}</p>
            </div>
            <div className="bg-light-card dark:bg-dark-card p-3 rounded-lg border border-light-border dark:border-dark-border">
              <span className="text-[10px] text-success uppercase font-semibold">Imported to DB</span>
              <p className="text-lg font-bold text-success">+{commitSummary.imported}</p>
            </div>
            <div className="bg-light-card dark:bg-dark-card p-3 rounded-lg border border-light-border dark:border-dark-border">
              <span className="text-[10px] text-danger uppercase font-semibold">Rejected / Skipped</span>
              <p className="text-lg font-bold text-danger">{commitSummary.rejected}</p>
            </div>
            <div className="bg-light-card dark:bg-dark-card p-3 rounded-lg border border-light-border dark:border-dark-border">
              <span className="text-[10px] text-primary uppercase font-semibold">Target Entity</span>
              <p className="text-sm font-bold text-primary capitalize mt-1">{commitSummary.category}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(currentCategoryMeta.navPath)}
              className="flex items-center gap-1.5"
            >
              <span>View {currentCategoryMeta.navLabel}</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5"
            >
              <span>Check Dashboard KPIs</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-1.5"
            >
              <span>View Analytics</span>
            </Button>
          </div>
        </Card>
      )}

      {/* ─── Upload Dropzone ─── */}
      {!commitSummary && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
            <div>
              <h2 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                1. Upload CSV Document for {currentCategoryMeta.title}
              </h2>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">
                Drag and drop your prepared CSV file or click browse. Standard UTF-8 and UTF-8 BOM are supported.
              </p>
            </div>
            <button
              onClick={() => handleDownloadTemplate(activeCategory)}
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer flex-shrink-0"
            >
              <FiDownload className="w-3 h-3" />
              <span>Get sample CSV</span>
            </button>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-primary bg-primary/5 scale-[0.99]'
                : selectedFile
                ? 'border-success/60 bg-success/5 dark:bg-success/10'
                : 'border-light-border dark:border-dark-border hover:border-primary/50 hover:bg-light-hover dark:hover:bg-dark-hover'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${selectedFile ? 'bg-success/20 text-success' : 'bg-primary/10 text-primary'}`}>
              <FiUploadCloud className="w-7 h-7" />
            </div>

            <div>
              <p className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">
                {selectedFile ? selectedFile.name : 'Choose a CSV file or drag & drop here'}
              </p>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">
                {selectedFile ? `${formatBytes(selectedFile.size)} • Ready for pre-flight validation` : 'Supports standard UTF-8 CSV with column headers (Up to 10 MB, max 5,000 rows)'}
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="success">File Selected</Badge>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="text-xs text-danger hover:underline font-medium cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {validationError && (
            <div className="p-3 bg-danger/10 border border-danger/30 text-danger text-xs font-semibold rounded-xl flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {selectedFile && !validationResult && (
            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                onClick={handleValidate}
                disabled={validating}
                className="flex items-center gap-2"
              >
                {validating && <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{validating ? 'Inspecting & Validating…' : 'Validate & Preview CSV'}</span>
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* ─── Validation Results & Preview ─── */}
      {validationResult && !commitSummary && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-light-border dark:border-dark-border">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                  2. Pre-Flight Validation Assessment
                </h2>
                {validationResult.is_valid ? (
                  <Badge variant="success">100% Clean File</Badge>
                ) : (
                  <Badge variant="warning">{validationResult.invalid_count} Issues Detected</Badge>
                )}
              </div>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">
                Target Entity: <span className="font-semibold text-light-text-primary dark:text-dark-text-primary capitalize">{validationResult.category}</span> • File: {validationResult.filename}
              </p>
            </div>

            {validationResult.errors_count > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadErrors}
                className="flex items-center gap-1.5 text-danger border-danger/30 hover:bg-danger/10"
              >
                <FiDownload className="w-3.5 h-3.5" />
                <span>Download Error CSV ({validationResult.errors_count})</span>
              </Button>
            )}
          </div>

          {/* Validation Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Scanned Rows"
              value={`${validationResult.total_rows} rows`}
              change="in uploaded file"
              trend="neutral"
              period="verified format"
            />
            <StatCard
              label="Valid Records"
              value={`${validationResult.valid_count} rows`}
              change={`${Math.round((validationResult.valid_count / (validationResult.total_rows || 1)) * 100)}% passing`}
              trend="up"
              period="ready to import"
            />
            <StatCard
              label="Rejected Rows"
              value={`${validationResult.invalid_count} rows`}
              change={validationResult.invalid_count > 0 ? 'Requires attention' : 'Zero failures'}
              trend={validationResult.invalid_count > 0 ? 'down' : 'up'}
              period="validation issues"
            />
            <StatCard
              label="Column Headers"
              value={`${validationResult.headers.length} fields`}
              change="recognized schema"
              trend="neutral"
              period="mapped to database"
            />
          </div>

          {/* Error Details Table (if any) */}
          {validationResult.errors_count > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiAlertTriangle className="w-4 h-4 text-warning" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">
                    Validation Issues ({validationResult.errors_count})
                  </h3>
                </div>
                <span className="text-[11px] text-light-text-muted dark:text-dark-text-muted">
                  Showing top issues. Invalid rows are excluded from database insertion.
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto border border-danger/30 rounded-xl">
                <Table
                  columns={errorColumns}
                  data={validationResult.errors}
                  keyField="message"
                />
              </div>
            </div>
          )}

          {/* Preview Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiFileText className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">
                  Data Preview (First 10 Rows)
                </h3>
              </div>
              <span className="text-[11px] text-light-text-muted dark:text-dark-text-muted">
                Displaying sample records before writing to PostgreSQL
              </span>
            </div>

            <div className="overflow-x-auto border border-light-border dark:border-dark-border rounded-xl">
              <Table
                columns={previewColumns}
                data={validationResult.preview_rows}
                keyField="name"
              />
            </div>
          </div>

          {/* Commit Options & Actions */}
          <div className="pt-4 border-t border-light-border dark:border-dark-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary block mb-1">
                  Commit Strategy
                </label>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="commitMode"
                      value="all_or_nothing"
                      checked={commitMode === 'all_or_nothing'}
                      onChange={() => setCommitMode('all_or_nothing')}
                      className="text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">
                      All-or-Nothing (Strict — abort entire batch if any row fails)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="commitMode"
                      value="skip_errors"
                      checked={commitMode === 'skip_errors'}
                      onChange={() => setCommitMode('skip_errors')}
                      className="text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">
                      Import Valid Rows (Skip {validationResult.invalid_count} invalid)
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  disabled={committing}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCommit}
                  disabled={
                    committing ||
                    validationResult.valid_count === 0 ||
                    (commitMode === 'all_or_nothing' && validationResult.invalid_count > 0)
                  }
                  className="flex items-center gap-2"
                >
                  {committing ? (
                    <>
                      <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Writing to Database…</span>
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-3.5 h-3.5" />
                      <span>
                        Commit {commitMode === 'all_or_nothing' ? validationResult.total_rows : validationResult.valid_count} Records
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {commitMode === 'all_or_nothing' && validationResult.invalid_count > 0 && (
              <p className="text-[11px] text-danger font-medium">
                * Commit button disabled in Strict mode due to {validationResult.invalid_count} rejected row(s). Switch to "Import Valid Rows" or correct the CSV file.
              </p>
            )}

            {commitError && (
              <div className="p-3 bg-danger/10 border border-danger/30 text-danger text-xs font-semibold rounded-xl flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{commitError}</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DataImport;
