import React, { useState, useEffect } from 'react';
import { getCompanyData } from '../services/api';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import { FiGlobe, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Company = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCompanyData();
        setCompany(res.data);
      } catch (err) {
        console.error('Error fetching company metadata', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const departmentCols = [
    {
      key: 'name',
      label: 'Department',
      sortable: true,
      render: (n) => <span className="font-medium text-light-text-primary dark:text-dark-text-primary">{n}</span>,
    },
    { key: 'headcount', label: 'Headcount', sortable: true },
    { key: 'lead', label: 'Department Head', sortable: true },
    {
      key: 'budget',
      label: 'Annual Operating Budget',
      sortable: true,
      render: (b) => <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{b}</span>,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="w-48 h-8 rounded shimmer" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 rounded-xl shimmer" />
          <div className="h-72 rounded-xl shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Organization Profile
          </h1>
          <p className="page-subtitle">
            Enterprise structure, department allocations, and corporate governance standards.
          </p>
        </div>

        <Badge variant="primary" className="self-start sm:self-auto">
          {company?.tier} Account
        </Badge>
      </div>

      {/* ─── Organization Summary KPIs ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Headcount"
          value={`${company?.employees ?? 247} Team Members`}
          change="+8 this quarter"
          trend="up"
          period="across 7 functional departments"
        />
        <StatCard
          label="Annual Run Rate (ARR)"
          value={company?.revenue?.annual ?? '₹4.82Cr'}
          change="+18.4%"
          trend="up"
          period="audited consolidated ARR"
        />
        <StatCard
          label="Fiscal Jurisdiction"
          value="INR (₹) • FY 25-26"
          change="GST Active"
          trend="neutral"
          period="MCA Registered Entity"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Metadata Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding={true} className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-light-border dark:border-dark-border">
              <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center text-lg font-bold shadow-sm">
                IQ
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {company?.name}</h2>
                <p className="page-subtitle">
                  {company?.tagline}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
              {company?.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-light-text-muted dark:text-dark-text-muted pt-3 border-t border-light-border dark:border-dark-border">
              <div className="flex items-center gap-2">
                <FiGlobe className="w-3.5 h-3.5 text-primary" />
                <span>Website: <span className="text-light-text-primary dark:text-dark-text-primary font-medium">{company?.website}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="w-3.5 h-3.5 text-primary" />
                <span>Email: <span className="text-light-text-primary dark:text-dark-text-primary font-medium">{company?.email}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="w-3.5 h-3.5 text-primary" />
                <span>Phone: <span className="text-light-text-primary dark:text-dark-text-primary font-medium">{company?.phone}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <FiMapPin className="w-3.5 h-3.5 text-primary" />
                <span>HQ: <span className="text-light-text-primary dark:text-dark-text-primary font-medium">{company?.headquarters}</span></span>
              </div>
            </div>
          </Card>

          {/* Department Distributions Table */}
          <Card padding={true} className="space-y-3">
            <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
              Department Structure & Headcount Allocation
            </h3>
            <Table columns={departmentCols} data={company?.departments || []} />
          </Card>
        </div>

        {/* Right Column: Strategic FY Goals */}
        <div className="space-y-6">
          <Card padding={true} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-light-border dark:border-dark-border">
              <h3 className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                Corporate Strategic Goals
              </h3>
              <Badge variant="neutral">FY26 Target</Badge>
            </div>

            <div className="space-y-3.5">
              {(company?.goals || []).map((goal) => (
                <div key={goal.id} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-light-text-primary dark:text-dark-text-primary leading-tight">{goal.title}</span>
                    <span className="text-[11px] text-light-text-muted dark:text-dark-text-muted">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-1 rounded-full ${
                        goal.progress === 100 ? 'bg-success' : 'bg-primary'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-light-text-muted dark:text-dark-text-muted">
                    <span>Deadline: {goal.deadline}</span>
                    <span className="capitalize">{goal.status.replace('-', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Company;
