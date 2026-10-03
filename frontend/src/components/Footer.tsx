import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, CheckCircle2, Shield, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-heading text-white">
                Skil<span className="text-brand-400">Bridge</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Don’t hide the career gap. Fill the evidence gap. SkilBridge empowers returning professionals
              to validate their capabilities through verified practical assessments and tangible evidence.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg w-fit">
              <Shield className="w-3.5 h-3.5" />
              Verified Skills Platform
            </div>
          </div>

          {/* Core Pipeline */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Core Pipeline</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> Past Experience
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> Target Role Definition
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> Skill Gap Analysis
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> Practical Assessments
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> Evidence Profile & Review
              </li>
            </ul>
          </div>

          {/* For Candidates */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Candidate Portal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/auth/candidate/login" className="hover:text-white transition-colors">
                  Candidate Login
                </Link>
              </li>
              <li>
                <Link to="/auth/candidate/register" className="hover:text-white transition-colors">
                  Create Candidate Account
                </Link>
              </li>
              <li>
                <Link to="/assessments" className="hover:text-white transition-colors">
                  Practical Skill Assessments
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors">
                  Return-to-Work Opportunities
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Employer Portal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/auth/employer/login" className="hover:text-white transition-colors">
                  Employer Login
                </Link>
              </li>
              <li>
                <Link to="/auth/employer/register" className="hover:text-white transition-colors">
                  Register Company
                </Link>
              </li>
              <li>
                <Link to="/auth/employer/login" className="hover:text-white transition-colors">
                  Access Returning Talent Pool
                </Link>
              </li>
              <li>
                <div className="flex items-center gap-1 text-slate-400 mt-2">
                  <HeartHandshake className="w-3.5 h-3.5 text-indigo-400" />
                  Inclusive Returnship Programs
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} SkilBridge. All rights reserved. Evidence-based career re-entry.
          </div>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Verification</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
