import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { PipelineSteps } from '../components/PipelineSteps';
import { ReadinessMeter } from '../components/ReadinessMeter';
import { AssessmentModal } from '../components/AssessmentModal';
import {
  LayoutDashboard,
  History,
  Target,
  GitCompare,
  GraduationCap,
  Sparkles,
  Award,
  Briefcase,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Building,
  Copy,
  Check,
  Send,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [profileData, setProfileData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [matchedJobs, setMatchedJobs] = useState<any[]>([]);
  const [evidenceProfile, setEvidenceProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);
  const [showAddHistoryModal, setShowAddHistoryModal] = useState(false);
  const [showAddEvidenceModal, setShowAddEvidenceModal] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Forms state
  const [historyForm, setHistoryForm] = useState({
    company: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const [evidenceForm, setEvidenceForm] = useState({
    skill: 'React',
    evidenceType: 'GITHUB_PROJECT',
    description: '',
    score: '90',
    verificationUrl: '',
  });

  const [skillForm, setSkillForm] = useState({
    skillName: '',
    category: 'Frontend',
    yearsExperience: '3',
    selfRating: '4',
  });

  const [targetRoleForm, setTargetRoleForm] = useState({
    targetRole: '',
    careerBreakYears: '3',
    location: '',
    phone: '',
    bio: '',
  });

  const loadAllCandidateData = async () => {
    try {
      setLoading(true);
      const [profRes, gapRes, assessRes, jobsRes, evidProfRes] = await Promise.all([
        apiRequest('/candidate/profile'),
        apiRequest('/candidate/skill-gap-analysis'),
        apiRequest('/assessments'),
        apiRequest('/candidate/matched-jobs'),
        apiRequest('/candidate/evidence-profile'),
      ]);

      setProfileData(profRes.profile);
      setMetrics(profRes.metrics);
      setGapAnalysis(gapRes);
      setAssessments(assessRes);
      setMatchedJobs(jobsRes);
      setEvidenceProfile(evidProfRes);

      if (profRes.profile) {
        setTargetRoleForm({
          targetRole: profRes.profile.targetRole || '',
          careerBreakYears: profRes.profile.careerBreakYears?.toString() || '0',
          location: profRes.profile.location || '',
          phone: profRes.profile.phone || '',
          bio: profRes.profile.bio || '',
        });
      }
    } catch (err) {
      console.error('Failed to load candidate dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCandidateData();
  }, []);

  const handleUpdateTargetRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/candidate/profile', {
        method: 'PUT',
        body: JSON.stringify(targetRoleForm),
      });
      setActionSuccessMsg('Target role and career break details saved successfully!');
      setTimeout(() => setActionSuccessMsg(null), 4000);
      loadAllCandidateData();
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleAddCareerHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/candidate/career-history', {
        method: 'POST',
        body: JSON.stringify(historyForm),
      });
      setShowAddHistoryModal(false);
      setHistoryForm({ company: '', role: '', startDate: '', endDate: '', description: '' });
      setActionSuccessMsg('Past career experience entry added!');
      setTimeout(() => setActionSuccessMsg(null), 4000);
      loadAllCandidateData();
    } catch (err: any) {
      alert(err.message || 'Failed to add career history');
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!confirm('Remove this career history entry?')) return;
    try {
      await apiRequest(`/candidate/career-history/${id}`, { method: 'DELETE' });
      loadAllCandidateData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/candidate/evidence', {
        method: 'POST',
        body: JSON.stringify(evidenceForm),
      });
      setShowAddEvidenceModal(false);
      setEvidenceForm({ skill: 'React', evidenceType: 'GITHUB_PROJECT', description: '', score: '90', verificationUrl: '' });
      setActionSuccessMsg('Verified evidence artifact attached!');
      setTimeout(() => setActionSuccessMsg(null), 4000);
      loadAllCandidateData();
    } catch (err: any) {
      alert(err.message || 'Failed to add evidence');
    }
  };

  const handleDeleteEvidence = async (id: string) => {
    if (!confirm('Remove this evidence artifact?')) return;
    try {
      await apiRequest(`/candidate/evidence/${id}`, { method: 'DELETE' });
      loadAllCandidateData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/candidate/skills', {
        method: 'POST',
        body: JSON.stringify(skillForm),
      });
      setShowAddSkillModal(false);
      setSkillForm({ skillName: '', category: 'Frontend', yearsExperience: '3', selfRating: '4' });
      setActionSuccessMsg('Skill added to audit profile!');
      setTimeout(() => setActionSuccessMsg(null), 4000);
      loadAllCandidateData();
    } catch (err: any) {
      alert(err.message || 'Failed to add skill');
    }
  };

  const handleShareProfileWithEmployer = async (employerId: string) => {
    try {
      await apiRequest('/candidate/share-profile', {
        method: 'POST',
        body: JSON.stringify({ employerId, note: 'Candidate applied and shared verified evidence profile.' }),
      });
      setActionSuccessMsg('Evidence profile submitted directly to hiring team!');
      setTimeout(() => setActionSuccessMsg(null), 4000);
      loadAllCandidateData();
    } catch (err: any) {
      alert(err.message || 'Failed to share profile');
    }
  };

  const handleCopyShareLink = () => {
    const fullUrl = `${window.location.origin}/evidence/${profileData?.id}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Map pipeline step index to dashboard tab
  const handleSelectPipelineStep = (stepIdx: number) => {
    const tabMap = ['history', 'target_role', 'jobs', 'gap', 'assessments', 'evidence', 'profile', 'jobs'];
    setActiveTab(tabMap[stepIdx] || 'overview');
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-bold text-navy-900">Loading Candidate Workspace...</h3>
          <p className="text-xs text-slate-500 mt-1">Calculating verified evidence metrics and skill gaps.</p>
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
            <img
              src={
                profileData?.profilePhoto ||
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
              }
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-200 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-heading text-navy-900">{user?.name}</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Evidence Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {profileData?.targetRole || 'Full Stack Engineer'} &bull;{' '}
                <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                  {profileData?.careerBreakYears} Year Career Break
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('assessments')}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4" />
              Take Assessment
            </button>
            <button
              onClick={handleCopyShareLink}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-navy-900 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              {copiedLink ? 'Link Copied!' : 'Share Evidence Profile'}
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {actionSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* 8-Stage Pipeline Tracker */}
        <PipelineSteps
          currentStepIndex={
            activeTab === 'history'
              ? 0
              : activeTab === 'target_role'
              ? 1
              : activeTab === 'gap'
              ? 3
              : activeTab === 'assessments'
              ? 4
              : activeTab === 'evidence'
              ? 5
              : activeTab === 'profile'
              ? 6
              : activeTab === 'jobs'
              ? 7
              : 3
          }
          onSelectStep={handleSelectPipelineStep}
        />

        {/* Main Grid: Sidebar Tabs + Workspace Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm space-y-1">
              {[
                { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
                { id: 'history', label: '1. Past Experience', icon: History },
                { id: 'target_role', label: '2. Target Role', icon: Target },
                { id: 'gap', label: '3. Skill Gap Analysis', icon: GitCompare },
                { id: 'assessments', label: '4. Practical Assessments', icon: GraduationCap },
                { id: 'evidence', label: '5. Current Evidence', icon: Sparkles },
                { id: 'profile', label: '6. Evidence Profile Dossier', icon: Award },
                { id: 'jobs', label: '7. Returnship Jobs Match', icon: Briefcase },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Readiness Index Card */}
            <ReadinessMeter
              score={metrics?.readinessScore || 75}
              totalSkills={metrics?.totalSkills || 8}
              verifiedSkills={metrics?.verifiedSkills || 5}
              evidenceCount={metrics?.verifiedEvidenceCount || 4}
            />
          </div>

          {/* Tab Content Panes */}
          <div className="lg:col-span-3 space-y-6">
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Re-entry Pipeline Summary */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold font-heading text-navy-900">
                        Evidence-Based Career Re-entry Plan
                      </h3>
                      <p className="text-xs text-slate-500">
                        Targeting {profileData?.targetRole} following a {profileData?.careerBreakYears}-year career pause.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                      {metrics?.readinessScore}% Re-entry Ready
                    </span>
                  </div>

                  {/* 3 Metric Mini Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Prior Experience</span>
                      <div className="text-xl font-extrabold text-navy-900 mt-1">
                        {profileData?.careerHistories?.length * 2.5 || 6}+ Years
                      </div>
                      <span className="text-[10px] text-slate-500">Across {profileData?.careerHistories?.length || 2} Tech Roles</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Verified Evidence</span>
                      <div className="text-xl font-extrabold text-emerald-600 mt-1">
                        {metrics?.verifiedEvidenceCount} Artifacts
                      </div>
                      <span className="text-[10px] text-slate-500">Avg Score: {metrics?.averageEvidenceScore}%</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Matched Opportunities</span>
                      <div className="text-xl font-extrabold text-brand-600 mt-1">
                        {matchedJobs.length} Returnships
                      </div>
                      <span className="text-[10px] text-slate-500">Direct Employer Programs</span>
                    </div>
                  </div>

                  {/* Recommended Action Roadmap */}
                  <div className="border-t border-slate-100 pt-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-brand-600" />
                      Priority Action Roadmap
                    </h4>

                    <div className="space-y-3">
                      {gapAnalysis?.suggestedRoadmap?.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4"
                        >
                          <div>
                            <span className="text-xs font-bold text-navy-900 block">{item.title}</span>
                            <span className="text-xs text-slate-600">{item.description}</span>
                          </div>
                          <button
                            onClick={() => {
                              if (item.action === 'TAKE_ASSESSMENT') setActiveTab('assessments');
                              else if (item.action === 'ADD_EVIDENCE') setActiveTab('evidence');
                              else setActiveTab('profile');
                            }}
                            className="px-3 py-1.5 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition-colors shrink-0"
                          >
                            Execute
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Verified Skills Matrix */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                    Current Skills Verification Status
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {profileData?.candidateSkills?.map((cs: any) => (
                      <div
                        key={cs.id}
                        className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                          cs.status === 'VERIFIED'
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                            : 'bg-amber-50/50 border-amber-200 text-amber-950'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold">{cs.skill.name}</span>
                          {cs.status === 'VERIFIED' ? (
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {cs.yearsExperience} yrs prior &bull; Rating: {cs.selfRating}/5
                        </div>
                        <div className="mt-2 text-[10px] font-bold uppercase tracking-wider">
                          {cs.status.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. PAST EXPERIENCE TAB */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold font-heading text-navy-900">
                        Past Experience & Career Timeline
                      </h3>
                      <p className="text-xs text-slate-500">
                        Document your roles prior to the career break to establish foundation tenure.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddHistoryModal(true)}
                      className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Past Role
                    </button>
                  </div>

                  <div className="space-y-4">
                    {profileData?.careerHistories?.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        No past roles added yet. Click "Add Past Role" to start building your foundation timeline.
                      </div>
                    ) : (
                      profileData?.careerHistories?.map((ch: any) => (
                        <div
                          key={ch.id}
                          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-start justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-navy-900">{ch.role}</h4>
                              <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                                {ch.company}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                              {ch.startDate} — {ch.endDate || 'Present'}
                            </span>
                            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                              {ch.description}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteHistory(ch.id)}
                            title="Delete Entry"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. TARGET ROLE TAB */}
            {activeTab === 'target_role' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold font-heading text-navy-900 mb-1">
                  Target Re-entry Role & Narrative
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Set the engineering role you are actively targeting. SkilBridge compares your skills against live market requirements for this position.
                </p>

                <form onSubmit={handleUpdateTargetRole} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Target Role Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={targetRoleForm.targetRole}
                        onChange={(e) => setTargetRoleForm({ ...targetRoleForm, targetRole: e.target.value })}
                        placeholder="e.g. Senior Frontend Engineer"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Career Break Duration (Years)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={targetRoleForm.careerBreakYears}
                        onChange={(e) => setTargetRoleForm({ ...targetRoleForm, careerBreakYears: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Preferred Location & Mode
                      </label>
                      <input
                        type="text"
                        value={targetRoleForm.location}
                        onChange={(e) => setTargetRoleForm({ ...targetRoleForm, location: e.target.value })}
                        placeholder="e.g. Bangalore, India (Remote / Hybrid)"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={targetRoleForm.phone}
                        onChange={(e) => setTargetRoleForm({ ...targetRoleForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Career Break Narrative (Reframing Statement)
                    </label>
                    <textarea
                      rows={3}
                      value={targetRoleForm.bio}
                      onChange={(e) => setTargetRoleForm({ ...targetRoleForm, bio: e.target.value })}
                      placeholder="e.g. Returning after family caregiving with refreshed modern full-stack skills..."
                      className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-colors"
                  >
                    Save Target Role Settings
                  </button>
                </form>
              </div>
            )}

            {/* 4. SKILL GAP ANALYSIS TAB */}
            {activeTab === 'gap' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold font-heading text-navy-900">
                        Intelligent Skill Gap Analysis
                      </h3>
                      <p className="text-xs text-slate-500">
                        Auditing past experience + {profileData?.careerBreakYears}-year career pause against current employer requirements.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddSkillModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Track New Skill
                    </button>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                      <span className="text-[10px] font-bold uppercase text-emerald-800">Verified Current</span>
                      <div className="text-2xl font-bold text-emerald-700">
                        {gapAnalysis?.summary?.verifiedCurrent || 0}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                      <span className="text-[10px] font-bold uppercase text-amber-800">Needs Refresh</span>
                      <div className="text-2xl font-bold text-amber-700">
                        {gapAnalysis?.summary?.needsRefresh || 0}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-center">
                      <span className="text-[10px] font-bold uppercase text-slate-600">Missing Gaps</span>
                      <div className="text-2xl font-bold text-slate-700">
                        {gapAnalysis?.summary?.missingGaps || 0}
                      </div>
                    </div>
                  </div>

                  {/* Skills Table */}
                  <div className="space-y-3">
                    {gapAnalysis?.skillsBreakdown?.map((item: any) => (
                      <div
                        key={item.skill}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-navy-900">{item.skill}</span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {item.category}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.gapStatus === 'VERIFIED_CURRENT'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.gapStatus === 'NEEDS_REFRESH'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {item.refreshPriority}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {item.recommendation}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.gapStatus !== 'VERIFIED_CURRENT' ? (
                            <button
                              onClick={() => {
                                const matchedAssessment = assessments.find((a) => a.skill === item.skill);
                                if (matchedAssessment) {
                                  setActiveAssessmentId(matchedAssessment.id);
                                } else {
                                  setActiveTab('assessments');
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors"
                            >
                              Take Assessment
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <ShieldCheck className="w-4 h-4" /> Badge Earned
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. PRACTICAL ASSESSMENTS TAB */}
            {activeTab === 'assessments' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold font-heading text-navy-900">
                      Practical Assessment Center
                    </h3>
                    <p className="text-xs text-slate-500">
                      Demonstrate 2026 production fluency through realistic, timed scenario-based evaluations.
                      Passing score (70%+) automatically generates a verified Evidence Badge.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {assessments.map((a) => {
                      const userSub = profileData?.submissions?.find((s: any) => s.assessmentId === a.id);
                      const isPassed = userSub?.status === 'PASSED';

                      return (
                        <div
                          key={a.id}
                          className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-brand-300 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                                {a.skill}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {a.timeLimitMinutes} Mins &bull; {a.difficulty}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-navy-900 mb-2 leading-snug">
                              {a.title}
                            </h4>

                            <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                              {a.description}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            {isPassed ? (
                              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                                <Award className="w-4 h-4" />
                                Passed ({userSub.score}%)
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500">Passing: {a.passingScore}%</span>
                            )}

                            <button
                              onClick={() => setActiveAssessmentId(a.id)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                isPassed
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                              }`}
                            >
                              {isPassed ? 'Retake Test' : 'Start Assessment'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 6. CURRENT EVIDENCE TAB */}
            {activeTab === 'evidence' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold font-heading text-navy-900">
                        Current Evidence Artifacts
                      </h3>
                      <p className="text-xs text-slate-500">
                        Tamper-evident portfolio items, verified assessment scores, and production repos.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddEvidenceModal(true)}
                      className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add Evidence Artifact
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profileData?.evidences?.map((ev: any) => (
                      <div
                        key={ev.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-navy-900">{ev.skill}</span>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Verified Score: {ev.score}%
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed mb-3">
                            {ev.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {ev.evidenceType.replace('_', ' ')}
                          </span>

                          <div className="flex items-center gap-2">
                            {ev.verificationUrl && (
                              <a
                                href={ev.verificationUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-600 hover:underline flex items-center gap-1 text-[11px] font-medium"
                              >
                                View Proof <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteEvidence(ev.id)}
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 7. EVIDENCE PROFILE DOSSIER TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                  {/* Shareable Banner */}
                  <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200/80 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-brand-900 block flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-brand-600" /> Shareable Verified Dossier
                      </span>
                      <span className="text-xs text-slate-600">
                        Employers can view your verified scorecards, code artifacts, and break story directly.
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleCopyShareLink}
                        className="flex-1 sm:flex-none px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-navy-900 transition-colors flex items-center justify-center gap-1.5"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedLink ? 'Copied' : 'Copy Link'}
                      </button>

                      <a
                        href={`/evidence/${profileData?.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 sm:flex-none px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Preview Dossier</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Dossier Preview Header */}
                  <div className="border-b border-slate-200 pb-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold font-heading text-navy-900">{user?.name}</h2>
                        <p className="text-sm text-brand-700 font-semibold">{evidenceProfile?.targetRole}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {evidenceProfile?.location}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {evidenceProfile?.careerBreakYears} Year Break</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-extrabold text-navy-900 font-heading">
                          {evidenceProfile?.overallReadinessScore}%
                        </div>
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Verified Readiness
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Break Narrative Quote */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      Reframing the Career Break
                    </span>
                    <p className="text-xs text-navy-900 italic leading-relaxed">
                      "{evidenceProfile?.gapNarrative}"
                    </p>
                  </div>

                  {/* Verified Badges Grid */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Verified Capabilities & Evidence
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {evidenceProfile?.evidenceBadges?.map((ev: any) => (
                        <div key={ev.id} className="p-3.5 rounded-xl border border-slate-200 bg-white">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-navy-900">{ev.skill}</span>
                            <span className="text-[11px] font-bold text-emerald-600">Score: {ev.score}%</span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">{ev.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 8. MATCHED JOBS TAB */}
            {activeTab === 'jobs' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold font-heading text-navy-900">
                      Target Role Job Matching
                    </h3>
                    <p className="text-xs text-slate-500">
                      Jobs scored automatically against your verified evidence profile. Share your profile directly with hiring managers in 1 click.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {matchedJobs.map((job) => (
                      <div
                        key={job.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-navy-900">{job.title}</h4>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {job.matchPercentage}% Evidence Match
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-brand-700">
                              <Building className="w-3.5 h-3.5" />
                              {job.employer?.companyName}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {job.location} ({job.workMode})
                            </span>
                            <span>{job.salaryRange}</span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {job.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {job.jobSkills?.map((js: any) => (
                              <span
                                key={js.id}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                  js.required
                                    ? 'bg-slate-100 text-slate-700 font-bold'
                                    : 'bg-slate-50 text-slate-500'
                                }`}
                              >
                                {js.skill.name} {js.required && '• Req'}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="shrink-0 flex sm:flex-col items-center gap-2 w-full sm:w-auto">
                          {job.isShared ? (
                            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Profile Shared
                            </div>
                          ) : (
                            <button
                              onClick={() => handleShareProfileWithEmployer(job.employerId)}
                              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Submit Evidence Profile
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Practical Assessment Modal */}
      {activeAssessmentId && (
        <AssessmentModal
          assessmentId={activeAssessmentId}
          onClose={() => setActiveAssessmentId(null)}
          onCompleted={() => {
            loadAllCandidateData();
          }}
        />
      )}

      {/* MODAL 2: Add Career History Modal */}
      {showAddHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-navy-900 mb-4">Add Prior Career Experience</h3>
            <form onSubmit={handleAddCareerHistory} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Company Name *</label>
                <input
                  type="text"
                  required
                  value={historyForm.company}
                  onChange={(e) => setHistoryForm({ ...historyForm, company: e.target.value })}
                  placeholder="e.g. Infosys / Wipro / Google"
                  className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Role Title *</label>
                <input
                  type="text"
                  required
                  value={historyForm.role}
                  onChange={(e) => setHistoryForm({ ...historyForm, role: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Start Date *</label>
                  <input
                    type="text"
                    required
                    value={historyForm.startDate}
                    onChange={(e) => setHistoryForm({ ...historyForm, startDate: e.target.value })}
                    placeholder="e.g. Jan 2017"
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">End Date</label>
                  <input
                    type="text"
                    value={historyForm.endDate}
                    onChange={(e) => setHistoryForm({ ...historyForm, endDate: e.target.value })}
                    placeholder="e.g. Jun 2021"
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Description & Responsibilities</label>
                <textarea
                  rows={3}
                  value={historyForm.description}
                  onChange={(e) => setHistoryForm({ ...historyForm, description: e.target.value })}
                  placeholder="Core projects, technologies, and achievements..."
                  className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddHistoryModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Evidence Modal */}
      {showAddEvidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-navy-900 mb-4">Attach Evidence Artifact</h3>
            <form onSubmit={handleAddEvidence} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Skill Validated *</label>
                <input
                  type="text"
                  required
                  value={evidenceForm.skill}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, skill: e.target.value })}
                  placeholder="e.g. React / TypeScript / Node.js"
                  className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Artifact Type</label>
                <select
                  value={evidenceForm.evidenceType}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, evidenceType: e.target.value })}
                  className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                >
                  <option value="GITHUB_PROJECT">GitHub Code Project</option>
                  <option value="PORTFOLIO_CASE_STUDY">Portfolio Case Study</option>
                  <option value="CERTIFICATION">Industry Certification</option>
                  <option value="ASSESSMENT_VERIFIED">Practical Evaluation</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Description of Work *</label>
                <textarea
                  rows={3}
                  required
                  value={evidenceForm.description}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, description: e.target.value })}
                  placeholder="Explain the modern tech stack, challenges solved, and testing done..."
                  className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Confidence Score %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={evidenceForm.score}
                    onChange={(e) => setEvidenceForm({ ...evidenceForm, score: e.target.value })}
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Proof / Repo URL</label>
                  <input
                    type="url"
                    value={evidenceForm.verificationUrl}
                    onChange={(e) => setEvidenceForm({ ...evidenceForm, verificationUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddEvidenceModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl"
                >
                  Save Artifact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Track Skill Modal */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-navy-900 mb-4">Track Skill in Audit</h3>
            <form onSubmit={handleAddSkill} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={skillForm.skillName}
                  onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
                  placeholder="e.g. Next.js / AWS / Docker"
                  className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                  className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Architecture">Architecture</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Prior Experience (Yrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={skillForm.yearsExperience}
                    onChange={(e) => setSkillForm({ ...skillForm, yearsExperience: e.target.value })}
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Self Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={skillForm.selfRating}
                    onChange={(e) => setSkillForm({ ...skillForm, selfRating: e.target.value })}
                    className="w-full mt-1 p-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl"
                >
                  Add Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
