import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Briefcase,
  UserCheck,
  Building2,
  LogOut,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-blue flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold font-heading text-navy-900 tracking-tight flex items-center gap-1">
                Skil<span className="text-brand-600">Bridge</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-600 block -mt-1">
                Evidence Re-entry
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/jobs"
              className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4" />
              Returnship Jobs
            </Link>
            <Link
              to="/assessments"
              className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Skill Assessments
            </Link>
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={user.role === 'CANDIDATE' ? '/candidate/dashboard' : '/employer/dashboard'}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-navy-900 leading-none">{user.name}</div>
                    <div className="text-[10px] text-brand-600 font-semibold uppercase tracking-wider">
                      {user.role}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth/candidate/login"
                  className="text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg text-slate-700 hover:text-navy-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4 text-brand-600" />
                  Candidate Login
                </Link>

                <Link
                  to="/auth/employer/login"
                  className="text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  Employer Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
