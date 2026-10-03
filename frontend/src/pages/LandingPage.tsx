import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building2,
  TrendingUp,
  FileCheck,
  Award,
  Sparkles,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { PIPELINE_STAGES } from '../components/PipelineSteps';

export const LandingPage: React.FC = () => {
  const { user, loginCandidate, loginEmployer } = useAuth();
  const navigate = useNavigate();

  const handleDemoCandidate = async () => {
    try {
      await loginCandidate({ email: 'candidate@skilbridge.com', password: 'Candidate123!' });
      navigate('/candidate/dashboard');
    } catch (e) {
      navigate('/auth/candidate/login');
    }
  };

  const handleDemoEmployer = async () => {
    try {
      await loginEmployer({ email: 'employer@techcorp.com', password: 'Employer123!' });
      navigate('/employer/dashboard');
    } catch (e) {
      navigate('/auth/employer/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 gradient-hero border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Next-Generation Career Re-entry Platform</span>
          </div>

          {/* Main Title & Exact Tagline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight font-heading max-w-4xl mx-auto leading-[1.15]">
            Don’t hide the career gap.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-blue">
              Fill the evidence gap.
            </span>
          </h1>

          {/* Short explanation */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            <strong className="text-navy-900">SkilBridge</strong> helps professionals returning after a
            career break connect their previous experience with current job requirements and build
            verifiable proof of their current capabilities through hands-on practical assessments.
          </p>

          {/* The TWO Mandatory Entry Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              to="/auth/candidate/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
            >
              <span>I’m a Candidate</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/auth/employer/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm shadow-md transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>I’m an Employer</span>
            </Link>
          </div>

          {/* Instant 1-Click Demo Login Box */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 max-w-xl mx-auto">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2.5">
              ⚡ Instant 1-Click Demo Test Accounts
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleDemoCandidate}
                className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:border-brand-500 text-slate-700 hover:text-brand-700 shadow-sm transition-all flex items-center gap-1.5"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Launch Demo Candidate (Priya Sharma, 3.5y Break)
              </button>
              <button
                onClick={handleDemoEmployer}
                className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:border-navy-900 text-slate-700 hover:text-navy-900 shadow-sm transition-all flex items-center gap-1.5"
              >
                <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                Launch Demo Employer (TechCorp Solutions)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pipeline Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
              The Evidence-Based Re-entry Pipeline
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-heading">
              From Career Pause to Verified Proof
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Replace resume skepticism with verified technical capability in 8 structured steps.
            </p>
          </div>

          {/* 8-Step Pipeline Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PIPELINE_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-brand-300 hover:bg-brand-50/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-600 font-mono">0{idx + 1}</span>
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-navy-900 mb-1">{stage.name}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{stage.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Two Portal Cards (Candidate vs Employer) */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Candidate Portal Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
                  For Returning Professionals
                </span>
                <h3 className="text-2xl font-bold font-heading text-navy-900 mb-3">
                  Candidate Portal
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Turn past experience into your strongest asset. Take real-world skills assessments,
                  identify knowledge gaps, build verified evidence, and share a verified dossier directly with hiring managers.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Automated Skill Gap Analysis vs live roles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Interactive timed assessments with instant badges
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Shareable verified Evidence Profile URL
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/auth/candidate/login"
                  className="flex-1 py-3 text-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors"
                >
                  Candidate Login
                </Link>
                <Link
                  to="/auth/candidate/register"
                  className="flex-1 py-3 text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors border border-slate-200"
                >
                  Create Account
                </Link>
              </div>
            </div>

            {/* Employer Portal Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-navy-50 border border-slate-200 flex items-center justify-center text-navy-900 mb-6">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  For Progressive Employers
                </span>
                <h3 className="text-2xl font-bold font-heading text-navy-900 mb-3">
                  Employer Portal
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Hire proven returning talent without resume bias. Review tamper-evident assessment scores,
                  code evidence, and career timelines for candidates ready to deliver on day one.
                </p>

                <ul className="space-y-2.5 text-xs text-slate-700 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" />
                    Talent pool filtered by verified assessment scores
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" />
                    Post returnships and flexible engineering roles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" />
                    1-Click candidate shortlisting and interview invites
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/auth/employer/login"
                  className="flex-1 py-3 text-center rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs transition-colors"
                >
                  Employer Login
                </Link>
                <Link
                  to="/auth/employer/register"
                  className="flex-1 py-3 text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors border border-slate-200"
                >
                  Register Company
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
