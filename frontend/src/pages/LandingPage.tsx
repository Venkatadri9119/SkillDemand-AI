import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Cpu, Target, Compass, BookOpen, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { getAuthToken } from '../services/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const flowSteps = [
    { name: 'Profile', icon: User, desc: 'Setup Profile' },
    { name: 'Skills', icon: Cpu, desc: 'Skill Audit' },
    { name: 'Readiness', icon: Target, desc: 'Weighted Score' },
    { name: 'Assessment', icon: BookOpen, desc: 'MCQ & AI Interview' },
    { name: 'Roadmap', icon: Compass, desc: 'Reskilling Steps' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto pt-8 pb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-6">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Next-Gen Career Intelligence Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          AI Workforce Gap Radar
        </h1>

        <p className="text-xl sm:text-2xl font-semibold text-indigo-400 mt-3 tracking-wide">
          Know what skills you need before the job market changes.
        </p>

        <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          An AI-powered platform that analyzes your skills, measures job readiness, identifies skill gaps, creates a personalized learning roadmap, and prepares you for career growth.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {getAuthToken() ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/auth?tab=register')}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/auth?tab=login')}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all text-center"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>

      {/* Visual Flow */}
      <div className="py-10 border-y border-slate-800/80 my-8">
        <h3 className="text-center text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-8">
          The Career Readiness Journey
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {flowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-indigo-400 mb-3 shadow-lg group hover:border-indigo-500 transition-colors">
                  <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </div>
                <span className="font-bold text-sm text-white">{step.name}</span>
                <span className="text-[11px] text-slate-400 mt-0.5">{step.desc}</span>

                {idx < flowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-7 -right-6 text-slate-600">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Principle Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto py-6">
        <div className="glass-card p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-base">Complex AI, Simple Interface</h4>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Sophisticated NLP and weighted scoring engine translated into clear cards, simple navigation, and obvious next steps.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3">
            <Target className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-base">Transparent Readiness Score</h4>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            See exactly how skills, tests, projects, experience, and interview scores contribute to your job readiness.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-base">AI Reskilling Roadmap</h4>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Tailored learning path with priority levels, estimated timeline, resources, and practice projects.
          </p>
        </div>
      </div>
    </div>
  );
};
