import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const EmployerLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { loginEmployer } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await loginEmployer({ email, password });
      navigate('/employer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify employer credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('employer@techcorp.com');
    setPassword('Employer123!');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-navy-50 border border-slate-200 text-navy-900 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Employer Portal
          </span>
          <h2 className="text-2xl font-bold font-heading text-navy-900 mt-1">
            Sign In to SkilBridge
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access verified returning candidates, review evidence dossiers, and manage returnships.
          </p>
        </div>

        {/* Demo Quick Button */}
        <div className="mb-6 p-3 rounded-xl bg-navy-50 border border-slate-200 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[11px] font-bold text-navy-900 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Demo Employer Account
            </span>
            <span className="text-[10px] text-slate-500">employer@techcorp.com</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-[11px] font-bold px-2.5 py-1 rounded bg-navy-900 text-white hover:bg-navy-800 transition-colors"
          >
            Auto-fill
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recruiter@company.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In as Employer'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-600">
            New company?{' '}
            <Link to="/auth/employer/register" className="font-semibold text-navy-900 hover:underline">
              Register Employer Account
            </Link>
          </p>
          <p className="text-xs text-slate-400">
            Returning professional?{' '}
            <Link to="/auth/candidate/login" className="font-semibold text-brand-600 hover:underline">
              Switch to Candidate Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
