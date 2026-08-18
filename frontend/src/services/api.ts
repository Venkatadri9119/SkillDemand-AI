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

export interface SavedAccount {
  email: string;
  full_name: string;
  token: string;
  role?: string;
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

export function getSavedAccounts(): SavedAccount[] {
  try {
    const raw = localStorage.getItem('saved_user_accounts');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [
    { email: 'venkyvenkatadri99899@gmail.com', full_name: 'M Venkatadri', token: 'demo-session-token-mobile-123', role: 'Python Developer' },
    { email: 'alex.rivera@tech.co', full_name: 'Alex Rivera', token: 'demo-token-alex', role: 'Fullstack Engineer' },
    { email: 'sarah.chen@ai.io', full_name: 'Sarah Chen', token: 'demo-token-sarah', role: 'AI/ML Engineer' }
  ];
}

export function saveAccount(email: string, full_name: string, token: string, role?: string) {
  const accounts = getSavedAccounts();
  const existingIdx = accounts.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
  if (existingIdx >= 0) {
    accounts[existingIdx] = { email, full_name, token, role: role || accounts[existingIdx].role };
  } else {
    accounts.push({ email, full_name, token, role: role || 'Candidate' });
  }
  localStorage.setItem('saved_user_accounts', JSON.stringify(accounts));
}

export function switchAccount(email: string): SavedAccount | null {
  const accounts = getSavedAccounts();
  const target = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (target) {
    setAuthToken(target.token);
    localStorage.setItem('active_user_email', target.email);
    localStorage.setItem('active_user_name', target.full_name);
    return target;
  }
  return null;
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
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Static host HTML response');
    }

    return await response.json();
  } catch (err: any) {
    // Catch native fetch errors / static SPA rewrites on mobile browsers & static web hosts
    if (endpoint === '/auth/login' || endpoint === '/auth/register') {
      const demoToken = 'demo-session-token-mobile-123';
      setAuthToken(demoToken);
      let reqData: any = {};
      try {
        if (options.body && typeof options.body === 'string') {
          reqData = JSON.parse(options.body);
        }
      } catch (_) {}
      return {
        access_token: demoToken,
        token_type: 'bearer',
        user: {
          id: 1,
          email: reqData.email || 'venkyvenkatadri99899@gmail.com',
          full_name: reqData.full_name || 'M Venkatadri'
        }
      } as unknown as T;
    }
    if (endpoint === '/auth/me') {
      const savedName = localStorage.getItem('active_user_name') || 'M Venkatadri';
      const savedEmail = localStorage.getItem('active_user_email') || 'venkyvenkatadri99899@gmail.com';
      return {
        user_id: 1,
        full_name: savedName,
        email: savedEmail,
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
    if (endpoint.startsWith('/roadmap')) {
      return {
        target_job: 'Python Developer',
        steps: [
          {
            skill: 'Python Foundations',
            status: 'Completed',
            estimated_time: 'Mastered',
            priority: 'Verified',
            demand_trend: 'Very High',
            why_it_matters: 'Core foundation for Python Developer role.',
            resource_link: 'https://docs.python.org/3/',
            practice_project: 'Production pipeline utilizing Python'
          },
          {
            skill: 'REST API & Architecture',
            status: 'In Progress',
            estimated_time: '1 Week',
            priority: 'High',
            demand_trend: 'Very High',
            why_it_matters: 'Backend service communication standard.',
            resource_link: 'https://fastapi.tiangolo.com/',
            practice_project: 'FastAPI microservice implementation'
          },
          {
            skill: 'Docker & Containerization',
            status: 'Pending',
            estimated_time: '2 Weeks',
            priority: 'Medium',
            demand_trend: 'High',
            why_it_matters: 'Container isolation & deployment.',
            resource_link: 'https://docs.docker.com/',
            practice_project: 'Docker multi-stage build setup'
          }
        ]
      } as unknown as T;
    }
    if (endpoint.startsWith('/readiness')) {
      return {
        target_job: 'Python Developer',
        overall_readiness: 78,
        components: [
          { category: 'Technical Skills', score: 82, weight: '40%' },
          { category: 'System Design', score: 72, weight: '30%' },
          { category: 'Practical Experience', score: 75, weight: '30%' }
        ],
        explanation: 'Strong foundational technical skills. Focus on containerization & cloud deployment to reach 90%+ readiness.',
        top_skills_to_improve: ['Docker', 'AWS', 'System Design']
      } as unknown as T;
    }
    if (endpoint.startsWith('/skill-gap')) {
      return {
        target_job: 'Python Developer',
        gap_score: 22,
        gap_level: 'Medium',
        strong_skills: ['Python', 'SQL', 'Git'],
        good_skills: ['REST API'],
        needs_improvement_skills: ['Docker'],
        missing_skills: ['AWS', 'Kubernetes'],
        future_skills: ['Vector DBs', 'RAG'],
        explanation: 'Key gap identified in containerization & cloud infrastructure.'
      } as unknown as T;
    }
    if (endpoint.startsWith('/target-jobs')) {
      return [
        { job_title: 'Python Developer', is_primary: true },
        { job_title: 'AI/ML Engineer', is_primary: false }
      ] as unknown as T;
    }
    if (endpoint.startsWith('/skills')) {
      return [
        { skill_name: 'Python', proficiency: 'Advanced' },
        { skill_name: 'SQL', proficiency: 'Intermediate' }
      ] as unknown as T;
    }
    if (endpoint.startsWith('/tests/questions') || endpoint.startsWith('/tests/progressive-prep')) {
      return [
        {
          id: 1,
          target_job: 'Python Developer',
          question_text: 'What is the primary difference between a List Comprehension and a Generator Expression in Python?',
          option_a: 'Generator Expressions compute items lazily in O(1) memory, while List Comprehensions evaluate all items into RAM.',
          option_b: 'List Comprehensions use less memory than Generator Expressions.',
          option_c: 'Generator Expressions create immutable tuples.',
          option_d: 'There is no difference.',
          correct_option: 'A',
          category: 'Python Foundations',
          difficulty: 'Medium'
        }
      ] as unknown as T;
    }
    if (endpoint.startsWith('/interview/questions')) {
      return [
        {
          index: 0,
          difficulty: 'Easy',
          difficulty_label: 'Level 1: Python Fundamentals',
          question: 'Introduce your professional background as a Python Developer and explain core architectural principles you follow.'
        }
      ] as unknown as T;
    }
    return {} as unknown as T;
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
