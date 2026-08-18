import React, { useState, useEffect } from 'react';
import { Award, Plus, Search, Trash2, Check, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { Skill } from '../types';

export const SkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newProficiency, setNewProficiency] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await api.getSkills();
      setSkills(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      await api.addSkill(newSkillName.trim(), newProficiency);
      setNewSkillName('');
      fetchSkills();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveSkill = async (skillName: string) => {
    try {
      await api.removeSkill(skillName);
      setSkills(skills.filter((s) => s.skill_name !== skillName));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProficiency = async (skillName: string, level: 'Beginner' | 'Intermediate' | 'Advanced') => {
    try {
      await api.addSkill(skillName, level);
      setSkills(skills.map((s) => (s.skill_name === skillName ? { ...s, proficiency: level } : s)));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSkills = skills.filter((s) => s.skill_name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-indigo-400" /> My Skill Portfolio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your skill tags and set your proficiency level for accurate job readiness scoring.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search skill..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
      {/* Add Skill Form */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-400" /> Add New Skill
        </h3>
        <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="e.g. Docker, FastAPI, AWS, TypeScript..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <select
            value={newProficiency}
            onChange={(e: any) => setNewProficiency(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Add Skill
          </button>
        </form>
      </div>

      {/* Editable Skill Tags Display (Prompt Spec #7) */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
        <h3 className="text-base font-bold text-white">Your Active Skills ({filteredSkills.length})</h3>

        {loading ? (
          <div className="py-8 text-center text-xs text-indigo-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading skills...
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No matching skills found. Try adding a skill above!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredSkills.map((sk) => (
              <div
                key={sk.skill_name}
                className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{sk.skill_name}</span>
                  </div>

                  {/* Proficiency Selector */}
                  <select
                    value={sk.proficiency}
                    onChange={(e: any) => handleUpdateProficiency(sk.skill_name, e.target.value)}
                    className="mt-1 bg-slate-900 text-[10px] font-semibold text-indigo-400 border border-slate-800 rounded px-2 py-0.5"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* Remove × Action */}
                <button
                  onClick={() => handleRemoveSkill(sk.skill_name)}
                  className="w-7 h-7 rounded-lg bg-slate-900 text-slate-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center font-bold text-base transition-colors"
                  title="Remove Skill"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
