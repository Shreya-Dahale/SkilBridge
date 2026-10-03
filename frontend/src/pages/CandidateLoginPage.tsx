import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const CandidateLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { loginCandidate } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await loginCandidate({ email, password });
      navigate('/candidate/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('candidate@skilbridge.com');
    setPassword('Candidate123!');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <UserCheck className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
            Candidate Portal
          </span>
          <h2 className="text-2xl font-bold font-heading text-navy-900 mt-1">
            Sign In to SkilBridge
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your Evidence Profile, assessments, and returnship roadmap.
          </p>
        </div>

        {/* Demo Quick Button */}
        <div className="mb-6 p-3 rounded-xl bg-brand-50/70 border border-brand-200/80 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[11px] font-bold text-brand-900 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Demo Candidate Account
            </span>
            <span className="text-[10px] text-brand-700">candidate@skilbridge.com</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-[11px] font-bold px-2.5 py-1 rounded bg-brand-600 text-white hover:bg-brand-700 transition-colors"
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
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
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
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In as Candidate'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-600">
            Don't have an account?{' '}
            <Link to="/auth/candidate/register" className="font-semibold text-brand-600 hover:underline">
              Create Candidate Account
            </Link>
          </p>
          <p className="text-xs text-slate-400">
            Hiring manager or company?{' '}
            <Link to="/auth/employer/login" className="font-semibold text-navy-900 hover:underline">
              Switch to Employer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
