import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, ExternalLink, ArrowRight, RefreshCw, Flame, Code, BookOpen, Bot, Zap, Target, CheckCircle, Layers, Video, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import { RoadmapStep } from '../types';

export const RoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [targetJob, setTargetJob] = useState('Python Developer');
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [overallFit, setOverallFit] = useState<string | null>(null);

  // AI Agent Role Generator State
  const [agentRole, setAgentRole] = useState('Python Developer');
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [generatingAgent, setGeneratingAgent] = useState(false);

  // Module Study Hub Modal State
  const [activeStudyStep, setActiveStudyStep] = useState<RoadmapStep | null>(null);
  const [checkedConcepts, setCheckedConcepts] = useState<Record<string, boolean>>({});

  const availableRolesList = [
    'Python Developer',
    'Java Developer',
    'Web Developer',
    'Data Analyst',
    'AI/ML Engineer',
    'Cloud Engineer',
    'Software Developer',
    'DevOps Engineer',
    'Fullstack Engineer',
  ];

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const res = await api.getRoadmap();
      setTargetJob(res.target_job);
      setSteps(res.steps);
      setAgentRole(res.target_job);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleGenerateAgentRoadmap = async (roleToGen: string) => {
    if (!roleToGen.trim()) return;
    setGeneratingAgent(true);
    try {
      await api.setPrimaryTargetJob(roleToGen.trim());
      const res = await api.generateAgentRoadmap(roleToGen.trim());
      setTargetJob(res.target_job);
      setSteps(res.steps);
      setOverallFit(res.overall_fit);
    } catch (err: any) {
      alert('Error generating roadmap: ' + err.message);
    } finally {
      setGeneratingAgent(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-indigo-400" /> AI Reskilling Roadmap
            </h1>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
              {targetJob}
            </span>
            {overallFit && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                {overallFit}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Personalized step-by-step learning path synthesized by AI Agent based on your chosen role & skill gaps.
          </p>
        </div>

        <button
          onClick={fetchRoadmap}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Default Roadmap
        </button>
      </div>

      {/* 🤖 AI Agent Personalized Roadmap Generator Control Panel */}
      <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-3xl space-y-5 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>AI Agent Roadmap Generator</span>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded">
                  Live Agent
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Select or type any target role to generate a personalized reskilling roadmap with tailored milestones & projects.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Role Badges */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 block">Choose Target Role for AI Agent:</label>
          <div className="flex flex-wrap gap-2">
            {availableRolesList.map((r) => {
              const isSelected = agentRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setAgentRole(r);
                    setCustomRoleInput('');
                    handleGenerateAgentRoadmap(r);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-indigo-500/50 hover:text-white'
                  }`}
                >
                  {isSelected ? `✓ ${r}` : r}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Role Input */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <div className="relative flex-1">
            <Target className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={customRoleInput}
              onChange={(e) => setCustomRoleInput(e.target.value)}
              placeholder="Or enter a custom role (e.g. Cybersecurity Specialist, ML Engineer)..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (customRoleInput.trim()) {
                    setAgentRole(customRoleInput.trim());
                    handleGenerateAgentRoadmap(customRoleInput.trim());
                  }
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="button"
            disabled={generatingAgent}
            onClick={() => {
              const rToGen = customRoleInput.trim() || agentRole;
              handleGenerateAgentRoadmap(rToGen);
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {generatingAgent ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI Agent Synthesizing...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Generate Personalized Roadmap</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading || generatingAgent ? (
        <div className="py-16 text-center text-indigo-400 font-semibold text-sm flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
          <span>Synthesizing custom learning roadmap for {agentRole}...</span>
        </div>
      ) : steps.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">No Roadmap Generated Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click the "Generate Personalized Roadmap" button above to launch the AI Agent for your target role.
          </p>
        </div>
      ) : (
        <div className="space-y-6 relative">
          {/* Vertical Timeline Bar */}
          <div className="hidden md:block absolute left-8 top-8 bottom-8 w-0.5 bg-slate-800" />

          {steps.map((step, idx) => {
            const isCompleted = step.status === 'Completed';
            const isInProgress = step.status === 'In Progress';

            return (
              <div key={idx} className="relative md:pl-16">
                {/* Node Icon */}
                <div
                  className={`hidden md:flex absolute left-4 -translate-x-1/2 top-6 w-8 h-8 rounded-full border-2 items-center justify-center text-xs font-bold z-10 ${
                    isCompleted
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : isInProgress
                      ? 'bg-indigo-600 border-indigo-400 text-white animate-bounce'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>

                {/* Step Card */}
                <div
                  className={`p-6 rounded-3xl border transition-all ${
                    isInProgress
                      ? 'bg-slate-900 border-indigo-500/50 shadow-xl shadow-indigo-500/10'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white">{step.skill}</h3>
                      <span
                        className={`text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded border ${
                          isCompleted
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : isInProgress
                            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" /> {step.estimated_time}
                      </span>
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Flame className="w-3.5 h-3.5" /> {step.priority} Priority
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Why It Matters</span>
                      <p className="text-slate-300 leading-relaxed">{step.why_it_matters}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Practice Project</span>
                      <p className="text-indigo-300 font-medium flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-indigo-400 shrink-0" /> {step.practice_project}
                      </p>
                    </div>
                  </div>

                  {/* Actions for this Roadmap Module */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Market Demand: <strong className="text-white">{step.demand_trend}</strong>
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setActiveStudyStep(step)}
                        className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-white" />
                        <span>Learn & Study Module</span>
                      </button>
                      <button
                        onClick={() => navigate(`/tests?tab=prep&module=${encodeURIComponent(step.skill)}`)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl inline-flex items-center gap-1.5 transition-all"
                      >
                        <Layers className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Practice Questions</span>
                      </button>
                      <button
                        onClick={() => navigate(`/tests?tab=test&module=${encodeURIComponent(step.skill)}`)}
                        className="px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600 text-indigo-300 hover:text-white font-semibold rounded-xl inline-flex items-center gap-1.5 transition-all"
                      >
                        <Zap className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Module Skill Test</span>
                      </button>
                      <button
                        onClick={() => navigate(`/tests?tab=interview&module=${encodeURIComponent(step.skill)}`)}
                        className="px-3 py-1.5 bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600 text-purple-300 hover:text-white font-semibold rounded-xl inline-flex items-center gap-1.5 transition-all"
                      >
                        <Video className="w-3.5 h-3.5 text-purple-400" />
                        <span>Mock Interview</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Milestone Verification */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <div>
              <h4 className="font-bold text-white text-sm">Completed your roadmap milestone for {targetJob}?</h4>
              <p className="text-xs text-slate-400">Take your milestone skill test to verify your skills and advance to the next step.</p>
            </div>
            <button
              onClick={() => navigate('/tests')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <BookOpen className="w-4 h-4 text-white" />
              <span>Skill Test</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* 📖 MODULE STUDY HUB MODAL */}
      {activeStudyStep && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setActiveStudyStep(null)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-bold text-sm"
            >
              ✕
            </button>

            {/* Header */}
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded">
                  {targetJob} Module Study Hub
                </span>
                <span className="text-xs text-slate-400">Est. Duration: {activeStudyStep.estimated_time}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-400" />
                <span>{activeStudyStep.skill}</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeStudyStep.learning_guide || activeStudyStep.why_it_matters}
              </p>
            </div>

            {/* Sub-Skills Checklist */}
            <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" /> Key Concepts & Sub-Skills to Master
              </h4>
              <div className="space-y-2">
                {(activeStudyStep.key_concepts || [
                  `${activeStudyStep.skill} core syntax & fundamentals`,
                  `Implementing ${activeStudyStep.skill} in production ${targetJob} services`,
                  `Performance optimization & error handling`,
                  `Automated unit tests & CI/CD pipeline integration`
                ]).map((concept, cIdx) => {
                  const isChecked = !!checkedConcepts[`${activeStudyStep.skill}-${cIdx}`];
                  return (
                    <div
                      key={cIdx}
                      onClick={() =>
                        setCheckedConcepts((prev) => ({
                          ...prev,
                          [`${activeStudyStep.skill}-${cIdx}`]: !prev[`${activeStudyStep.skill}-${cIdx}`],
                        }))
                      }
                      className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 accent-emerald-500 rounded"
                      />
                      <span className="text-xs font-medium leading-relaxed">{concept}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Curated Resources */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-indigo-400" /> Official Documentation & Learning Resources
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={activeStudyStep.official_docs_url || activeStudyStep.resource_link || 'https://docs.python.org/3/'}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl flex items-center justify-between text-xs text-indigo-300 font-semibold transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" /> Official Documentation
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                </a>

                <a
                  href={`https://coursera.org/search?query=${encodeURIComponent(activeStudyStep.skill)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-xl flex items-center justify-between text-xs text-indigo-300 font-semibold transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Interactive Courses
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                </a>
              </div>
            </div>

            {/* Practice Project Assignment */}
            <div className="p-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl space-y-1.5">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-indigo-400" /> Hands-On Practice Assignment:
              </span>
              <p className="text-xs text-white font-medium">{activeStudyStep.practice_project}</p>
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setActiveStudyStep(null)}
                className="text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close Hub
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const sk = activeStudyStep.skill;
                    setActiveStudyStep(null);
                    navigate(`/tests?tab=prep&module=${encodeURIComponent(sk)}`);
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" /> Practice Questions
                </button>
                <button
                  onClick={() => {
                    const sk = activeStudyStep.skill;
                    setActiveStudyStep(null);
                    navigate(`/tests?tab=test&module=${encodeURIComponent(sk)}`);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-200" /> Take Skill Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
