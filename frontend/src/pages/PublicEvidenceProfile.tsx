import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../services/api';
import {
  Compass,
  ShieldCheck,
  Award,
  Clock,
  MapPin,
  ExternalLink,
  Briefcase,
  CheckCircle2,
  Calendar,
  Share2,
} from 'lucide-react';

export const PublicEvidenceProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/jobs/public/evidence/${id}`);
        setCandidate(data);
      } catch (err: any) {
        setError(err.message || 'Evidence Profile not found or expired.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-base font-bold text-navy-900">Verifying Evidence Dossier...</h3>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-sm">
          <h3 className="text-lg font-bold text-navy-900 mb-2">Evidence Profile Not Found</h3>
          <p className="text-xs text-slate-500 mb-6">{error || 'This link may be invalid or expired.'}</p>
          <Link
            to="/"
            className="px-5 py-2.5 bg-navy-900 text-white rounded-xl text-xs font-semibold hover:bg-navy-800"
          >
            Go to SkilBridge Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Verification Header Tag */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-bold text-navy-900 font-heading">
              Skil<span className="text-brand-600">Bridge</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Cryptographically Verified Profile
          </div>
        </div>

        {/* Main Dossier Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8">
          {/* Identity & Index Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-5">
              <img
                src={
                  candidate.profilePhoto ||
                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
                }
                alt={candidate.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-200 shadow-sm"
              />
              <div>
                <h1 className="text-2xl font-bold font-heading text-navy-900">{candidate.name}</h1>
                <p className="text-sm font-semibold text-brand-700">{candidate.targetRole}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {candidate.location}</span>
                  <span className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                    <Clock className="w-3.5 h-3.5" /> {candidate.careerBreakYears} Year Career Break
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Verified Evidence Score</span>
              <div className="text-4xl font-extrabold text-navy-900 font-heading">
                {candidate.evidenceScore}%
              </div>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> High Re-entry Readiness
              </span>
            </div>
          </div>

          {/* Break Reframing Statement */}
          <div className="p-5 rounded-2xl bg-brand-50/50 border border-brand-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 block mb-1">
              Reframing the Career Break
            </span>
            <p className="text-xs sm:text-sm text-navy-900 leading-relaxed italic">
              "{candidate.bio || 'Returning technical specialist with renewed focus, validated modern skills, and day-one readiness.'}"
            </p>
          </div>

          {/* Verified Evidence Artifacts */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-600" />
              Verified Practical Evidence Artifacts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {candidate.evidences?.map((ev: any) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-brand-300 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-navy-900">{ev.skill}</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {ev.score}% Score
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">{ev.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 uppercase font-semibold text-[10px]">
                      {ev.evidenceType.replace('_', ' ')}
                    </span>
                    {ev.verificationUrl && (
                      <a
                        href={ev.verificationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        Inspect Proof <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prior Career Experience Foundation */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-600" />
              Prior Professional Experience
            </h3>

            <div className="space-y-3">
              {candidate.careerHistories?.map((ch: any) => (
                <div key={ch.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
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

          {/* Employer Call to Action */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-navy-900 block">Interested in this candidate?</span>
              <span className="text-xs text-slate-500">Sign in as an employer on SkilBridge to request an interview.</span>
            </div>

            <Link
              to="/auth/employer/login"
              className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-all shadow-sm"
            >
              Sign In to Request Interview
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
