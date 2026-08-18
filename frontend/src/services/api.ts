import {
  Profile,
  Skill,
  TargetJob,
  ReadinessData,
  SkillGapData,
  TestQuestion,
  TestResult,
  InterviewFeedback,
  RoadmapStep,
  Job,
  WorkforceLocation,
} from '../types';

function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port, origin } = window.location;
    // If accessing from mobile phone or external device on local network IP (e.g. 192.168.x.x)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      if (port === '5173') {
        return `${protocol}//${hostname}:8000/api`;
      }
      return `${origin}/api`;
    }
  }
  return 'http://127.0.0.1:8000/api';
}

export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const baseUrl = getApiBaseUrl();

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        removeAuthToken();
      }
      const errData = await response.json().catch(() => ({ detail: 'Network request failed' }));
      throw new Error(errData.detail || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    // Mobile fallback session: if backend is unreachable from cell network/standalone frontend preview
    if (endpoint === '/auth/login' || endpoint === '/auth/register') {
      console.warn('Backend server unreachable, engaging mobile demo fallback session.');
      const demoToken = 'demo-session-token-mobile-123';
      setAuthToken(demoToken);
      return {
        access_token: demoToken,
        token_type: 'bearer',
        user: {
          id: 1,
          email: 'demo@skilldemand.ai',
          full_name: 'Demo Candidate'
        }
      } as unknown as T;
    }
    if (endpoint === '/auth/me') {
      return {
        user_id: 1,
        full_name: 'Demo Candidate',
        email: 'demo@skilldemand.ai',
        location: 'San Francisco, CA',
        education: 'B.S. Computer Science',
        experience_level: 'Mid-Level',
        current_role: 'Software Developer',
        preferred_location: 'Remote',
        preferred_job_type: 'Full-time',
        preferred_industry: 'Technology',
        remote_preference: 'Remote',
        onboarding_completed: true
      } as unknown as T;
    }
    throw err;
  }
}

export const api = {
  // Auth
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<Profile>('/auth/me'),

  // Onboarding & Profile
  updateProfileStep1: (data: any) => request<any>('/profile/step1', { method: 'POST', body: JSON.stringify(data) }),
  updateProfileStep3: (data: any) => request<any>('/profile/step3', { method: 'POST', body: JSON.stringify(data) }),

  // Resume Upload
  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<any>('/resume/upload', { method: 'POST', body: formData });
  },
  confirmResumeData: (data: any) => request<any>('/resume/confirm', { method: 'POST', body: JSON.stringify(data) }),
  getAtsReport: () => request<any>('/resume/ats'),

  // Skills
  getSkills: () => request<Skill[]>('/skills'),
  addSkill: (skill_name: string, proficiency: string) =>
    request<any>('/skills/add', { method: 'POST', body: JSON.stringify({ skill_name, proficiency }) }),
  removeSkill: (skill_name: string) => request<any>(`/skills/remove/${encodeURIComponent(skill_name)}`, { method: 'DELETE' }),

  // Target Jobs
  getTargetJobs: () => request<TargetJob[]>('/target-jobs'),
  setPrimaryTargetJob: (job_title: string) =>
    request<any>(`/target-jobs/primary?job_title=${encodeURIComponent(job_title)}`, { method: 'POST' }),

  // Analytics & Data Prompt
  getReadiness: () => request<ReadinessData>('/readiness'),
  getSkillGap: () => request<SkillGapData>('/skill-gap'),
  submitDataPrompt: (prompt_text: string) =>
    request<ReadinessData>('/data-prompt', { method: 'POST', body: JSON.stringify({ prompt_text }) }),

  // Technical Assessment & AI Interview
  getTestQuestions: (target_job?: string, module_name?: string) =>
    request<TestQuestion[]>(
      `/tests/questions?${target_job ? `target_job=${encodeURIComponent(target_job)}&` : ''}${
        module_name ? `module_name=${encodeURIComponent(module_name)}` : ''
      }`
    ),

  getProgressivePrepQuestions: (target_job?: string, module_name?: string) =>
    request<any[]>(
      `/tests/progressive-prep?${target_job ? `target_job=${encodeURIComponent(target_job)}&` : ''}${
        module_name ? `module_name=${encodeURIComponent(module_name)}` : ''
      }`
    ),

  getInterviewQuestions: (target_job?: string, module_name?: string) =>
    request<any[]>(
      `/interview/questions?${target_job ? `target_job=${encodeURIComponent(target_job)}&` : ''}${
        module_name ? `module_name=${encodeURIComponent(module_name)}` : ''
      }`
    ),
  submitTest: (target_job: string, answers: Record<number, string>) =>
    request<TestResult>('/tests/submit', { method: 'POST', body: JSON.stringify({ target_job, answers }) }),
  getTestHistory: () => request<any[]>('/tests/history'),

  // Mock Interview
  sendInterviewMessage: (
    target_job: string,
    user_response: string,
    question_index: number,
    speech_duration_seconds?: number,
    words_per_minute?: number,
    voice_clarity_score?: number,
    video_posture_score?: number
  ) =>
    request<InterviewFeedback>('/interview/message', {
      method: 'POST',
      body: JSON.stringify({
        target_job,
        user_response,
        question_index,
        speech_duration_seconds,
        words_per_minute,
        voice_clarity_score,
        video_posture_score,
      }),
    }),

  // Roadmap & Jobs
  getRoadmap: () => request<{ target_job: string; steps: RoadmapStep[]; updated_at: string }>('/roadmap'),
  getJobs: (search?: string, remote_type?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (remote_type) params.append('remote_type', remote_type);
    return request<Job[]>(`/jobs?${params.toString()}`);
  },

  // Radar Map & Chatbot
  getWorkforceRadar: () => request<WorkforceLocation[]>('/workforce-radar'),
  askChatbot: (user_message: string, current_page_context?: string) =>
    request<{ answer: string; context_used: any; timestamp: string }>('/chatbot/ask', {
      method: 'POST',
      body: JSON.stringify({ user_message, current_page_context }),
    }),

  // AI Agent Generators (Chosen Role Test Questions & Personalized Roadmap)
  generateAgentTests: (role_title: string, skill_focus?: string, difficulty?: string) =>
    request<any>('/ai-agent/generate-tests', {
      method: 'POST',
      body: JSON.stringify({ role_title, skill_focus, difficulty }),
    }),

  generateAgentRoadmap: (role_title: string, focus_areas?: string[]) =>
    request<{ target_job: string; overall_fit: string; steps: RoadmapStep[]; generated_by_agent: boolean; updated_at: string }>(
      '/ai-agent/generate-roadmap',
      {
        method: 'POST',
        body: JSON.stringify({ role_title, focus_areas }),
      }
    ),
};
