import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, User, Phone, Mail, DollarSign, FileText, PlusCircle, Building2, Scissors, Dumbbell, Stethoscope, ShieldCheck, GraduationCap } from 'lucide-react';

export const LeadForm: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [requirement, setRequirement] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  
  // Custom business category selector instead of a boring select dropdown
  const [businessType, setBusinessType] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [submittedLeadId, setSubmittedLeadId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'Real Estate', label: 'Real Estate', icon: Building2 },
    { id: 'Salon', label: 'Salons', icon: Scissors },
    { id: 'Gym', label: 'Gyms & Fitness', icon: Dumbbell },
    { id: 'Clinic', label: 'Medical Clinics', icon: Stethoscope },
    { id: 'Insurance Agency', label: 'Insurance', icon: ShieldCheck },
    { id: 'Coaching Center', label: 'Coaching/Education', icon: GraduationCap },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!businessType) {
      setError('Please select a business type to continue.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          business_requirement: `[${businessType}] ${requirement}`,
          budget,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit form');
      }

      setAnalysisResult(data.analysis);
      setSubmittedLeadId(data.leadId);
      setSuccess(true);
      
      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setRequirement('');
      setBudget('');
      setNotes('');
      setBusinessType('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please check inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-brand-500/5 blur-[120px]" />
      <div className="absolute -right-1/4 -bottom-1/4 h-[600px] w-[600px] rounded-full bg-violet-500/5 blur-[120px]" />

      <div className="max-w-2xl w-full space-y-8 relative z-10">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
            Consultation Request Portal
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Submit your information below to initiate automated AI consultation mapping.
          </p>
        </div>

        {/* Form panel container */}
        <div className="glass p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          
          {success ? (
            /* Success Screen showing live qualification response details */
            <div className="text-center py-8 space-y-6 animate-float">
              <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-100">Request Received!</h3>
                <p className="text-sm text-slate-400">
                  Lead #{submittedLeadId} was saved, AI-qualified, and sent to the notification workflow.
                </p>
              </div>

              {analysisResult && (
                <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl text-left space-y-4 max-w-md mx-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Fit Category</span>
                    <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700/50">
                      {analysisResult.business_type}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">AI Priority Rating</span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-extrabold border uppercase ${
                      analysisResult.lead_score >= 80 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {analysisResult.lead_score >= 80 ? 'High' : 'Standard'}
                    </span>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">AI Response Follow-up Preview</span>
                    <p className="text-xs text-slate-300 mt-1 italic">
                      "{analysisResult.follow_up_message.split('\\n')[0]}"
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setSuccess(false);
                  setSubmittedLeadId(null);
                  setAnalysisResult(null);
                }}
                className="mt-6 mr-3 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 hover:border-slate-600 transition"
              >
                Submit another request
              </button>
              <Link
                to="/leads"
                className="inline-flex px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs border border-brand-500/30 transition"
              >
                View in dashboard
              </Link>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold leading-relaxed">
                  {error}
                </div>
              )}

              {/* Category select buttons */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  1. Business Segment *
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const CatIcon = cat.icon;
                    const isSelected = businessType === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setBusinessType(cat.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-brand-600/10 border-brand-500 text-brand-400 font-bold shadow-md shadow-brand-500/5'
                            : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        }`}
                      >
                        <CatIcon className="h-5 w-5 mb-1.5" />
                        <span className="text-[11px] leading-tight">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input details */}
              <div className="space-y-4">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  2. Lead & Requirement info
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-slate-900/40 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 rounded-xl text-slate-200 placeholder-slate-500 text-xs outline-none transition"
                      placeholder="Your Full Name *"
                    />
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Phone className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-slate-900/40 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 rounded-xl text-slate-200 placeholder-slate-500 text-xs outline-none transition"
                      placeholder="Contact Phone Number *"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-slate-900/40 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 rounded-xl text-slate-200 placeholder-slate-500 text-xs outline-none transition"
                      placeholder="Email Address *"
                    />
                  </div>

                  {/* Budget */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <DollarSign className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 bg-slate-900/40 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 rounded-xl text-slate-200 placeholder-slate-500 text-xs outline-none transition"
                      placeholder="Project/Purchase Budget (e.g. $5k, $200/mo) *"
                    />
                  </div>
                </div>

                {/* Business Requirement */}
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-slate-500">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-900/40 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 rounded-xl text-slate-200 placeholder-slate-500 text-xs outline-none transition resize-none"
                    placeholder="Describe your requirement or inquiry in detail... *"
                  />
                </div>

                {/* Additional Notes */}
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-slate-500">
                    <PlusCircle className="h-4.5 w-4.5" />
                  </div>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-900/40 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 rounded-xl text-slate-200 placeholder-slate-500 text-xs outline-none transition resize-none"
                    placeholder="Any additional timeline requests or notes (Optional)"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-4 px-4 bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-brand-500/15 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isLoading ? 'Processing with AI engine...' : 'Submit Inquiry'}</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
export default LeadForm;
