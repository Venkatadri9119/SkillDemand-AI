import React, { useState, useEffect } from 'react';
import { Briefcase, ExternalLink, Search, Check, AlertCircle, MapPin, DollarSign, RefreshCw, Building2 } from 'lucide-react';
import { api } from '../services/api';
import { Job } from '../types';

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [remoteFilter, setRemoteFilter] = useState('All');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.getJobs(searchTerm, remoteFilter);
      setJobs(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchTerm, remoteFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-indigo-400" /> Active Real-World Job Openings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Verified job openings from global tech employers, matched directly to your career readiness.
          </p>
        </div>

        {/* Minimal Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, company..."
              className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={remoteFilter}
            onChange={(e) => setRemoteFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Workplace Types</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
            <option value="On-site">On-site</option>
          </select>
        </div>
      </div>

      {/* Jobs Feed */}
      {loading ? (
        <div className="py-12 text-center text-indigo-400 font-semibold text-sm flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" /> Fetching live verified job postings...
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          No jobs found matching your filters.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 p-6 rounded-3xl transition-all space-y-4 shadow-xl"
            >
              {/* Job Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{job.title}</h3>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-indigo-400" /> Official Employer
                    </span>
                  </div>
                  <p className="text-xs text-indigo-400 font-bold mt-1">{job.company}</p>
                </div>

                {/* Match Percentage Badge */}
                <div className="flex items-center gap-2">
                  <div className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-sm rounded-xl">
                    {job.match_percentage}% Profile Match
                  </div>
                </div>
              </div>

              {/* Job Details Meta */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" /> {job.experience_required}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500" /> {job.salary_range}
                </span>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px] font-semibold">
                  {job.remote_type}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{job.description}</p>

              {/* Matching & Missing Skills Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Matching Skills */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mb-2">
                    <Check className="w-3.5 h-3.5" /> Matched Skills ({job.matching_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.matching_skills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded"
                      >
                        ✓ {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 mb-2">
                    <AlertCircle className="w-3.5 h-3.5" /> Missing Requirements ({job.missing_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.missing_skills.length > 0 ? (
                      job.missing_skills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded"
                        >
                          Missing: {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400">All required skills matched!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Real Apply Button (Official Employer Careers Page) */}
              <div className="pt-2 flex justify-end">
                <a
                  href={job.original_apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-transform hover:scale-105"
                >
                  <span>Apply on Official Company Website</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
