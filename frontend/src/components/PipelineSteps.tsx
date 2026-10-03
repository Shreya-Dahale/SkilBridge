import React from 'react';
import {
  History,
  Target,
  FileCheck2,
  GitCompare,
  GraduationCap,
  Sparkles,
  Award,
  Users2,
  ChevronRight,
} from 'lucide-react';

interface PipelineStepsProps {
  currentStepIndex?: number;
  onSelectStep?: (index: number) => void;
  className?: string;
}

export const PIPELINE_STAGES = [
  { id: 'experience', name: 'Past Experience', icon: History, description: 'Career timeline & skills' },
  { id: 'target_role', name: 'Target Role', icon: Target, description: 'Returning objective' },
  { id: 'job_reqs', name: 'Job Requirements', icon: FileCheck2, description: 'Live market demand' },
  { id: 'skill_gap', name: 'Skill Gap Analysis', icon: GitCompare, description: 'Fluency audit' },
  { id: 'assessments', name: 'Practical Assessments', icon: GraduationCap, description: 'Hands-on validation' },
  { id: 'evidence', name: 'Current Evidence', icon: Sparkles, description: 'Verified artifacts' },
  { id: 'profile', name: 'Evidence Profile', icon: Award, description: 'Comprehensive dossier' },
  { id: 'employer', name: 'Employer Review', icon: Users2, description: 'Talent match & interview' },
];

export const PipelineSteps: React.FC<PipelineStepsProps> = ({
  currentStepIndex = 3,
  onSelectStep,
  className = '',
}) => {
  return (
    <div className={`w-full bg-white rounded-2xl border border-slate-200 p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-pulse"></span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            SkilBridge Core Pipeline
          </h3>
        </div>
        <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
          Step {currentStepIndex + 1} of {PIPELINE_STAGES.length}: {PIPELINE_STAGES[currentStepIndex]?.name}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {PIPELINE_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <button
              key={stage.id}
              onClick={() => onSelectStep && onSelectStep(idx)}
              className={`relative flex flex-col items-center text-center p-3 rounded-xl transition-all text-xs ${
                isCurrent
                  ? 'bg-brand-50 border-2 border-brand-600 shadow-sm'
                  : isCompleted
                  ? 'bg-emerald-50/60 border border-emerald-200 text-slate-800 hover:bg-emerald-100/50'
                  : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
                  isCurrent
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                    : isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <span
                className={`font-semibold text-[11px] leading-tight line-clamp-1 ${
                  isCurrent ? 'text-brand-900 font-bold' : isCompleted ? 'text-emerald-900' : 'text-slate-600'
                }`}
              >
                {stage.name}
              </span>

              <span className="text-[10px] text-slate-600 line-clamp-1 mt-0.5 hidden lg:block">
                {stage.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
