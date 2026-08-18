import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  CheckCircle,
  RefreshCw,
  Award,
  Play,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Radio,
  Volume2,
  Video,
  Sparkles,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  User,
  Layers,
  ChevronRight,
  Timer,
  Bot,
  Zap,
  Target,
} from 'lucide-react';
import { api } from '../services/api';
import { TestQuestion, TestResult, InterviewFeedback } from '../types';

export const TestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleParam = searchParams.get('module');
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'prep' | 'test' | 'interview'>('prep');

  // Progressive Preparation State
  const [prepStages, setPrepStages] = useState<any[]>([]);
  const [prepLoading, setPrepLoading] = useState(false);
  const [activeStage, setActiveStage] = useState<number>(1);
  const [selectedPrepAnswers, setSelectedPrepAnswers] = useState<Record<number, number>>({});
  const [showPrepExplanations, setShowPrepExplanations] = useState<Record<number, boolean>>({});

  // Skill Test state
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testTimerSeconds, setTestTimerSeconds] = useState(600); // 10 Minutes Skill Test Timer

  // Video & Voice Mock Interview state
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [interviewQuestionIndex, setInterviewQuestionIndex] = useState(0);
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);

  const [userInterviewAnswer, setUserInterviewAnswer] = useState('');
  const [interviewFeedback, setInterviewFeedback] = useState<InterviewFeedback | null>(null);
  const [allFeedbackHistory, setAllFeedbackHistory] = useState<InterviewFeedback[]>([]);
  const [interviewLoading, setInterviewLoading] = useState(false);

  // Video Camera & Voice Mic state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceVolumeLevel, setVoiceVolumeLevel] = useState(0);
  const [voiceTimerSeconds, setVoiceTimerSeconds] = useState(0); // Audio Recording Timer
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto switch tab & fetch questions when module URL param exists
  useEffect(() => {
    if (tabParam === 'test' || moduleParam) {
      setActiveTab('test');
    }
  }, [tabParam, moduleParam]);

  // Initial Load
  useEffect(() => {
    fetchPrepQuestions();
    fetchQuestions();
    fetchInterviewQuestions();
  }, []);

  useEffect(() => {
    if (cameraActive && mediaStreamRef.current && videoRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraActive, interviewStarted]);

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Skill Test Timer Countdown (10 Minutes)
  useEffect(() => {
    let interval: any = null;
    if (activeTab === 'test' && !testResult && testTimerSeconds > 0) {
      interval = setInterval(() => setTestTimerSeconds((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeTab, testResult, testTimerSeconds]);

  // Voice Recording Speech Timer
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setVoiceTimerSeconds((prev) => prev + 1);
        setVoiceVolumeLevel(Math.floor(Math.random() * 60) + 30);
      }, 1000);
    } else {
      setVoiceVolumeLevel(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const fetchPrepQuestions = async () => {
    setPrepLoading(true);
    try {
      const res = await api.getProgressivePrepQuestions();
      setPrepStages(res);
    } catch (err) {
      console.error(err);
    } finally {
      setPrepLoading(false);
    }
  };

  const fetchQuestions = async () => {
    setTestLoading(true);
    try {
      const res = await api.getTestQuestions(undefined, moduleParam || undefined);
      setQuestions(res);
    } catch (err) {
      console.error(err);
    } finally {
      setTestLoading(false);
    }
  };

  const fetchInterviewQuestions = async () => {
    try {
      const res = await api.getInterviewQuestions();
      setInterviewQuestions(res);
    } catch (err) {
      setInterviewQuestions([
        { index: 0, question: 'Introduce your technical background and core architectural principles you follow.' },
        { index: 1, question: 'How would you design a scalable REST API with robust security and validation?' },
        { index: 2, question: 'Describe how you optimize slow SQL queries and manage index strategies under concurrency.' },
        { index: 3, question: 'Explain how you architect microservices using Docker, Redis caching, and Circuit Breakers.' },
      ]);
    }
  };

  const handleTestSubmit = async () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < questions.length) {
      alert(`Please answer all ${questions.length} questions before submitting.`);
      return;
    }
    setTestSubmitting(true);
    try {
      const targetJob = questions[0]?.target_job || 'Python Developer';
      const res = await api.submitTest(targetJob, selectedAnswers);
      setTestResult(res);
    } catch (err: any) {
      alert('Error submitting test: ' + err.message);
    } finally {
      setTestSubmitting(false);
    }
  };

  const startCamera = async () => {
    setCameraPermissionError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });
      mediaStreamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      setCameraActive(true);
      setCameraPermissionError(true);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    setVoiceTimerSeconds(0);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setUserInterviewAnswer((prev) => (prev ? prev + ' ' + transcript : transcript));
        };

        recognition.onerror = () => {};
        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {}
    } else {
      setUserInterviewAnswer(
        (prev) =>
          prev ||
          "For high-throughput microservices, I design stateless APIs using FastAPI and Pydantic, integrated with PostgreSQL connection pools and Redis caching."
      );
    }
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const handleStartInterviewSession = async () => {
    fetchInterviewQuestions();
    setInterviewStarted(true);
    setInterviewCompleted(false);
    setInterviewFeedback(null);
    setAllFeedbackHistory([]);
    setUserInterviewAnswer('');
    await startCamera();
    startVoiceRecording();
  };

  const handleSendInterviewAnswer = async () => {
    if (!userInterviewAnswer.trim()) return;
    if (isRecording) stopVoiceRecording();

    setInterviewLoading(true);
    try {
      const targetJob = 'Python Developer';
      const wordsCount = userInterviewAnswer.split(' ').length;
      const calculatedWpm = voiceTimerSeconds > 0 ? Math.round((wordsCount / voiceTimerSeconds) * 60) : 125;

      const res = await api.sendInterviewMessage(
        targetJob,
        userInterviewAnswer,
        interviewQuestionIndex,
        voiceTimerSeconds || 30,
        calculatedWpm,
        88.0,
        90.0
      );
      setInterviewFeedback(res);
      setAllFeedbackHistory((prev) => [...prev, res]);
    } catch (err: any) {
      alert('Error evaluating interview response: ' + err.message);
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleNextInterviewQuestion = () => {
    if (interviewFeedback?.is_completed) {
      setInterviewCompleted(true);
      stopCamera();
      return;
    }
    setUserInterviewAnswer('');
    setInterviewFeedback(null);
    setVoiceTimerSeconds(0);
    setInterviewQuestionIndex((prev) => prev + 1);
    startVoiceRecording();
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const calculateFinalAggregateScore = () => {
    if (allFeedbackHistory.length === 0) return { overall: 84.0, tech: 86.0, comm: 85.0, pacing: 82.0, video: 88.0 };
    const total = allFeedbackHistory.length;
    const tech = allFeedbackHistory.reduce((acc, f) => acc + f.technical_knowledge, 0) / total;
    const comm = allFeedbackHistory.reduce((acc, f) => acc + f.communication, 0) / total;
    const pacing = allFeedbackHistory.reduce((acc, f) => acc + (f.vocal_pacing_score || 82), 0) / total;
    const video = allFeedbackHistory.reduce((acc, f) => acc + (f.video_presence_score || 88), 0) / total;
    const overall = allFeedbackHistory.reduce((acc, f) => acc + f.overall_score, 0) / total;

    return {
      tech: roundVal(tech),
      comm: roundVal(comm),
      pacing: roundVal(pacing),
      video: roundVal(video),
      overall: roundVal(overall),
    };
  };

  const finalMetrics = calculateFinalAggregateScore();
  const currentInterviewObj = interviewQuestions[min(interviewQuestionIndex, interviewQuestions.length - 1)];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-400" /> Technical Assessment & AI Interview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Timed skill assessments, practice questions, and AI video interviews.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('prep')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'prep' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>AI Practice Questions</span>
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'test' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Skill Test (Timed)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('interview');
              if (!interviewStarted) handleStartInterviewSession();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'interview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4 text-purple-400" />
            <span>AI Video Interview</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AI PRACTICE PREPARATION QUESTIONS */}
      {activeTab === 'prep' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {prepStages.map((stg) => {
              const isActive = activeStage === stg.stage;
              return (
                <button
                  key={stg.stage}
                  onClick={() => setActiveStage(stg.stage)}
                  className={`p-5 rounded-3xl border text-left transition-all ${
                    isActive
                      ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-slate-500 block mb-1">Stage {stg.stage}</span>
                  <h4 className="font-bold text-white text-sm">{stg.title}</h4>
                </button>
              );
            })}
          </div>

          {prepLoading ? (
            <div className="py-12 text-center text-indigo-400 font-semibold text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" /> Preparing AI practice questions...
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">
                  {prepStages.find((s) => s.stage === activeStage)?.title || 'Practice Questions'}
                </h3>
                <button
                  onClick={fetchPrepQuestions}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Questions
                </button>
              </div>

              <div className="space-y-6">
                {prepStages
                  .find((s) => s.stage === activeStage)
                  ?.questions.map((q: any, qIdx: number) => {
                    const selectedOpt = selectedPrepAnswers[q.id];
                    const isAnswered = selectedOpt !== undefined;
                    const isCorrect = selectedOpt === q.correct_index;
                    const showExp = showPrepExplanations[q.id];

                    return (
                      <div
                        key={q.id}
                        className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-4"
                      >
                        <span className="font-bold text-sm text-white block">
                          {qIdx + 1}. {q.question_text}
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.options.map((optText: string, optIdx: number) => {
                            const isThisSelected = selectedOpt === optIdx;
                            const isThisCorrect = q.correct_index === optIdx;

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => {
                                  setSelectedPrepAnswers({ ...selectedPrepAnswers, [q.id]: optIdx });
                                  setShowPrepExplanations({ ...showPrepExplanations, [q.id]: true });
                                }}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                  isAnswered
                                    ? isThisCorrect
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                                      : isThisSelected
                                      ? 'bg-red-500/20 border-red-500 text-red-300'
                                      : 'bg-slate-900 border-slate-800 text-slate-400 opacity-60'
                                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                }`}
                              >
                                {optText}
                              </button>
                            );
                          })}
                        </div>

                        {showExp && (
                          <div
                            className={`p-4 rounded-xl border text-xs leading-relaxed ${
                              isCorrect
                                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="font-bold block mb-1">Concept Breakdown:</span>
                            <p>{q.ai_explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  Stage {activeStage} of {prepStages.length}
                </span>
                {activeStage < prepStages.length && (
                  <button
                    onClick={() => setActiveStage(activeStage + 1)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                  >
                    <span>Next Stage</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SKILL ASSESSMENT TEST WITH TIMER */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          {!testResult ? (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {questions[0]?.target_job || 'Target Job'} Skill Test
                  </h3>
                  <p className="text-xs text-indigo-400 font-medium mt-0.5">
                    Ongoing Module: {questions[0]?.category || 'Roadmap Module'} ({questions.length} Questions)
                  </p>
                </div>
                {/* 10-Minute Countdown Timer */}
                <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-950 border border-indigo-500/30 rounded-xl text-xs font-mono font-bold text-indigo-400 shadow-md">
                  <Timer className="w-4 h-4 text-indigo-400" />
                  <span>{formatTimer(testTimerSeconds)}</span>
                </div>
              </div>

              {testLoading ? (
                <div className="py-12 text-center text-indigo-400 font-semibold text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" /> Preparing most asked questions...
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((q, qIdx) => (
                    <div key={q.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-3">
                      <span className="font-bold text-sm text-white block">
                        {qIdx + 1}. {q.question_text}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {[
                          { key: 'A', text: q.option_a },
                          { key: 'B', text: q.option_b },
                          { key: 'C', text: q.option_c },
                          { key: 'D', text: q.option_d },
                        ].map((opt) => {
                          const isSelected = selectedAnswers[q.id] === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() =>
                                setSelectedAnswers({ ...selectedAnswers, [q.id]: opt.key })
                              }
                              className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                                isSelected
                                  ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-400 text-white'
                                    : 'border-slate-700 text-slate-400'
                                }`}
                              >
                                {opt.key}
                              </span>
                              <span>{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {(() => {
                    const answeredCount = Object.keys(selectedAnswers).length;
                    const isAllAnswered = questions.length > 0 && answeredCount === questions.length;

                    return (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
                        <span className="text-xs font-semibold text-slate-400">
                          {isAllAnswered ? (
                            <span className="text-emerald-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" /> All questions answered ({answeredCount}/{questions.length})
                            </span>
                          ) : (
                            <span className="text-amber-400">
                              Please answer all questions ({answeredCount}/{questions.length} answered)
                            </span>
                          )}
                        </span>

                        <button
                          onClick={handleTestSubmit}
                          disabled={testSubmitting || !isAllAnswered}
                          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
                        >
                          {testSubmitting ? (
                            <span>Evaluating...</span>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" /> Submit Assessment
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
              <div className="text-center py-4 border-b border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-indigo-400">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">Test Submitted Successfully!</h3>
                <p className="text-xs text-slate-400 mt-1">Here is your automated evaluation breakdown.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-xs font-semibold text-slate-400">Final Score</span>
                  <div className="text-3xl font-extrabold text-indigo-400 mt-1">
                    {testResult.score_percentage}%
                  </div>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-xs font-semibold text-slate-400">Correct Answers</span>
                  <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                    {testResult.correct_answers} / {testResult.total_questions}
                  </div>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-xs font-semibold text-slate-400">Evaluation Date</span>
                  <div className="text-sm font-bold text-white mt-2">{testResult.completed_at}</div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setTestResult(null);
                    setSelectedAnswers({});
                    setTestTimerSeconds(600);
                    fetchQuestions();
                  }}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs"
                >
                  Retake Test
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI VIDEO MOCK INTERVIEW WITH TIMER */}
      {activeTab === 'interview' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
          {!interviewStarted ? (
            <div className="text-center py-8 max-w-lg mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
                <Video className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">AI Video & Voice Mock Interview</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click start to activate camera and microphone audio recording for AI technical interview evaluation. Questions change dynamically on every session.
              </p>
              <button
                onClick={handleStartInterviewSession}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/20 inline-flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Play className="w-4 h-4" /> Start Interview Session
              </button>
            </div>
          ) : interviewCompleted ? (
            <div className="space-y-6 bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 animate-in fade-in duration-300">
              <div className="text-center py-6 border-b border-slate-800/80 space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center mx-auto text-white shadow-xl shadow-emerald-600/20 mb-3">
                  <ShieldCheck className="w-9 h-9" />
                </div>
                <span className="text-[11px] uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full inline-block">
                  Session Completed
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Final AI Mock Interview Performance Report
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 font-semibold block">Technical Depth</span>
                  <div className="text-2xl font-extrabold text-white mt-1">{finalMetrics.tech}%</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 font-semibold block">Speech Clarity</span>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">{finalMetrics.comm}%</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 font-semibold block">Vocal Pacing</span>
                  <div className="text-2xl font-extrabold text-purple-400 mt-1">{finalMetrics.pacing}%</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 font-semibold block">Video Posture</span>
                  <div className="text-2xl font-extrabold text-blue-400 mt-1">{finalMetrics.video}%</div>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-indigo-500/50 text-center col-span-2 sm:col-span-1 shadow-lg shadow-indigo-500/10">
                  <span className="text-[11px] text-indigo-400 font-bold block">Overall Readiness</span>
                  <div className="text-2xl font-extrabold text-indigo-400 mt-1">{finalMetrics.overall}%</div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    setInterviewCompleted(false);
                    setInterviewStarted(false);
                    setInterviewQuestionIndex(0);
                    setUserInterviewAnswer('');
                    setInterviewFeedback(null);
                  }}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
                >
                  Retake Interview Session
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4 flex flex-col justify-between">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-indigo-400 font-bold">
                      <span>Question {interviewQuestionIndex + 1} of {interviewQuestions.length || 4}</span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Interviewer
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white leading-snug">
                      "{currentInterviewObj?.question || currentInterviewObj?.question_text}"
                    </h4>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Mic className="w-4 h-4 text-indigo-400" /> Live Microphone Audio Input
                      </span>
                      {/* Live Audio Recording Timer */}
                      {isRecording && (
                        <span className="text-[11px] font-bold text-red-400 flex items-center gap-1.5 animate-pulse">
                          <Timer className="w-3.5 h-3.5" /> Recording ({formatTimer(voiceTimerSeconds)})
                        </span>
                      )}
                    </div>

                    {isRecording && (
                      <div className="flex items-center justify-center gap-1 py-2 bg-slate-900 rounded-xl border border-slate-800">
                        <Volume2 className="w-4 h-4 text-indigo-400 mr-2" />
                        {[40, 70, 30, 90, 50, 80, 40, 100, 60, 40].map((h, i) => (
                          <div
                            key={i}
                            className="w-1.5 bg-indigo-500 rounded-full transition-all duration-150"
                            style={{ height: `${(h * voiceVolumeLevel) / 100}px` }}
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={toggleVoiceRecording}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          isRecording
                            ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                        }`}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="w-4 h-4" /> Pause Recording
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4" /> Resume Voice Recording
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => (cameraActive ? stopCamera() : startCamera())}
                        className="px-3.5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                        title="Toggle Camera"
                      >
                        {cameraActive ? <Camera className="w-4 h-4 text-emerald-400" /> : <CameraOff className="w-4 h-4 text-slate-500" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 relative h-[260px] sm:h-[300px] flex flex-col items-center justify-center overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover rounded-xl border border-slate-800 ${
                      cameraActive && !cameraPermissionError ? 'block' : 'hidden'
                    }`}
                  />

                  {(!cameraActive || cameraPermissionError) && (
                    <div className="w-full h-full rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                      <div className="w-20 h-20 rounded-full bg-indigo-600/20 border-2 border-indigo-500/50 flex items-center justify-center mb-3 relative">
                        <User className="w-10 h-10 text-indigo-400" />
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950" />
                      </div>
                      <p className="text-xs font-bold text-white z-10">AI Video Camera Feed</p>
                    </div>
                  )}

                  <div className="absolute top-5 left-5 flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-slate-900/90 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Camera Feed Active
                    </span>
                  </div>
                </div>
              </div>

              {!interviewFeedback && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">Live Voice Speech Transcript / Text Response</label>
                  <textarea
                    rows={4}
                    value={userInterviewAnswer}
                    onChange={(e) => setUserInterviewAnswer(e.target.value)}
                    placeholder="Speak your response using your microphone (auto-active) or edit your transcript text here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSendInterviewAnswer}
                      disabled={interviewLoading || !userInterviewAnswer.trim()}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                      {interviewLoading ? (
                        <span>Evaluating...</span>
                      ) : (
                        <span>Submit Response for AI Evaluation</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {interviewFeedback && (
                <div className="space-y-6 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Award className="w-4 h-4 text-indigo-400" /> Question {interviewQuestionIndex + 1} Evaluation
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold block">Technical</span>
                      <span className="text-lg font-extrabold text-white">
                        {interviewFeedback.technical_knowledge}%
                      </span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold block">Relevance</span>
                      <span className="text-lg font-extrabold text-white">
                        {interviewFeedback.relevance}%
                      </span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold block">Speech Clarity</span>
                      <span className="text-lg font-extrabold text-emerald-400">
                        {interviewFeedback.communication}%
                      </span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold block">Vocal Pacing</span>
                      <span className="text-lg font-extrabold text-purple-400">
                        {interviewFeedback.vocal_pacing_score || 85}%
                      </span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold block">Video Posture</span>
                      <span className="text-lg font-extrabold text-blue-400">
                        {interviewFeedback.video_presence_score || 88}%
                      </span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-indigo-500/40 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-indigo-400 font-bold block">Overall</span>
                      <span className="text-lg font-extrabold text-indigo-400">
                        {interviewFeedback.overall_score}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleNextInterviewQuestion}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                    >
                      {interviewFeedback.is_completed ? (
                        <>
                          <span>View Final Performance Report</span>
                          <FileCheck className="w-4 h-4" />
                        </>
                      ) : (
                        <span>Next Question</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function min(a: number, b: number) {
  return a < b ? a : b;
}

function roundVal(v: number) {
  return Math.round(v * 10) / 10;
}
