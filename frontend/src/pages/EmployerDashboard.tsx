import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { CandidateDossierModal } from '../components/CandidateDossierModal';
import {
  Building2,
  Users,
  Briefcase,
  Search,
  Filter,
  ShieldCheck,
  Award,
  Clock,
  MapPin,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
  Send,
  Star,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'talent' | 'jobs' | 'pipeline'>('talent');
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [talentPool, setTalentPool] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchRole, setSearchRole] = useState('');
  const [filterBreak, setFilterBreak] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterMinScore, setFilterMinScore] = useState('');

  // Post Job modal state
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    location: 'Bangalore (Hybrid)',
    experienceRequired: '4+ years prior experience',
    salaryRange: '₹22,00,000 - ₹30,00,000',
    workMode: 'Hybrid',
    description: '',
    requiredSkills: 'React, TypeScript, REST APIs',
    preferredSkills: 'System Design, Docker',
  });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadEmployerData = async () => {
    try {
      setLoading(true);
      const profRes = await apiRequest('/employer/profile');
      setProfileData(profRes.employer);
      setStats(profRes.stats);

      // Fetch talent pool with current query parameters
      const params = new URLSearchParams();
      if (searchRole) params.append('targetRole', searchRole);
      if (filterBreak) {
        if (filterBreak === '1-2') {
          params.append('minBreak', '1');
          params.append('maxBreak', '2');
        } else if (filterBreak === '3-5') {
          params.append('minBreak', '3');
          params.append('maxBreak', '5');
        } else if (filterBreak === '5+') {
          params.append('minBreak', '5');
        }
      }
      if (filterSkill) params.append('skill', filterSkill);
      if (filterMinScore) params.append('minScore', filterMinScore);

      const talentRes = await apiRequest(`/employer/talent-pool?${params.toString()}`);
      setTalentPool(talentRes);
    } catch (err) {
      console.error('Failed to load employer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployerData();
  }, [searchRole, filterBreak, filterSkill, filterMinScore]);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const reqSkills = jobForm.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const prefSkills = jobForm.preferredSkills.split(',').map((s) => s.trim()).filter(Boolean);

      await apiRequest('/employer/jobs', {
        method: 'POST',
        body: JSON.stringify({
          ...jobForm,
          requiredSkills: reqSkills,
          preferredSkills: prefSkills,
        }),
      });

      setShowPostJobModal(false);
      setJobForm({
        title: '',
        location: 'Bangalore (Hybrid)',
        experienceRequired: '4+ years prior experience',
        salaryRange: '₹22,00,000 - ₹30,00,000',
        workMode: 'Hybrid',
        description: '',
        requiredSkills: 'React, TypeScript, REST APIs',
        preferredSkills: 'System Design, Docker',
      });
      setSuccessMsg('New returnship job role published successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
      loadEmployerData();
    } catch (err: any) {
      alert(err.message || 'Failed to post job');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to close this job posting?')) return;
    try {
      await apiRequest(`/employer/jobs/${jobId}`, { method: 'DELETE' });
      loadEmployerData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickStatus = async (candidateId: string, status: string) => {
    try {
      await apiRequest(`/employer/candidate/${candidateId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      setSuccessMsg(`Candidate status updated to ${status}!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      loadEmployerData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !profileData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-bold text-navy-900">Loading Employer Portal...</h3>
          <p className="text-xs text-slate-500 mt-1">Fetching returning talent pool and active returnships.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-bold text-xl shadow-md">
              {profileData?.companyName?.charAt(0) || 'E'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-heading text-navy-900">
                  {profileData?.companyName}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Partner Employer
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {profileData?.industry} &bull; {profileData?.location || 'Pan India'} &bull; Contact: {user?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPostJobModal(true)}
              className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Post Returnship Job
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Returning Talent</span>
            <div className="text-2xl font-extrabold text-navy-900 mt-1">{talentPool.length} Candidates</div>
            <span className="text-[11px] text-emerald-600 font-medium">Verified Evidence Profiles</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Returnships</span>
            <div className="text-2xl font-extrabold text-brand-600 mt-1">{stats?.activeJobs || 0} Open Roles</div>
            <span className="text-[11px] text-slate-500">Skills-First Criteria</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shortlisted Returners</span>
            <div className="text-2xl font-extrabold text-indigo-600 mt-1">{stats?.shortlistedCount || 0} Candidates</div>
            <span className="text-[11px] text-indigo-600 font-medium">Ready for Technical Review</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shared Profiles</span>
            <div className="text-2xl font-extrabold text-navy-900 mt-1">{stats?.sharedCandidatesCount || 0} Submissions</div>
            <span className="text-[11px] text-slate-500">Direct Candidate Applications</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('talent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'talent'
                ? 'bg-navy-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Verified Talent Pool ({talentPool.length})
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'jobs'
                ? 'bg-navy-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Manage Jobs & Returnships ({profileData?.jobs?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'pipeline'
                ? 'bg-navy-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
            }`}
          >
            <Star className="w-4 h-4" />
            Shortlist & Interview Pipeline
          </button>
        </div>

        {/* 1. TALENT POOL TAB */}
        {activeTab === 'talent' && (
          <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchRole}
                  onChange={(e) => setSearchRole(e.target.value)}
                  placeholder="Search by target role (e.g. Frontend, Full Stack, Lead)..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-900"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={filterBreak}
                  onChange={(e) => setFilterBreak(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-900 bg-white"
                >
                  <option value="">All Career Break Durations</option>
                  <option value="1-2">1 - 2 Years Break</option>
                  <option value="3-5">3 - 5 Years Break</option>
                  <option value="5+">5+ Years Break</option>
                </select>

                <select
                  value={filterSkill}
                  onChange={(e) => setFilterSkill(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-900 bg-white"
                >
                  <option value="">All Verified Skills</option>
                  <option value="React">React</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="Node.js">Node.js</option>
                  <option value="PostgreSQL">PostgreSQL</option>
                  <option value="Cloud & AWS">Cloud & AWS</option>
                  <option value="System Design">System Design</option>
                </select>

                <select
                  value={filterMinScore}
                  onChange={(e) => setFilterMinScore(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-navy-900 bg-white"
                >
                  <option value="">Min Evidence Score</option>
                  <option value="85">85%+</option>
                  <option value="90">90%+</option>
                </select>
              </div>
            </div>

            {/* Candidate Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {talentPool.map((candidate) => (
                <div
                  key={candidate.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={
                          candidate.profilePhoto ||
                          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
                        }
                        alt={candidate.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-navy-900 truncate">{candidate.name}</h4>
                          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {candidate.evidenceScore}%
                          </span>
                        </div>
                        <p className="text-xs text-brand-700 font-semibold truncate">{candidate.targetRole}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {candidate.careerBreakYears}y Break
                          </span>
                          <span>&bull;</span>
                          <span className="truncate">{candidate.location || 'Remote'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    <p className="text-xs text-slate-600 line-clamp-2 italic mb-3 leading-relaxed">
                      "{candidate.bio || 'Returning technical specialist with validated core capability.'}"
                    </p>

                    {/* Verified Skill Chips */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {candidate.verifiedSkills?.map((s: string) => (
                        <span
                          key={s}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1"
                        >
                          <ShieldCheck className="w-2.5 h-2.5" />
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedCandidateId(candidate.id)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Review Dossier
                    </button>

                    <button
                      onClick={() => handleQuickStatus(candidate.id, 'SHORTLISTED')}
                      className="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors"
                      title="Shortlist Candidate"
                    >
                      ⭐ Shortlist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. JOBS MANAGEMENT TAB */}
        {activeTab === 'jobs' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-heading text-navy-900">
                  Returnship Job Openings
                </h3>
                <p className="text-xs text-slate-500">
                  Targeted engineering roles open to returning talent without resume gap bias.
                </p>
              </div>

              <button
                onClick={() => setShowPostJobModal(true)}
                className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Opening
              </button>
            </div>

            <div className="space-y-4">
              {profileData?.jobs?.map((job: any) => (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-navy-900">{job.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {job.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location} ({job.workMode})</span>
                      <span>{job.experienceRequired}</span>
                      <span className="font-semibold text-brand-700">{job.salaryRange}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl">{job.description}</p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {job.jobSkills?.map((js: any) => (
                        <span
                          key={js.id}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            js.required ? 'bg-navy-50 text-navy-900 font-bold border border-slate-300' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {js.skill.name} {js.required && '• Required'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. PIPELINE REVIEW TAB */}
        {activeTab === 'pipeline' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold font-heading text-navy-900">
                Candidate Review & Interview Pipeline
              </h3>
              <p className="text-xs text-slate-500">
                Candidates moving through your returnship evaluation workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Shortlisted Column */}
              <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-900 uppercase">⭐ Shortlisted</span>
                  <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-brand-200">
                    {talentPool.filter((c) => c.pipelineStatus === 'SHORTLISTED').length}
                  </span>
                </div>

                {talentPool
                  .filter((c) => c.pipelineStatus === 'SHORTLISTED')
                  .map((c) => (
                    <div key={c.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-navy-900">{c.name}</span>
                        <span className="text-[10px] font-bold text-emerald-600">{c.evidenceScore}% Score</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{c.targetRole} &bull; {c.careerBreakYears}y Break</p>
                      <button
                        onClick={() => setSelectedCandidateId(c.id)}
                        className="w-full py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-[11px] font-semibold"
                      >
                        View Full Dossier
                      </button>
                    </div>
                  ))}
              </div>

              {/* Interview Requested Column */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase">💬 Interview Scheduled</span>
                  <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {talentPool.filter((c) => c.pipelineStatus === 'INTERVIEW_REQUESTED').length}
                  </span>
                </div>

                {talentPool
                  .filter((c) => c.pipelineStatus === 'INTERVIEW_REQUESTED')
                  .map((c) => (
                    <div key={c.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-navy-900">{c.name}</span>
                        <span className="text-[10px] font-bold text-emerald-600">{c.evidenceScore}% Score</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{c.targetRole}</p>
                      <button
                        onClick={() => setSelectedCandidateId(c.id)}
                        className="w-full py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-[11px] font-semibold"
                      >
                        View Full Dossier
                      </button>
                    </div>
                  ))}
              </div>

              {/* Reviewed Column */}
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase">📋 Under Review</span>
                  <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-slate-300">
                    {talentPool.filter((c) => c.pipelineStatus === 'REVIEWED' || c.pipelineStatus === 'NEW').length}
                  </span>
                </div>

                {talentPool
                  .filter((c) => c.pipelineStatus === 'REVIEWED' || c.pipelineStatus === 'NEW')
                  .slice(0, 5)
                  .map((c) => (
                    <div key={c.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-navy-900">{c.name}</span>
                        <span className="text-[10px] font-bold text-slate-500">{c.evidenceScore}% Score</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{c.targetRole}</p>
                      <button
                        onClick={() => setSelectedCandidateId(c.id)}
                        className="w-full py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-[11px] font-semibold"
                      >
                        Inspect Dossier
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Candidate Dossier Inspection Modal */}
      {selectedCandidateId && (
        <CandidateDossierModal
          candidateId={selectedCandidateId}
          onClose={() => setSelectedCandidateId(null)}
          onStatusUpdated={() => loadEmployerData()}
        />
      )}

      {/* Post Job Modal */}
      {showPostJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-navy-900 mb-1">Post a Returnship Job Role</h3>
            <p className="text-xs text-slate-500 mb-4">
              Specify technical competencies. Candidates with matching verified evidence badges will be auto-scored.
            </p>

            <form onSubmit={handlePostJob} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Job Title *</label>
                <input
                  type="text"
                  required
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="e.g. Senior Frontend Engineer (Return-to-Work)"
                  className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Work Mode</label>
                  <select
                    value={jobForm.workMode}
                    onChange={(e) => setJobForm({ ...jobForm, workMode: e.target.value })}
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Experience Required</label>
                  <input
                    type="text"
                    value={jobForm.experienceRequired}
                    onChange={(e) => setJobForm({ ...jobForm, experienceRequired: e.target.value })}
                    placeholder="e.g. 3-6 years prior experience"
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Compensation Range</label>
                  <input
                    type="text"
                    value={jobForm.salaryRange}
                    onChange={(e) => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Required Skills (Comma-separated) *</label>
                <input
                  type="text"
                  required
                  value={jobForm.requiredSkills}
                  onChange={(e) => setJobForm({ ...jobForm, requiredSkills: e.target.value })}
                  placeholder="React, TypeScript, REST APIs"
                  className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Preferred Skills</label>
                <input
                  type="text"
                  value={jobForm.preferredSkills}
                  onChange={(e) => setJobForm({ ...jobForm, preferredSkills: e.target.value })}
                  placeholder="System Design, Docker & CI/CD"
                  className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Role Description & Returnship Perks *</label>
                <textarea
                  rows={3}
                  required
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Describe the team, tech stack, structured returnship onboarding..."
                  className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowPostJobModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded-xl"
                >
                  Publish Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
