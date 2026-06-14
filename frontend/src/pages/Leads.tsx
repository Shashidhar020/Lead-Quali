import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Sparkles, Filter, MessageSquare, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LeadItem {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: string;
  created_at: string;
  lead_score: number;
  business_type: string;
  buying_intent: string;
}

interface LeadsResponse {
  leads: LeadItem[];
  totalCount: number;
  totalPages: number;
  page: number;
}

export const Leads: React.FC = () => {
  const { authFetch } = useAuth();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [intentFilter, setIntentFilter] = useState('');
  const [highPriorityOnly, setHighPriorityOnly] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const limit = 10;

  // Fetch leads list with query filters
  const { data, isLoading } = useQuery<LeadsResponse>({
    queryKey: ['leadsList', search, sortBy, sortOrder, page, statusFilter, intentFilter, highPriorityOnly],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        search,
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: limit.toString(),
        status: statusFilter,
        buyingIntent: intentFilter,
        minScore: highPriorityOnly ? '80' : '',
      });

      const res = await authFetch(`/api/leads?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch leads');
      return res.json();
    },
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1); // Reset page on sort
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset page on search
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1); // Reset page on filter
  };

  const handleIntentFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIntentFilter(e.target.value);
    setPage(1);
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const res = await authFetch('/api/leads/export.csv');
      if (!res.ok) throw new Error('Failed to export leads');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qualiai-leads.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or company details..."
            value={search}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-800 focus:border-brand-500/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <Filter className="h-4 w-4 text-slate-500" />
            <span>Filter Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="bg-slate-900/80 border border-slate-800 rounded-lg text-slate-300 text-xs py-2 px-3 outline-none focus:border-brand-500/50 cursor-pointer"
          >
            <option value="">All Leads</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="unqualified">Unqualified</option>
          </select>
          <select
            value={intentFilter}
            onChange={handleIntentFilter}
            className="bg-slate-900/80 border border-slate-800 rounded-lg text-slate-300 text-xs py-2 px-3 outline-none focus:border-brand-500/50 cursor-pointer"
          >
            <option value="">All Intent</option>
            <option value="High">High Intent</option>
            <option value="Medium">Medium Intent</option>
            <option value="Low">Low Intent</option>
          </select>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={highPriorityOnly}
              onChange={(event) => {
                setHighPriorityOnly(event.target.checked);
                setPage(1);
              }}
              className="h-3.5 w-3.5 accent-brand-600"
            />
            <span>80%+ only</span>
          </label>
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="inline-flex items-center space-x-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/30 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Name / Contact</th>
                <th className="px-6 py-4">
                  <button onClick={() => handleSort('business_type')} className="flex items-center space-x-1 hover:text-slate-200">
                    <span>Business Type</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-4">
                  <button onClick={() => handleSort('lead_score')} className="flex items-center space-x-1 hover:text-slate-200">
                    <span>AI Score</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">
                  <button onClick={() => handleSort('created_at')} className="flex items-center space-x-1 hover:text-slate-200">
                    <span>Created Date</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-800 rounded mb-1" /><div className="h-3 w-24 bg-slate-800 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-800 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-10 bg-slate-800 rounded" /></td>
                    <td className="px-6 py-4"><div className="h-5 w-16 bg-slate-800 rounded-full" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-800 rounded" /></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-slate-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : data && data.leads.length > 0 ? (
                data.leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-900/10 transition-all duration-150">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-200">
                        <Link to={`/leads/${lead.id}`} className="hover:text-brand-400">
                          {lead.name}
                        </Link>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{lead.email} • {lead.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.business_type ? (
                        <span className="px-2.5 py-1 rounded bg-slate-800/80 text-slate-300 text-xs font-semibold border border-slate-700/30">
                          {lead.business_type}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">Unidentified</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {lead.lead_score !== null && lead.lead_score !== undefined ? (
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
                          lead.lead_score >= 80
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : lead.lead_score >= 50
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700/50'
                        }`}>
                          <Sparkles className="h-3 w-3" />
                          <span>{lead.lead_score}%</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Unscored</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        lead.status === 'qualified'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : lead.status === 'unqualified'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : lead.status === 'contacted'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                      {new Date(lead.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/leads/${lead.id}`}
                          className="p-1.5 hover:bg-slate-800 hover:text-slate-100 text-slate-400 rounded-lg border border-transparent hover:border-slate-700 transition"
                          title="View Details & AI Analysis"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                    No leads found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {data && data.totalPages > 1 && (
          <div className="p-4 bg-slate-900/30 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Showing page {page} of {data.totalPages} ({data.totalCount} total leads)
            </span>
            <div className="flex items-center space-x-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600 disabled:opacity-40 disabled:hover:bg-slate-800 rounded-lg text-slate-300 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600 disabled:opacity-40 disabled:hover:bg-slate-800 rounded-lg text-slate-300 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Leads;
