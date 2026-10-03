import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Building, MapPin, Search, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/jobs');
        setJobs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.employer?.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Skills-First Returnships
          </span>
          <h1 className="text-3xl font-bold font-heading text-navy-900 mt-1">
            Return-to-Work Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Companies evaluating candidates based on verified skill evidence rather than career pauses.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 max-w-xl mx-auto">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title or company..."
            className="w-full text-xs sm:text-sm focus:outline-none"
          />
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Loading returnship jobs...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-heading text-navy-900">{job.title}</h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Open Returnship
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
                    <span>{job.experienceRequired}</span>
                    <span className="font-semibold text-navy-900">{job.salaryRange}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.jobSkills?.map((js: any) => (
                      <span
                        key={js.id}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          js.required
                            ? 'bg-brand-50 text-brand-800 font-bold border border-brand-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {js.skill.name} {js.required && '• Req'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 w-full md:w-auto">
                  {user?.role === 'CANDIDATE' ? (
                    <Link
                      to="/candidate/dashboard"
                      className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Apply with Evidence Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link
                      to="/auth/candidate/login"
                      className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Sign In to Apply</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
