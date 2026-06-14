import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Sparkles, Phone, Mail, DollarSign, Calendar, Copy, Check, RotateCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LeadDetailsData {
  id: number;
  name: string;
  phone: string;
  email: string;
  business_requirement: string;
  budget: string;
  notes: string;
  status: string;
  created_at: string;
  analysis?: {
    lead_score: number;
    business_type: string;
    summary: string;
    buying_intent: string;
    urgency_score: number;
    follow_up_message: string;
  };
}

export const LeadDetails: React.FC = () => {
  const { id } = useParams();
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [statusVal, setStatusVal] = useState('');

  // Fetch single lead details
  const { data: lead, isLoading, error } = useQuery<LeadDetailsData>({
    queryKey: ['leadDetails', id],
    queryFn: async () => {
      const res = await authFetch(`/api/leads/${id}`);
      if (!res.ok) throw new Error('Lead not found');
      const data = await res.json();
      setStatusVal(data.status);
      return data;
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await authFetch(`/api/leads/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['leadsList'] });
    },
  });

  // Re-run AI analysis mutation
  const reanalyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`/api/leads/${id}/reanalyze`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Reanalysis failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    setStatusVal(newVal);
    updateStatusMutation.mutate(newVal);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading qualification profile...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="glass p-8 rounded-2xl border border-slate-800 text-center max-w-lg mx-auto mt-12">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-200">Lead not found</h3>
        <p className="text-sm text-slate-500 mt-2">The lead you are trying to view does not exist or you do not have permissions.</p>
        <Link to="/leads" className="inline-block mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm transition">
          Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back bar */}
      <div className="flex items-center justify-between">
        <Link to="/leads" className="flex items-center space-x-2 text-slate-400 hover:text-slate-200 text-sm font-semibold transition">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Leads</span>
        </Link>
        <button
          onClick={() => reanalyzeMutation.mutate()}
          disabled={reanalyzeMutation.isPending}
          className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 disabled:opacity-40 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
        >
          <RotateCw className={`h-3.5 w-3.5 ${reanalyzeMutation.isPending ? 'animate-spin' : ''}`} />
          <span>{reanalyzeMutation.isPending ? 'Analyzing...' : 'Re-Run AI Analysis'}</span>
        </button>
      </div>

      {/* Main Grid: Info card left, AI analysis right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Lead core profile info */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass p-6 rounded-2xl border border-slate-800 space-y-6">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lead Profile</span>
              <h2 className="text-2xl font-bold text-slate-200 mt-1">{lead.name}</h2>
              <div className="mt-3 flex items-center space-x-2">
                <span className="text-xs font-medium text-slate-500">Pipeline Status:</span>
                <select
                  value={statusVal}
                  onChange={handleStatusChange}
                  className="bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold py-1 px-2.5 outline-none focus:border-brand-500/50 cursor-pointer text-slate-300"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="unqualified">Unqualified</option>
                </select>
              </div>
            </div>

            <hr className="border-slate-800/80" />

            {/* Contact details list */}
            <div className="space-y-4 text-sm">
              <div className="flex items-center space-x-3 text-slate-300">
                <Mail className="h-4 w-4 text-slate-500 flex-shrink-0" />
                <span className="truncate">{lead.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Phone className="h-4 w-4 text-slate-500 flex-shrink-0" />
                <span>{lead.phone}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <DollarSign className="h-4 w-4 text-slate-500 flex-shrink-0" />
                <span>Budget: <strong className="text-slate-100">{lead.budget || 'Not specified'}</strong></span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Calendar className="h-4 w-4 text-slate-500 flex-shrink-0" />
                <span>Received: {new Date(lead.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <hr className="border-slate-800/80" />

            {/* Requirement statement */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business Requirement</h4>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/50">
                {lead.business_requirement}
              </p>
            </div>

            {lead.notes && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Additional Notes</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {lead.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: AI Qualification insights */}
        <div className="lg:col-span-2 space-y-6">
          {lead.analysis ? (
            <>
              {/* Score summary panel */}
              <div className="glass p-6 rounded-2xl border border-slate-800 relative overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Score visualization circular style */}
                <div className="flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Qualification Score</span>
                  <div className="relative flex items-center justify-center mt-4">
                    {/* Circle display placeholder */}
                    <div className="h-28 w-28 rounded-full border-[6px] border-slate-800 flex items-center justify-center bg-slate-900/40">
                      <span className="text-3xl font-extrabold text-slate-100 tracking-tight">{lead.analysis.lead_score}%</span>
                    </div>
                    {/* Highlighted arc indicator */}
                    <div className={`absolute inset-0 rounded-full border-[6px] border-transparent pointer-events-none ${
                      lead.analysis.lead_score >= 80 ? 'border-t-emerald-500 border-r-emerald-500' : 'border-t-amber-500'
                    }`} />
                  </div>
                  <span className={`text-[10px] font-semibold tracking-wider mt-4 px-2 py-0.5 rounded uppercase ${
                    lead.analysis.lead_score >= 80
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : lead.analysis.lead_score >= 50
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {lead.analysis.lead_score >= 80 ? 'High Potential' : lead.analysis.lead_score >= 50 ? 'Medium Fit' : 'Low priority'}
                  </span>
                </div>

                {/* Qualitative stats */}
                <div className="md:col-span-2 flex flex-col justify-between py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Business Type</span>
                      <p className="text-base font-bold text-slate-200">{lead.analysis.business_type}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Buying Intent</span>
                      <p className={`text-base font-bold ${
                        lead.analysis.buying_intent === 'High'
                          ? 'text-emerald-400'
                          : lead.analysis.buying_intent === 'Medium'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}>{lead.analysis.buying_intent}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Urgency Level</span>
                      <p className="text-base font-bold text-slate-200">{lead.analysis.urgency_score}%</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assessment Status</span>
                      <p className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                        <Sparkles className="h-3 w-3" />
                        <span>AI Verified</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-800/80 pt-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Executive Summary</span>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{lead.analysis.summary}</p>
                  </div>
                </div>

              </div>

              {/* Automated Response Follow-up panel */}
              <div className="glass p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4.5 w-4.5 text-brand-400" />
                    <h3 className="text-sm font-bold text-slate-200">AI-Generated Follow-up Message</h3>
                  </div>
                  <button
                    onClick={() => handleCopyText(lead.analysis?.follow_up_message || '')}
                    className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-lg transition"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand-500 to-violet-500 rounded" />
                  <p className="pl-4 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-sans select-all">
                    {lead.analysis.follow_up_message}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="glass p-8 rounded-2xl border border-slate-800 text-center">
              <Sparkles className="h-10 w-10 text-brand-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-200">No AI analysis available</h3>
              <p className="text-sm text-slate-500 mt-2">
                This lead has not yet been processed by the intelligence engine, or the analysis failed.
              </p>
              <button
                onClick={() => reanalyzeMutation.mutate()}
                disabled={reanalyzeMutation.isPending}
                className="mt-6 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
              >
                {reanalyzeMutation.isPending ? 'Running analysis...' : 'Qualify Lead with AI'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default LeadDetails;
