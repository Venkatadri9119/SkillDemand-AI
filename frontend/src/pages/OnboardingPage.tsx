import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  CheckCircle,
  Plus,
  ArrowRight,
  Sparkles,
  Cpu,
  Target,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';

interface OnboardingPageProps {
  onComplete: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const navigate = useNavigate();

  // Step 1 State
  const [location, setLocation] = useState('Hyderabad, India');
  const [education, setEducation] = useState('B.Tech Computer Science');
  const [experienceLevel, setExperienceLevel] = useState('Fresher');
  const [currentRole, setCurrentRole] = useState('Student / Job Seeker');
  const [preferredLocation, setPreferredLocation] = useState('Hyderabad');

  // Step 2 State (Skills Portfolio)
  const [skills, setSkills] = useState<string[]>(['Python', 'SQL', 'Git', 'REST API', 'Django']);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Step 3 State (Interested Role & Career Preferences)
  const [targetJobs, setTargetJobs] = useState<string[]>(['Python Developer']);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [preferredJobType, setPreferredJobType] = useState('Full-time');
  const [remotePreference, setRemotePreference] = useState('Hybrid');
  const [preferredIndustry, setPreferredIndustry] = useState('Technology');

  const availableJobsList = [
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

  const popularSkillsList = [
    'Python',
    'JavaScript',
    'SQL',
    'Git',
    'FastAPI',
    'React',
    'Docker',
    'AWS',
    'PostgreSQL',
    'Django',
    'HTML/CSS',
  ];

  // Handle Step 1 Submit
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateProfileStep1({
        location,
        education,
        experience_level: experienceLevel,
        current_role: currentRole,
        preferred_location: preferredLocation,
      });
      setStep(2);
    } catch (err) {
      setStep(2); // Fallback forward
    }
  };

  // Handle Step 2 Submit (Confirm Skills)
  const handleStep2Submit = async () => {
    try {
      // Save each skill to user skills
      for (const sk of skills) {
        try {
          await api.addSkill(sk, 'Intermediate');
        } catch (e) {
          // ignore duplicate errors
        }
      }
    } catch (err) {
      console.error(err);
    }
    setStep(3);
  };

  // Handle Step 3 Submit (Save Interested Target Role & Generate Roadmap)
  const handleFinishProfile = async () => {
    try {
      const finalJobs = [...targetJobs];
      if (customRoleInput.trim() && !finalJobs.includes(customRoleInput.trim())) {
        finalJobs.unshift(customRoleInput.trim());
      }

      const primaryRole = finalJobs[0] || 'Python Developer';

      await api.updateProfileStep3({
        target_jobs: finalJobs,
        preferred_location: preferredLocation,
        remote_preference: remotePreference,
        preferred_job_type: preferredJobType,
        preferred_industry: preferredIndustry,
      });

      await api.setPrimaryTargetJob(primaryRole);

      onComplete();
      navigate('/roadmap');
    } catch (err: any) {
      alert('Error finishing setup: ' + err.message);
      navigate('/roadmap');
    }
  };

  const setPrimaryRole = (jobTitle: string) => {
    const filtered = targetJobs.filter((j) => j !== jobTitle);
    setTargetJobs([jobTitle, ...filtered].slice(0, 3));
  };

  const addSkill = (skName: string) => {
    const trimmed = skName.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
  };

  const removeSkill = (skName: string) => {
    setSkills(skills.filter((s) => s !== skName));
  };

  const primaryRoleDisplay = targetJobs[0] || 'Python Developer';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 py-8">
      {/* Step Indicator Header */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
          <span>Step {step} of 3</span>
          <span className="text-indigo-400">
            {step === 1 ? 'Basic Profile' : step === 2 ? 'Skills Portfolio' : 'Interested Target Role'}
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* STEP 1: Basic Profile */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" /> Basic Profile
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Tell us about your background so we can personalize your readiness radar.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Education</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500"
                >
                  <option value="Fresher">Fresher (0 years)</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5+ years">5+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Role</label>
                <input
                  type="text"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferred Work Location</label>
              <input
                type="text"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                placeholder="e.g. Hyderabad / Bengaluru / Remote"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2"
              >
                <span>Continue to Skills</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Skills Portfolio */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" /> Select & Add Your Skills
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Add skills you possess or pick from popular technologies below.
              </p>
            </div>

            {/* Active Skills Tags */}
            <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white">Your Selected Skills ({skills.length})</h4>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[50px] items-center">
                {skills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-medium text-xs rounded-lg"
                  >
                    {sk}
                    <button
                      type="button"
                      onClick={() => removeSkill(sk)}
                      className="text-indigo-400 hover:text-red-400 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Custom Add Skill Input */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  placeholder="Add another skill..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(newSkillInput);
                      setNewSkillInput('');
                    }
                  }}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-white text-xs focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    addSkill(newSkillInput);
                    setNewSkillInput('');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Skill
                </button>
              </div>
            </div>

            {/* Popular Quick Add Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Popular Skills (Click to Add):</label>
              <div className="flex flex-wrap gap-2">
                {popularSkillsList.map((sk) => {
                  const isAdded = skills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => (isAdded ? removeSkill(sk) : addSkill(sk))}
                      className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition-all ${
                        isAdded
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {isAdded ? `✓ ${sk}` : `+ ${sk}`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStep2Submit}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <CheckCircle className="w-4 h-4" /> Save & Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Interested Target Role Selection */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" /> Select Interested Target Role
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Choose your interested career role. Our AI engine will immediately synthesize your personalized learning roadmap based on this choice.
              </p>
            </div>

            {/* AI Roadmap Notice Banner */}
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-start gap-3 text-xs text-indigo-300">
              <Zap className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">AI Reskilling Roadmap Integration</span>
                Your selected role (<strong>{primaryRoleDisplay}</strong>) directly dictates your reskilling roadmap steps, milestone timelines, practice projects, and skill gap matrix.
              </div>
            </div>

            {/* Popular Role Cards */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Your Interested Role:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableJobsList.map((job) => {
                  const isPrimary = targetJobs[0] === job;
                  return (
                    <div
                      key={job}
                      onClick={() => {
                        setPrimaryRole(job);
                        setCustomRoleInput('');
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isPrimary
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/10'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isPrimary ? 'border-indigo-400 bg-indigo-600' : 'border-slate-600'
                          }`}
                        >
                          {isPrimary && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className="text-xs font-semibold">{job}</span>
                      </div>
                      {isPrimary && (
                        <span className="text-[10px] uppercase font-extrabold tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded">
                          Primary Role
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Interested Role Field */}
            <div className="space-y-1.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300">Or Type a Custom Interested Role:</label>
              <div className="relative">
                <Target className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={customRoleInput}
                  onChange={(e) => {
                    setCustomRoleInput(e.target.value);
                    if (e.target.value.trim()) {
                      setPrimaryRole(e.target.value.trim());
                    }
                  }}
                  placeholder="e.g. Cybersecurity Analyst, Data Engineer, iOS Developer..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Remote Preference</label>
                <select
                  value={remotePreference}
                  onChange={(e) => setRemotePreference(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Industry</label>
                <input
                  type="text"
                  value={preferredIndustry}
                  onChange={(e) => setPreferredIndustry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-semibold text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinishProfile}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xl shadow-indigo-600/20"
              >
                <span>Finish Profile & View My Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
