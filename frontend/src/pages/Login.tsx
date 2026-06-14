import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, AlertCircle, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@quali.ai');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-brand-500/10 blur-[150px]" />
      <div className="absolute -right-1/4 -bottom-1/4 h-[600px] w-[600px] rounded-full bg-violet-500/10 blur-[150px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="bg-gradient-to-tr from-brand-600 to-violet-400 p-3 rounded-2xl text-white shadow-xl shadow-brand-500/20 animate-float">
            <Zap className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent tracking-tight">
          Welcome back to QualiAI
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Enter credentials or use Demo Login to access dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="glass p-8 rounded-2xl border border-slate-800 shadow-2xl">
          {error && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-start space-x-3 text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 rounded-xl text-slate-100 placeholder-slate-500 text-sm outline-none transition-all duration-200"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 rounded-xl text-slate-100 placeholder-slate-500 text-sm outline-none transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-md shadow-brand-500/10 focus:outline-none disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative flex justify-center text-xs uppercase my-4">
              <span className="bg-slate-900/10 px-2 text-slate-500 font-semibold tracking-wider">Demo Access</span>
            </div>

            <button
              onClick={handleFillDemo}
              className="w-full py-3 px-4 bg-slate-800/50 hover:bg-slate-800 hover:text-slate-100 text-slate-300 font-semibold rounded-xl text-xs border border-slate-700/50 hover:border-slate-600 transition-all duration-200"
            >
              Autofill Seed Demo Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
