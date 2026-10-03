import React from 'react';
import { ShieldCheck, Award, Zap } from 'lucide-react';

interface ReadinessMeterProps {
  score: number;
  totalSkills?: number;
  verifiedSkills?: number;
  evidenceCount?: number;
}

export const ReadinessMeter: React.FC<ReadinessMeterProps> = ({
  score = 75,
  totalSkills = 8,
  verifiedSkills = 5,
  evidenceCount = 4,
}) => {
  const getBadgeColor = (val: number) => {
    if (val >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', label: 'High Re-entry Readiness' };
    if (val >= 60) return { bg: 'bg-brand-500', text: 'text-brand-700', border: 'border-brand-200', label: 'Solid Verification' };
    return { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', label: 'Refresh In Progress' };
  };

  const badge = getBadgeColor(score);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-brand-600" />
            Evidence Readiness Index
          </h4>
          <span className="text-xl font-extrabold text-navy-900 font-heading">
            {score}<span className="text-sm font-semibold text-slate-600">/100</span>
          </span>
        </div>

        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.border} ${badge.text} bg-slate-50`}>
          {badge.label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden p-0.5 border border-slate-200/60">
        <div
          className={`h-full rounded-full transition-all duration-700 ${badge.bg}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        ></div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
        <div>
          <div className="text-xs text-slate-600">Verified Skills</div>
          <div className="text-sm font-bold text-navy-900 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {verifiedSkills}/{totalSkills}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-600">Active Badges</div>
          <div className="text-sm font-bold text-navy-900 flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-brand-600" />
            {evidenceCount} Artifacts
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-600">Market Fit</div>
          <div className="text-sm font-bold text-emerald-600">
            {Math.round(score * 0.95)}%
          </div>
        </div>
      </div>
    </div>
  );
};
