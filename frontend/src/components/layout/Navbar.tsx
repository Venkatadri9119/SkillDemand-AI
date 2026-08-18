import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Radar,
  LayoutDashboard,
  Award,
  BookOpen,
  MapPin,
  User as UserIcon,
  LogOut,
  Settings,
  ChevronDown,
  Sparkles,
  Users,
  Check,
} from 'lucide-react';
import { Profile } from '../../types';
import { getSavedAccounts, switchAccount } from '../../services/api';

interface NavbarProps {
  userProfile: Profile | null;
  onLogout: () => void;
  primaryTargetJob?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ userProfile, onLogout, primaryTargetJob }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMultiUserModal, setShowMultiUserModal] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Skills', path: '/skills', icon: Award },
    { name: 'Tests & Interview', path: '/tests', icon: BookOpen },
    { name: 'Workforce Radar', path: '/radar', icon: MapPin },
    { name: 'Roadmap', path: '/roadmap', icon: Sparkles },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(userProfile ? '/dashboard' : '/')}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Radar className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                  Workforce Gap Radar
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                    AI
                  </span>
                </span>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Career Intelligence Platform
                </p>
              </div>
            </div>

            {/* Navigation Items */}
            {userProfile && (
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            )}

            {/* User Profile Menu */}
            {userProfile ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-lg hover:bg-slate-800 transition-colors border border-slate-800 hover:border-slate-700"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                    {userProfile.full_name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-semibold text-white">{userProfile.full_name}</div>
                    <div className="text-[10px] text-indigo-400 truncate max-w-[120px]">
                      {primaryTargetJob || 'Target Job'}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <p className="text-xs font-medium text-slate-400">Signed in as</p>
                      <p className="text-xs font-semibold text-slate-200 truncate">{userProfile.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowProfileModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white text-left"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowMultiUserModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-indigo-400 font-semibold hover:bg-indigo-600/20 text-left"
                    >
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>Switch Account</span>
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowSettingsModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white text-left"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Settings</span>
                    </button>

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/auth?tab=login')}
                  className="text-sm text-slate-300 hover:text-white font-medium px-3 py-1.5"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/auth?tab=register')}
                  className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg shadow-lg shadow-indigo-500/20 transition-all"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        {userProfile && (
          <div className="md:hidden flex items-center justify-around bg-slate-900/90 border-t border-slate-800 px-2 py-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{item.name}</span>
                </NavLink>
              );
            })}
            <button
              onClick={() => setShowMultiUserModal(true)}
              className="flex flex-col items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-indigo-400 hover:bg-indigo-500/10"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span className="whitespace-nowrap">Switch</span>
            </button>
          </div>
        )}
      </header>

      {/* Profile Modal */}
      {showProfileModal && userProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-indigo-400" /> User Profile Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Full Name</span>
                <span className="font-semibold text-white">{userProfile.full_name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Email</span>
                <span className="font-semibold text-white">{userProfile.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Education</span>
                <span className="font-semibold text-white">{userProfile.education || 'B.Tech CS'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Experience Level</span>
                <span className="font-semibold text-white">{userProfile.experience_level || 'Fresher'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Preferred Location</span>
                <span className="font-semibold text-white">{userProfile.preferred_location || 'Hyderabad'}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" /> Account Settings
            </h3>
            <p className="text-sm text-slate-300 mb-4">
              Manage your notifications, data privacy preferences, and AI career recommendations.
            </p>
            <div className="space-y-3">
              <label className="flex items-center justify-between text-sm text-slate-300 p-2 bg-slate-800/50 rounded-lg">
                <span>AI Job Market Alerts</span>
                <input type="checkbox" defaultChecked className="accent-indigo-500 w-4 h-4" />
              </label>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔄 MULTI-USER ACCOUNT ACCESS MODAL */}
      {showMultiUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 relative">
            <button
              onClick={() => setShowMultiUserModal(false)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
            >
              ✕
            </button>

            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Users className="w-4 h-4" /> Multi-User Account Access
              </div>
              <h3 className="text-xl font-bold text-white">Switch Candidate Account</h3>
              <p className="text-xs text-slate-400 mt-1">
                Select a candidate account to instantly switch session context, skill assessments, and roadmaps.
              </p>
            </div>

            <div className="space-y-2.5">
              {getSavedAccounts().map((acc, idx) => {
                const isCurrent = userProfile && userProfile.email.toLowerCase() === acc.email.toLowerCase();
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!isCurrent) {
                        switchAccount(acc.email);
                        setShowMultiUserModal(false);
                        window.location.reload();
                      }
                    }}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                        isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {acc.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          {acc.full_name}
                          {isCurrent && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{acc.email} • {acc.role || 'Candidate'}</div>
                      </div>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowMultiUserModal(false);
                  onLogout();
                  navigate('/auth?tab=register');
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <span>➕ Add / Login New Account</span>
              </button>
              <button
                onClick={() => setShowMultiUserModal(false)}
                className="w-full py-2 text-slate-400 hover:text-white font-semibold text-xs text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
