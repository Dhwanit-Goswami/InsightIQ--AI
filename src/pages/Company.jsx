import React, { useState, useEffect } from 'react';
import { getCompanyData } from '../services/api';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { FiBriefcase, FiGlobe, FiMail, FiPhone, FiMapPin, FiUsers } from 'react-icons/fi';

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
    { key: 'name', label: 'Department Name', sortable: true, render: (n) => <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{n}</span> },
    { key: 'headcount', label: 'Headcount', sortable: true },
    { key: 'lead', label: 'Department Lead', sortable: true },
    { key: 'budget', label: 'Allocated Budget', sortable: true },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 rounded shimmer w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded shimmer" />
          <div className="h-96 rounded shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight">Organization Profile</h1>
          <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mt-0.5">View department headcounts, operational scopes, and fiscal configurations.</p>
        </div>
        <Badge variant="primary" className="text-xs py-1 px-3">
          {company?.tier} Account
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Metadata Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-5">
            <div className="flex items-center gap-4 border-b border-light-border dark:border-dark-border pb-5">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center text-xl font-bold shadow-xs">
                <FiBriefcase />
              </div>
              <div>
                <h2 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary leading-tight">{company?.name}</h2>
                <p className="text-xs text-primary font-semibold mt-0.5">{company?.tagline}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">{company?.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-light-text-muted dark:text-dark-text-muted pt-3 border-t border-light-border dark:border-dark-border font-medium">
              <div className="flex items-center gap-2">
                <FiGlobe className="w-4 h-4 text-primary" />
                <span>Website: <a href={company?.website} className="text-primary hover:underline">{company?.website}</a></span>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="w-4 h-4 text-primary" />
                <span>Contact Email: {company?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="w-4 h-4 text-primary" />
                <span>Helpdesk Phone: {company?.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMapPin className="w-4 h-4 text-primary" />
                <span>HQ Address: {company?.headquarters}</span>
              </div>
            </div>
          </Card>

          {/* Department Distributions Table */}
          <Card>
            <h3 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary mb-4 flex items-center gap-2">
              <FiUsers className="text-primary w-4 h-4" />
              Department Allocations & Leads
            </h3>
            <Table columns={departmentCols} data={company?.departments || []} />
          </Card>
        </div>

        {/* Goals Tracking Card */}
        <Card className="space-y-5 self-start">
          <h3 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">Active Strategic Goals (OKRs)</h3>
          <div className="space-y-4">
            {company?.goals.map((goal) => (
              <div key={goal.id} className="space-y-1.5 border-b border-light-border dark:border-dark-border pb-3.5 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-light-text-primary dark:text-dark-text-primary">{goal.title}</span>
                  <Badge variant={goal.status === 'completed' ? 'success' : 'neutral'}>
                    {goal.progress}%
                  </Badge>
                </div>
                <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-light-text-muted dark:text-dark-text-muted font-medium">
                  <span>Current: {goal.current}</span>
                  <span>Target: {goal.target}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Company;
