import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  BookOpen,
  MessageSquare,
  Compass,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  ChevronDown,
  MapPin,
  Send,
  Radio,
  Upload,
} from 'lucide-react';
import { Profile } from '../types';
import { useDashboardData } from '../hooks/useDashboardData';

interface DashboardPageProps {
  userProfile: Profile | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ userProfile }) => {
  const navigate = useNavigate();
  const {
    loading,
    error,
    readiness,
    skillGap,
    targetJobs,
    testHistory,
    lastSynced,
    promptLoading,
    switchTargetJob,
    submitDataPrompt,
  } = useDashboardData();

  const [showJobSelector, setShowJobSelector] = useState(false);
  const [dataPromptInput, setDataPromptInput] = useState('');
  const [simulatedTest, setSimulatedTest] = useState<number>(0);
  const [simulatedInterview, setSimulatedInterview] = useState<number>(0);

  const selectedJob = readiness?.target_job || 'Python Developer';
  const testScoreObj = readiness?.components.find((c) => c.category === 'Technical Test');
  const interviewScoreObj = readiness?.components.find((c) => c.category === 'Interview');
  const testScore = testScoreObj ? testScoreObj.score : 0;
  const interviewScore = interviewScoreObj ? interviewScoreObj.score : 0;

  useEffect(() => {
    setSimulatedTest(testScore);
    setSimulatedInterview(interviewScore);
  }, [testScore, interviewScore]);

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataPromptInput.trim()) return;
    await submitDataPrompt(dataPromptInput);
    setDataPromptInput('');
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-indigo-400 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Synchronizing Real-Time Career Intelligence...</span>
        </div>
      </div>
    );
  }

  const readinessScore = readiness?.overall_readiness ?? 0;
  const gapScore = skillGap?.gap_score ?? 0;
  const skillsToImprove = readiness?.top_skills_to_improve && readiness.top_skills_to_improve.length > 0
    ? readiness.top_skills_to_improve
    : (skillGap?.missing_skills || []);

  const skillsCompScore = readiness?.components.find((c) => c.category === 'Skills')?.score || 0;
  const projectsCompScore = readiness?.components.find((c) => c.category === 'Projects')?.score || 0;
  const expCompScore = readiness?.components.find((c) => c.category === 'Experience')?.score || 0;
  const eduCompScore = readiness?.components.find((c) => c.category === 'Education')?.score || 0;

  const projectedReadiness = Math.min(
    100,
    Math.round(
      skillsCompScore * 0.35 +
        simulatedTest * 0.2 +
        simulatedInterview * 0.15 +
        projectsCompScore * 0.15 +
        expCompScore * 0.1 +
        eduCompScore * 0.05
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Greeting & Target Job Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hello, {userProfile?.full_name || 'Candidate'} 👋
            </h1>
            {/* Live Synchronization Status Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-mono font-semibold shadow-sm">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>● Live</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 font-normal">Last synced: {lastSynced}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track your skills, test performance, and reskilling roadmap in real-time.
          </p>
        </div>

        {/* Target Job Badge */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="text-[11px] text-slate-400 font-medium mb-1 hidden sm:block">Target Job</div>
            <button
              onClick={() => setShowJobSelector(!showJobSelector)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 border border-indigo-500/40 hover:border-indigo-500 text-indigo-300 font-bold rounded-xl text-xs shadow-md transition-all"
            >
              <Target className="w-4 h-4 text-indigo-400" />
              <span>{selectedJob}</span>
              <ChevronDown className="w-4 h-4 text-indigo-400 ml-1" />
            </button>

            {showJobSelector && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
                <div className="text-[10px] uppercase font-extrabold text-slate-500 px-3 py-1.5">
                  Switch Target Job
                </div>
                {targetJobs.map((j) => (
                  <button
                    key={j.job_title}
                    onClick={() => {
                      switchTargetJob(j.job_title);
                      setShowJobSelector(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                      selectedJob === j.job_title
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{j.job_title}</span>
                    {j.is_primary && <span className="text-[10px] opacity-80">Primary</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main 4 Metric Cards - 100% Interactive to User Clicks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Job Readiness */}
        <div
          onClick={() => navigate('/radar')}
          className="glass-card p-5 rounded-2xl border-l-4 border-l-indigo-500 cursor-pointer hover:scale-[1.02] hover:border-indigo-500/60 transition-all group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-indigo-300 transition-colors">
              Job Readiness
            </span>
            <Target className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{readinessScore}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${readinessScore}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Target Role Match</span>
            <span className="text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
              Radar →
            </span>
          </p>
        </div>

        {/* Card 2: Skill Gap */}
        <div
          onClick={() => navigate('/skills')}
          className="glass-card p-5 rounded-2xl border-l-4 border-l-amber-500 cursor-pointer hover:scale-[1.02] hover:border-amber-500/60 transition-all group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-amber-300 transition-colors">
              Skill Gap
            </span>
            <TrendingUp className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{gapScore}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${gapScore}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>{skillGap?.gap_level || 'Evaluated'} Level</span>
            <span className="text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform">
              Manage →
            </span>
          </p>
        </div>

        {/* Card 3: Test Score */}
        <div
          onClick={() => navigate('/tests')}
          className="glass-card p-5 rounded-2xl border-l-4 border-l-emerald-500 cursor-pointer hover:scale-[1.02] hover:border-emerald-500/60 transition-all group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-emerald-300 transition-colors">
              Test Score
            </span>
            <BookOpen className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{testScore}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${testScore}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>{testScore > 0 ? 'Technical MCQ Score' : 'Unattempted'}</span>
            <span className="text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
              Take Test →
            </span>
          </p>
        </div>

        {/* Card 4: Interview */}
        <div
          onClick={() => navigate('/tests')}
          className="glass-card p-5 rounded-2xl border-l-4 border-l-purple-500 cursor-pointer hover:scale-[1.02] hover:border-purple-500/60 transition-all group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-purple-300 transition-colors">
              Interview
            </span>
            <MessageSquare className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{interviewScore}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${interviewScore}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>{interviewScore > 0 ? 'AI Mock Interview Score' : 'Unattempted'}</span>
            <span className="text-purple-400 font-semibold group-hover:translate-x-0.5 transition-transform">
              Start Mock →
            </span>
          </p>
        </div>
      </div>
      {/* Core Questions Answered Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Skills to Improve */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" /> Top Skills to Improve
          </h3>
          {skillsToImprove.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {skillsToImprove.slice(0, 3).map((sk, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate('/roadmap')}
                  className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-all group"
                >
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                      {sk}
                    </div>
                    <div className="text-[10px] text-amber-400 mt-0.5 font-medium flex items-center gap-1">
                      <span>Missing Requirement</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-slate-500">#{idx + 1}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400">
              All primary skill requirements for {selectedJob} are currently fulfilled!
            </div>
          )}

          {readiness?.explanation && (
            <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-xs text-slate-300 leading-relaxed flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">AI Engine Analysis</span>
                {readiness.explanation}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3 flex flex-col justify-center">
          <h3 className="text-base font-bold text-white mb-1">Recommended Next Actions</h3>

          <button
            onClick={() => navigate('/tests')}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Take Skill Test</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate('/tests')}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span>AI Mock Interview</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate('/roadmap')}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-2xl flex items-center justify-between transition-all shadow-lg shadow-indigo-600/20"
          >
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-white" />
              <span>View Reskilling Roadmap</span>
            </div>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>

          <button
            onClick={() => navigate('/radar')}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>Explore Workforce Radar Map</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Recent Assessment Test History Section */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" /> Recent Assessment Test History
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live record of your completed technical MCQ assessments and verified skills.
            </p>
          </div>
          <button
            onClick={() => navigate('/tests')}
            className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded-xl hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <span>Take New Test</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {testHistory.length > 0 ? (
          <div className="space-y-3">
            {testHistory.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{item.target_job} Assessment</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Score: {item.score_percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Correct Answers: {item.correct_answers} / {item.total_questions} • Completed {item.completed_at}
                  </p>
                  {item.strong_skills && item.strong_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-500 font-semibold self-center">Verified Skills:</span>
                      {item.strong_skills.map((sk: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded"
                        >
                          ✓ {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate('/tests')}
                  className="self-start sm:self-center text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Retake →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-2">
            <p className="text-xs text-slate-400">No technical assessment tests completed yet for your account.</p>
            <button
              onClick={() => navigate('/tests')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-block"
            >
              Take Your First Test Now
            </button>
          </div>
        )}
      </div>

      {/* Transparent Job Readiness Engine Component Breakdown */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white">Transparent Job Readiness Engine</h3>
            <p className="text-xs text-slate-400">
              Weighted component breakdown comparing your profile against {selectedJob} requirements.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30">
            Overall: {readinessScore}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {readiness?.components.map((comp, idx) => {
            const targetPath =
              comp.category === 'Technical Test' || comp.category === 'Interview'
                ? '/tests'
                : '/skills';
            return (
              <div
                key={idx}
                onClick={() => navigate(targetPath)}
                className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-3.5 rounded-2xl text-center cursor-pointer hover:scale-[1.03] transition-all group"
              >
                <span className="text-[11px] font-semibold text-slate-400 group-hover:text-indigo-300 transition-colors block truncate">
                  {comp.category}
                </span>
                <div className="text-xl font-extrabold text-white mt-1">{comp.score}%</div>
                <span className="text-[10px] text-indigo-400 font-bold block mt-1">Weight: {comp.weight}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
