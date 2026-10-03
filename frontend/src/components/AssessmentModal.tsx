import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronRight,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
}

interface AssessmentDetails {
  id: string;
  title: string;
  description: string;
  skill: string;
  difficulty: string;
  timeLimitMinutes: number;
  passingScore: number;
  questions: Question[];
}

interface AssessmentModalProps {
  assessmentId: string;
  onClose: () => void;
  onCompleted?: () => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  assessmentId,
  onClose,
  onCompleted,
}) => {
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<AssessmentDetails | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(20 * 60);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const data = await apiRequest<AssessmentDetails>(`/assessments/${assessmentId}`);
        setAssessment(data);
        setTimeLeftSeconds((data.timeLimitMinutes || 20) * 60);
      } catch (err: any) {
        setError(err.message || 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [assessmentId]);

  // Timer countdown
  useEffect(() => {
    if (!result && timeLeftSeconds > 0) {
      const timer = setInterval(() => {
        setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [result, timeLeftSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectOption = (qId: string, optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await apiRequest(`/assessments/${assessment.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
      setResult(res);
      if (onCompleted) {
        onCompleted();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit assessment answers');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-bold text-navy-900">Loading Assessment...</h3>
          <p className="text-xs text-slate-500 mt-1">Preparing verified questions and scoring rubrics.</p>
        </div>
      </div>
    );
  }

  if (error && !assessment) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-3">
            <AlertCircle className="w-6 h-6" />
            <h3 className="font-bold">Error Loading Assessment</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const questions = assessment?.questions || [];
  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-500 text-white">
                {assessment?.skill}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {assessment?.difficulty} Level
              </span>
            </div>
            <h3 className="text-lg font-bold font-heading">{assessment?.title}</h3>
          </div>

          <div className="flex items-center gap-4">
            {!result && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-mono text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(timeLeftSeconds)}
              </div>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {result ? (
            /* Result Screen */
            <div className="space-y-6">
              <div
                className={`p-6 rounded-2xl text-center border ${
                  result.passed
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50/80 border-amber-200 text-amber-900'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
                    result.passed ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                  }`}
                >
                  {result.passed ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                </div>

                <h4 className="text-xl font-bold font-heading">
                  {result.passed ? 'Assessment Passed with Verified Badge!' : 'Assessment Completed'}
                </h4>

                <div className="text-3xl font-extrabold font-heading my-2">
                  {result.score}%
                </div>

                <p className="text-xs max-w-md mx-auto leading-relaxed">
                  {result.feedback}
                </p>

                {result.evidence && (
                  <div className="mt-4 inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-emerald-300 text-xs font-semibold text-emerald-800 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    New Verified Evidence Badge Generated & Synced
                  </div>
                )}
              </div>

              {/* Question Review List */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Question Breakdown & Answers
                </h5>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {result.review?.map((rev: any, i: number) => (
                    <div
                      key={rev.id || i}
                      className={`p-3.5 rounded-xl border text-xs ${
                        rev.isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-red-50/40 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-navy-900">
                          Q{i + 1}: {rev.question}
                        </span>
                        {rev.isCorrect ? (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-red-600 flex items-center gap-1 shrink-0">
                            <AlertCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-slate-600 space-y-0.5">
                        <div>Your answer: <span className="font-medium text-slate-800">{rev.userAnswer}</span></div>
                        {!rev.isCorrect && (
                          <div>Correct answer: <span className="font-medium text-emerald-700">{rev.correctAnswer}</span></div>
                        )}
                      </div>
                      <div className="mt-1.5 text-[11px] text-slate-500 italic bg-white/70 p-2 rounded">
                        💡 {rev.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-200">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* Active Test Taking Screen */
            <div>
              {/* Question Stepper */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span>
                  Question <strong className="text-navy-900">{currentIdx + 1}</strong> of {questions.length}
                </span>
                <span>
                  {answeredCount} of {questions.length} Answered
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6">
                <div
                  className="bg-brand-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                ></div>
              </div>

              {/* Question Text */}
              {currentQ && (
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-navy-900 leading-snug mb-5">
                    {currentQ.question}
                  </h4>

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQ.options.map((option, optIdx) => {
                      const isSelected = answers[currentQ.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(currentQ.id, optIdx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-brand-50 border-brand-600 text-brand-900 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <span className="leading-relaxed">{option}</span>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                              isSelected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Stepper Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {currentIdx < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                    >
                      Next Question
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      disabled={submitting}
                      onClick={handleSubmit}
                      className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {submitting ? 'Grading Answers...' : 'Submit Assessment'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
