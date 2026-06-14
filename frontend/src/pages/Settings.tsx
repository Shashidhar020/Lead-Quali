import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Database, Send, Cpu, Check, AlertTriangle, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ConfigInfo {
  mode: 'Demo' | 'Production';
  databaseProvider: 'sqlite' | 'postgres';
  openRouterConfigured: boolean;
  telegramConfigured: boolean;
  telegramChatId: string;
}

export const Settings: React.FC = () => {
  const { authFetch } = useAuth();
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [testingTelegram, setTestingTelegram] = useState(false);

  // Fetch current environment configurations
  const { data: config, isLoading } = useQuery<ConfigInfo>({
    queryKey: ['systemConfig'],
    queryFn: async () => {
      const res = await authFetch('/api/leads/config-info');
      if (!res.ok) throw new Error('Failed to load settings');
      return res.json();
    },
  });

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    setTestSuccess(null);
    try {
      const res = await authFetch('/api/leads/test-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
        setTestSuccess(data.message || 'Notification fired! Check your Telegram chat or terminal log.');
      } else {
        throw new Error(data.message || 'Notification test failed');
      }
    } catch (err: any) {
      setTestSuccess(`Error: ${err.message}`);
    } finally {
      setTestingTelegram(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="glass p-6 rounded-2xl border border-slate-800">
        <h2 className="text-lg font-bold text-slate-200">Platform Settings & Integrations</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review connection statuses and active modules. Toggle credentials within your root environmental configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Connection Statuses */}
        <div className="glass p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center space-x-2.5">
            <Shield className="h-5 w-5 text-brand-400" />
            <h3 className="text-sm font-bold text-slate-300">System Mode</h3>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="h-16 bg-slate-800/50 animate-pulse rounded-xl" />
            ) : (
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                config?.mode === 'Production'
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
              }`}>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider">Active Mode: {config?.mode}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {config?.mode === 'Production'
                      ? 'Connected to live APIs, live Database, and Bot notifications.'
                      : 'Mock AI & SQLite fallback enabled for zero-config demoing.'}
                  </p>
                </div>
                <span className={`h-2.5 w-2.5 rounded-full ${config?.mode === 'Production' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              </div>
            )}

            <div className="space-y-3 pt-2">
              {/* Database Status */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center space-x-2 text-slate-400">
                  <Database className="h-4 w-4 text-slate-500" />
                  <span>Database Engine</span>
                </span>
                <span className="font-bold text-slate-200 uppercase">{config?.databaseProvider || 'SQLite'}</span>
              </div>

              {/* AI Status */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center space-x-2 text-slate-400">
                  <Cpu className="h-4 w-4 text-slate-500" />
                  <span>OpenRouter AI Link</span>
                </span>
                <span className={`font-semibold flex items-center space-x-1 ${config?.openRouterConfigured ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {config?.openRouterConfigured ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Configured</span>
                    </>
                  ) : (
                    <span>Not Configured (Demo Mode)</span>
                  )}
                </span>
              </div>

              {/* Telegram Status */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center space-x-2 text-slate-400">
                  <Send className="h-4 w-4 text-slate-500" />
                  <span>Telegram Alerts</span>
                </span>
                <span className={`font-semibold flex items-center space-x-1 ${config?.telegramConfigured ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {config?.telegramConfigured ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Configured</span>
                    </>
                  ) : (
                    <span>Console Log Fallback</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Testing */}
        <div className="glass p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center space-x-2.5">
            <Send className="h-5 w-5 text-brand-400" />
            <h3 className="text-sm font-bold text-slate-300">Integration Testing</h3>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify your notification pipeline. Triggering this action will send a mock qualification alert message to either the configured Telegram Bot or the system terminal logs.
            </p>

            <button
              onClick={handleTestTelegram}
              disabled={testingTelegram}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10 transition disabled:opacity-50"
            >
              {testingTelegram ? 'Sending alert...' : 'Trigger Test Notification'}
            </button>

            {testSuccess && (
              <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl flex items-start space-x-2 text-[11px] text-slate-300">
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="break-all">{testSuccess}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Env variables guide */}
      <div className="glass p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <Key className="h-5 w-5 text-brand-400" />
          <h3 className="text-sm font-bold text-slate-300">Environment Variables Documentation</h3>
        </div>
        
        <p className="text-xs text-slate-400 leading-relaxed">
          To transition the system to Production Mode, create a `.env` file in the project root containing these variables:
        </p>

        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[10px] text-brand-300 overflow-x-auto leading-relaxed select-all">
{`# Database
DATABASE_URL=postgresql://username:password@localhost:5432/qualiai

# AI Configuration
OPENROUTER_API_KEY=your-openrouter-api-key

# Notification Configuration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id`}
        </pre>
      </div>
    </div>
  );
};
export default Settings;
