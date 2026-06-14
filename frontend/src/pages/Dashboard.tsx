import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Users, Calendar, Award, Sparkles, TrendingUp, ArrowRight, UserCheck, Target, Flame, PieChart } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { useAuth } from '../context/AuthContext';

interface Stats {
  totalLeads: number;
  todaysLeads: number;
  averageScore: number;
  highQualityCount: number;
}

interface RecentLead {
  id: number;
  name: string;
  email: string;
  business_requirement: string;
  created_at: string;
  lead_score: number;
  business_type: string;
  buying_intent: string;
}

interface InsightCount {
  status?: string;
  business_type?: string;
  buying_intent?: string;
  count: number | string;
  average_score?: number | string;
}

interface HotLead {
  id: number;
  name: string;
  email: string;
  phone: string;
  business_requirement: string;
  status: string;
  created_at: string;
  lead_score: number;
  business_type: string;
  buying_intent: string;
  urgency_score: number;
}

interface Insights {
  statusBreakdown: InsightCount[];
  businessBreakdown: InsightCount[];
  intentBreakdown: InsightCount[];
  hotLeads: HotLead[];
  conversionRate: number;
}

export const Dashboard: React.FC = () => {
  const { authFetch } = useAuth();

  // Fetch metrics stats
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await authFetch('/api/leads/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
  });

  // Fetch recent leads
  const { data: recentLeads, isLoading: leadsLoading } = useQuery<RecentLead[]>({
    queryKey: ['recentLeads'],
    queryFn: async () => {
      const res = await authFetch('/api/leads/recent');
      if (!res.ok) throw new Error('Failed to fetch recent leads');
      return res.json();
    },
  });

  const { data: insights, isLoading: insightsLoading } = useQuery<Insights>({
    queryKey: ['leadInsights'],
    queryFn: async () => {
      const res = await authFetch('/api/leads/insights');
      if (!res.ok) throw new Error('Failed to fetch insights');
      return res.json();
    },
  });

  const topBusinessCount = insights?.businessBreakdown.reduce((sum, item) => sum + Number(item.count || 0), 0) || 0;

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="glass p-8 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl font-bold text-slate-100">AI Lead Intelligence Portal</h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Real-time automatic qualification engine. Leads submitted through your public capture endpoint are processed using LLM and scored based on intent, urgency, and requirement quality.
          </p>
        </div>
        <div className="relative z-10 flex items-center space-x-2 bg-brand-500/10 text-brand-400 border border-brand-500/20 px-4 py-2 rounded-xl text-xs font-semibold">
          <TrendingUp className="h-4 w-4" />
          <span>System active & listening</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Leads"
          value={stats?.totalLeads ?? 0}
          description="Accumulated capture queue"
          icon={Users}
          isLoading={statsLoading}
        />
        <MetricCard
          title="Today's Leads"
          value={stats?.todaysLeads ?? 0}
          description="Inbound submissions today"
          icon={Calendar}
          isLoading={statsLoading}
          trend={stats?.todaysLeads && stats.todaysLeads > 0 ? { value: `+${stats.todaysLeads}`, isPositive: true } : undefined}
        />
        <MetricCard
          title="Avg. Qualification Score"
          value={`${stats?.averageScore ? Math.round(stats.averageScore) : 0}%`}
          description="AI assessment mean"
          icon={Award}
          isLoading={statsLoading}
        />
        <MetricCard
          title="High Quality Leads"
          value={stats?.highQualityCount ?? 0}
          description="Scored 80% or greater"
          icon={Sparkles}
          isLoading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Pipeline Conversion</h3>
              <p className="text-xs text-slate-500 mt-1">Qualified leads as a share of total pipeline</p>
            </div>
            <Target className="h-5 w-5 text-brand-400" />
          </div>
          <div className="mt-6 flex items-end justify-between">
            <span className="text-4xl font-extrabold text-slate-100">{insights?.conversionRate ?? 0}%</span>
            <div className="h-2 flex-1 ml-6 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.min(insights?.conversionRate ?? 0, 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {(insights?.statusBreakdown || []).slice(0, 4).map((item) => (
              <div key={item.status} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{item.status || 'unknown'}</p>
                <p className="mt-1 text-lg font-bold text-slate-200">{Number(item.count)}</p>
              </div>
            ))}
            {insightsLoading && <div className="h-16 rounded-lg bg-slate-800 animate-pulse col-span-2" />}
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Business Segment Mix</h3>
              <p className="text-xs text-slate-500 mt-1">Where demand is coming from</p>
            </div>
            <PieChart className="h-5 w-5 text-brand-400" />
          </div>
          <div className="mt-6 space-y-4">
            {(insights?.businessBreakdown || []).slice(0, 5).map((item) => {
              const count = Number(item.count || 0);
              const percent = topBusinessCount > 0 ? Math.round((count / topBusinessCount) * 100) : 0;
              return (
                <div key={item.business_type || 'unknown'} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">{item.business_type || 'Unknown'}</span>
                    <span className="text-slate-500">{count} leads - avg {Math.round(Number(item.average_score || 0))}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
            {!insightsLoading && (!insights?.businessBreakdown || insights.businessBreakdown.length === 0) && (
              <p className="text-xs text-slate-500">Submit leads to see business segmentation.</p>
            )}
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Hot Leads</h3>
              <p className="text-xs text-slate-500 mt-1">Highest priority follow-ups</p>
            </div>
            <Flame className="h-5 w-5 text-amber-400" />
          </div>
          <div className="mt-5 space-y-3">
            {(insights?.hotLeads || []).slice(0, 4).map((lead) => (
              <Link
                key={lead.id}
                to={`/leads/${lead.id}`}
                className="block rounded-xl border border-slate-800 bg-slate-950/40 p-3 hover:border-brand-500/40 hover:bg-slate-900 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-200">{lead.name}</p>
                    <p className="truncate text-[11px] text-slate-500">{lead.business_type} - {lead.buying_intent} intent</p>
                  </div>
                  <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-400">
                    {lead.lead_score}%
                  </span>
                </div>
              </Link>
            ))}
            {!insightsLoading && (!insights?.hotLeads || insights.hotLeads.length === 0) && (
              <p className="text-xs text-slate-500">No hot leads yet. New high-intent submissions will appear here.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main dashboard body splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Inbound Leads */}
        <div className="glass rounded-2xl border border-slate-800 lg:col-span-2 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Recent AI-Qualified Leads</h3>
                <p className="text-xs text-slate-500">Live feed of scored submissions</p>
              </div>
              <Link
                to="/leads"
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-800">
              {leadsLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="p-6 animate-pulse flex justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-slate-800 rounded" />
                      <div className="h-3 w-48 bg-slate-800 rounded" />
                    </div>
                    <div className="h-8 w-12 bg-slate-800 rounded-lg" />
                  </div>
                ))
              ) : recentLeads && recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="p-6 flex items-center justify-between hover:bg-slate-900/20 transition-all duration-200">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex items-center space-x-2">
                        <Link to={`/leads/${lead.id}`} className="font-semibold text-slate-200 hover:text-brand-400 truncate text-sm">
                          {lead.name}
                        </Link>
                        {lead.business_type && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium border border-slate-700/50">
                            {lead.business_type}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-1">{lead.business_requirement}</p>
                      <p className="text-[10px] text-slate-500 mt-2">
                        {new Date(lead.created_at).toLocaleDateString()} at{' '}
                        {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      {lead.lead_score !== undefined ? (
                        <div className="text-right">
                          <span className={`inline-flex items-center justify-center h-9 w-12 rounded-lg text-xs font-extrabold border ${
                            lead.lead_score >= 80
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : lead.lead_score >= 50
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700/50'
                          }`}>
                            {lead.lead_score}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">Pending AI</span>
                      )}
                      <Link
                        to={`/leads/${lead.id}`}
                        className="p-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-400 hover:text-slate-200 rounded-lg transition-all"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No leads received yet. Submit a test lead using the public lead form!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business Distribution & Actions */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-800">
            <h3 className="text-base font-bold text-slate-100">Lead qualification criteria</h3>
            <p className="text-xs text-slate-500 mt-1">Our AI evaluates leads based on 4 primary factors</p>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 bg-brand-500/10 text-brand-400 rounded-md">
                  <UserCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-300">Requirement Fit</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Aligns with service niches (Gym, Clinic, Salon, Insurance, Real Estate, Coaching).</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 bg-brand-500/10 text-brand-400 rounded-md">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-300">Buying Intent</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Evaluates wording, phrasing, specific timeline indicators and budgets.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 bg-brand-500/10 text-brand-400 rounded-md">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-300">Urgency Score</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Calculates whether follow-up actions require immediate automated intervention.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 bg-brand-500/10 text-brand-400 rounded-md">
                  <Award className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-300">Budget Adequacy</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Matches requirements against business service value and packages.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/60 to-slate-900/20 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 -mb-6 -mr-6 h-24 w-24 rounded-full bg-brand-500/10 blur-xl" />
            <h3 className="text-sm font-bold text-slate-100">Live Demo Testing</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Want to see lead processing in action? Click the "Launch Lead Form" button in the header, submit a mock query, and see this page update immediately without refreshing!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
