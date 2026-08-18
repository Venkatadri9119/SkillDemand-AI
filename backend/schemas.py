from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    confirm_password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    full_name: str
    email: str

# --- Profile Schemas ---
class BasicProfileUpdate(BaseModel):
    location: str
    education: str
    experience_level: str
    current_role: str
    preferred_location: str

class ProfileResponse(BaseModel):
    user_id: int
    full_name: str
    email: str
    location: str
    education: str
    experience_level: str
    current_role: str
    preferred_location: str
    preferred_job_type: str
    preferred_industry: str
    remote_preference: str
    onboarding_completed: bool

# --- Resume Schemas ---
class ExtractedResumeData(BaseModel):
    name: Optional[str] = ""
    education: Optional[str] = ""
    skills: List[str] = []
    experience: Optional[str] = ""
    projects: List[str] = []
    certifications: List[str] = []
    previous_roles: List[str] = []

class UpdateExtractedResumeData(BaseModel):
    name: Optional[str] = ""
    education: Optional[str] = ""
    skills: List[str] = []
    experience: Optional[str] = ""
    projects: List[str] = []
    certifications: List[str] = []
    previous_roles: List[str] = []

# --- Skills Schemas ---
class SkillItem(BaseModel):
    skill_name: str
    proficiency: str # Beginner, Intermediate, Advanced

class AddSkillRequest(BaseModel):
    skill_name: str
    proficiency: str = "Intermediate"

class UpdateTargetJobsRequest(BaseModel):
    target_jobs: List[str]
    preferred_location: Optional[str] = ""
    remote_preference: Optional[str] = "Hybrid"
    preferred_job_type: Optional[str] = "Full-time"
    preferred_industry: Optional[str] = "Technology"

# --- Readiness Engine Schemas ---
class ReadinessComponentScore(BaseModel):
    category: str
    score: float
    weight: str

class ReadinessResponse(BaseModel):
    target_job: str
    overall_readiness: float
    components: List[ReadinessComponentScore]
    explanation: str
    top_skills_to_improve: List[str]
    last_synced: Optional[str] = None

class DataPromptRequest(BaseModel):
    prompt_text: str

# --- Skill Gap Schemas ---
class CategorizedSkill(BaseModel):
    skill: str
    status: str # Strong, Good, Needs Improvement, Missing, Future Skill
    demand_trend: Optional[str] = "High → High"

class SkillGapResponse(BaseModel):
    target_job: str
    gap_score: float # 0 to 100
    gap_level: str # Low, Medium, High
    strong_skills: List[str]
    good_skills: List[str]
    needs_improvement_skills: List[str]
    missing_skills: List[str]
    future_skills: List[str]
    explanation: str

# --- Test System Schemas ---
class QuestionDTO(BaseModel):
    id: int
    target_job: str
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    category: str
    difficulty: str

class TestSubmission(BaseModel):
    target_job: str
    answers: Dict[int, str] # question_id -> selected_option ('A','B','C','D')

class TestResultResponse(BaseModel):
    total_questions: int
    correct_answers: int
    score_percentage: float
    strong_skills: List[str]
    weak_skills: List[str]
    completed_at: str

# --- Video & Voice Mock Interview Schemas ---
class InterviewMessageRequest(BaseModel):
    target_job: str
    user_response: str
    question_index: int
    speech_duration_seconds: Optional[int] = 30
    words_per_minute: Optional[int] = 125
    voice_clarity_score: Optional[float] = 85.0
    video_posture_score: Optional[float] = 88.0

class InterviewFeedbackResponse(BaseModel):
    technical_knowledge: float
    relevance: float
    communication: float
    confidence: float
    vocal_pacing_score: Optional[float] = 82.0
    video_presence_score: Optional[float] = 85.0
    overall_score: float
    good_points: List[str]
    improvement_points: List[str]
    practice_recommendations: List[str]
    next_question: Optional[str] = None
    is_completed: bool = False

# --- Reskilling Roadmap Schemas ---
class RoadmapStep(BaseModel):
    skill: str
    status: str # Completed, In Progress, Pending
    estimated_time: str
    priority: str # High, Medium, Low
    demand_trend: str
    why_it_matters: str
    resource_link: str
    practice_project: str

class RoadmapResponse(BaseModel):
    target_job: str
    steps: List[RoadmapStep]
    updated_at: str

# --- Job Recommendation Schemas ---
class JobDTO(BaseModel):
    id: int
    title: str
    company: str
    location: str
    experience_required: str
    salary_range: str
    remote_type: str
    description: str
    required_skills: List[str]
    match_percentage: float
    matching_skills: List[str]
    missing_skills: List[str]
    original_apply_url: str
    is_demo: bool

# --- Workforce Radar Schemas ---
class WorkforceLocationDTO(BaseModel):
    id: int
    city: str
    country: str
    latitude: float
    longitude: float
    job_demand_level: str
    skill_demand_level: str
    talent_availability_level: str
    skill_shortage_level: str
    future_demand_level: str
    top_skills: List[str]

# --- AI Chatbot Schemas ---
class ChatPromptRequest(BaseModel):
    user_message: str
    current_page_context: Optional[str] = "Dashboard"

# --- AI Agent Generation Schemas ---
class AgentGenerateTestRequest(BaseModel):
    role_title: str
    skill_focus: Optional[str] = None
    difficulty: Optional[str] = "Medium"

class AgentGenerateRoadmapRequest(BaseModel):
    role_title: str
    focus_areas: Optional[List[str]] = None

