export interface User {
  id: number;
  email: string;
  full_name: string;
}

export interface Profile {
  user_id: number;
  full_name: string;
  email: string;
  location: string;
  education: string;
  experience_level: string;
  current_role: string;
  preferred_location: string;
  preferred_job_type: string;
  preferred_industry: string;
  remote_preference: string;
  onboarding_completed: boolean;
}

export interface ExtractedResumeData {
  name: string;
  education: string;
  skills: string[];
  experience: string;
  projects: string[];
  certifications: string[];
  previous_roles: string[];
}

export interface Skill {
  skill_name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface TargetJob {
  job_title: string;
  is_primary: boolean;
}

export interface ReadinessComponent {
  category: string;
  score: number;
  weight: string;
}

export interface ReadinessData {
  target_job: string;
  overall_readiness: number;
  components: ReadinessComponent[];
  explanation: string;
  top_skills_to_improve: string[];
  last_synced?: string;
}

export interface SkillGapData {
  target_job: string;
  gap_score: number;
  gap_level: 'Low' | 'Medium' | 'High';
  strong_skills: string[];
  good_skills: string[];
  needs_improvement_skills: string[];
  missing_skills: string[];
  future_skills: string[];
  explanation: string;
}

export interface TestQuestion {
  id: number;
  target_job: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  category: string;
  difficulty: string;
}

export interface TestResult {
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  strong_skills: string[];
  weak_skills: string[];
  completed_at: string;
}

export interface InterviewFeedback {
  technical_knowledge: number;
  relevance: number;
  communication: number;
  confidence: number;
  vocal_pacing_score?: number;
  video_presence_score?: number;
  overall_score: number;
  good_points: string[];
  improvement_points: string[];
  practice_recommendations: string[];
  next_question?: string | null;
  is_completed: boolean;
}

export interface RoadmapStep {
  skill: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  estimated_time: string;
  priority: 'High' | 'Medium' | 'Low' | 'Normal' | 'Verified' | 'Critical';
  demand_trend: string;
  why_it_matters: string;
  resource_link: string;
  practice_project: string;
  key_concepts?: string[];
  learning_guide?: string;
  official_docs_url?: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  experience_required: string;
  salary_range: string;
  remote_type: string;
  description: string;
  required_skills: string[];
  match_percentage: number;
  matching_skills: string[];
  missing_skills: string[];
  original_apply_url: string;
  is_demo: boolean;
}

export interface WorkforceLocation {
  id: number;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  job_demand_level: string;
  skill_demand_level: string;
  talent_availability_level: string;
  skill_shortage_level: string;
  future_demand_level: string;
  top_skills: string[];
}

export interface ChatMessage {
  id?: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}
