import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import {
  X,
  Award,
  ShieldCheck,
  Briefcase,
  Calendar,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Send,
  MessageSquare,
  Clock,
  Sparkles,
} from 'lucide-react';

interface CandidateDossierModalProps {
  candidateId: string;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export const CandidateDossierModal: React.FC<CandidateDossierModalProps> = ({
  candidateId,
  onClose,
  onStatusUpdated,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<string>('SHORTLISTED');
  const [note, setNote] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchDossier = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/employer/candidate/${candidateId}/evidence-profile`);
        setData(res);
        if (res.pipelineStatus && res.pipelineStatus !== 'NEW') {
          setStatus(res.pipelineStatus);
        }
        if (res.sharedNote) {
          setNote(res.sharedNote);
        }
      } catch (err) {
        console.error('Failed to load dossier:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDossier();
  }, [candidateId]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      setSuccessMsg(null);
      await apiRequest(`/employer/candidate/${candidateId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus, note }),
      });
      setStatus(newStatus);
      setSuccessMsg(`Candidate successfully moved to ${newStatus}!`);
      if (onStatusUpdated) onStatusUpdated();
    } catch (err: any) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-navy-900">Loading Candidate Evidence Dossier...</p>
        </div>
      </div>
    );
  }

  const candidate = data?.candidate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-navy-900 text-white p-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={
                candidate?.profilePhoto ||
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
              }
              alt={candidate?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-400/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-heading">{candidate?.name}</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Returner
                </span>
              </div>
              <p className="text-sm text-indigo-200 font-medium">{candidate?.targetRole}</p>
              <div className="flex items-center gap-4 text-xs text-slate-300 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {candidate?.location || 'Remote'}
                </span>
                <span className="flex items-center gap-1 bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded">
                  <Clock className="w-3.5 h-3.5" />
                  {candidate?.careerBreakYears} Year Career Break
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Re-entry Narrative & Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-brand-50/60 border border-brand-200/80 p-4 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 block mb-1">
                Career Break Reframing Narrative
              </span>
              <p className="text-xs text-navy-900 leading-relaxed italic">
                "{candidate?.bio || 'Experienced engineering professional returning with validated technical mastery and renewed commitment.'}"
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Verified Evidence Index
              </span>
              <div className="text-3xl font-extrabold text-navy-900 font-heading my-0.5">
                {candidate?.evidenceScore}%
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
                <Award className="w-3.5 h-3.5" /> High Readiness Match
              </span>
            </div>
          </div>

          {/* Verified Evidence Artifacts (The Core Differentiator) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Verified Practical Evidence Portfolio
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {candidate?.evidences?.map((ev: any) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-brand-300 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-navy-900">{ev.skill}</span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Score: {ev.score}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {ev.description}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 uppercase font-semibold text-[10px]">
                      {ev.evidenceType.replace('_', ' ')}
                    </span>
                    {ev.verificationUrl && (
                      <a
                        href={ev.verificationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 font-medium hover:underline flex items-center gap-1"
                      >
                        Inspect Proof <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Experience Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-600" />
              Prior Professional Experience
            </h4>
            <div className="space-y-3">
              {candidate?.careerHistories?.map((ch: any) => (
                <div key={ch.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-900">{ch.role}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {ch.startDate} — {ch.endDate || 'Present'}
                    </span>
                  </div>
                  <div className="text-brand-700 font-medium text-[11px] mb-1">{ch.company}</div>
                  <p className="text-slate-600 leading-relaxed">{ch.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline Review Actions */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900">
              Employer Decision & Pipeline Action
            </h4>

            {successMsg && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {successMsg}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={updating}
                onClick={() => handleUpdateStatus('SHORTLISTED')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  status === 'SHORTLISTED'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ⭐ Shortlist Candidate
              </button>

              <button
                disabled={updating}
                onClick={() => handleUpdateStatus('INTERVIEW_REQUESTED')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  status === 'INTERVIEW_REQUESTED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                Request Technical Interview
              </button>

              <button
                disabled={updating}
                onClick={() => handleUpdateStatus('REVIEWED')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  status === 'REVIEWED'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Mark as Reviewed
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Internal Recruiter Note / Interview Feedback
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Strong React scores; invite for architecture interview."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  disabled={updating}
                  onClick={() => handleUpdateStatus(status)}
                  className="px-3 py-1.5 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800 shrink-0"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
