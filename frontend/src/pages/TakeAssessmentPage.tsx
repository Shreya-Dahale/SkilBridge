import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AssessmentModal } from '../components/AssessmentModal';
import {
  GraduationCap,
  ShieldCheck,
  Award,
  Clock,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const TakeAssessmentPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalId, setActiveModalId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/assessments');
        setAssessments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  const handleStartTest = (id: string) => {
    if (!user) {
      navigate('/auth/candidate/login');
      return;
    }
    if (user.role !== 'CANDIDATE') {
      alert('Only candidates can take practical assessments.');
      return;
    }
    setActiveModalId(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-3 border border-brand-200">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Interactive Skills Evaluation</span>
          </div>
          <h1 className="text-3xl font-bold font-heading text-navy-900">
            Practical Technical Assessments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Validate current technical fluency with realistic scenarios, code questions, and system design challenges.
            Achieving 70%+ automatically generates a verified evidence badge for your profile.
          </p>
        </div>

        {/* Assessments Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Loading practical assessments catalog...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-brand-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                      {a.skill}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {a.difficulty} Level
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-heading text-navy-900 mb-2 leading-snug">
                    {a.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {a.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-500 mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <span>Time Limit:</span>
                      <strong className="text-navy-900">{a.timeLimitMinutes} Minutes</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Passing Threshold:</span>
                      <strong className="text-emerald-600">{a.passingScore}%</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Verified Evidence Badge:</span>
                      <strong className="text-brand-600">Auto-issued on pass</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleStartTest(a.id)}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{user?.role === 'CANDIDATE' ? 'Begin Assessment' : 'Sign In to Start'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeModalId && (
        <AssessmentModal
          assessmentId={activeModalId}
          onClose={() => setActiveModalId(null)}
          onCompleted={() => {
            navigate('/candidate/dashboard');
          }}
        />
      )}
    </div>
  );
};
