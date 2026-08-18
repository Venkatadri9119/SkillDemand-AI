from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resume = relationship("Resume", back_populates="user", uselist=False, cascade="all, delete-orphan")
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    target_jobs = relationship("UserTargetJob", back_populates="user", cascade="all, delete-orphan")
    test_results = relationship("TestResult", back_populates="user", cascade="all, delete-orphan")
    interview_results = relationship("InterviewResult", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("ReskillingRoadmap", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    location = Column(String, default="")
    education = Column(String, default="")
    experience_level = Column(String, default="Fresher") # Fresher, 1-3 years, 3-5 years, 5+ years
    current_role = Column(String, default="")
    preferred_location = Column(String, default="")
    preferred_job_type = Column(String, default="Full-time")
    preferred_industry = Column(String, default="Technology")
    remote_preference = Column(String, default="Hybrid") # On-site, Remote, Hybrid
    onboarding_completed = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    extracted_json = Column(Text, default="{}") # Stores extracted skills, experience, education, projects, certifications
    ats_json = Column(Text, default="{}") # Stores ATS match score, keyword analysis & tips
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resume")

class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_name = Column(String, nullable=False)
    proficiency = Column(String, default="Intermediate") # Beginner, Intermediate, Advanced

    user = relationship("User", back_populates="skills")

class TargetJobCatalog(Base):
    __tablename__ = "target_job_catalog"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, default="")
    required_skills_json = Column(Text, default="[]") # List of skill names
    recommended_experience = Column(String, default="0-2 years")

class UserTargetJob(Base):
    __tablename__ = "user_target_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_title = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)

    user = relationship("User", back_populates="target_jobs")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    target_job = Column(String, index=True, nullable=False)
    question_text = Column(Text, nullable=False)
    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)
    correct_option = Column(String, nullable=False) # 'A', 'B', 'C', 'D'
    category = Column(String, default="General") # Skill category e.g. Python, REST API, Docker
    difficulty = Column(String, default="Medium")

class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_job = Column(String, nullable=False)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    score_percentage = Column(Float, default=0.0)
    strong_skills_json = Column(Text, default="[]")
    weak_skills_json = Column(Text, default="[]")
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="test_results")

class InterviewResult(Base):
    __tablename__ = "interview_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_job = Column(String, nullable=False)
    technical_score = Column(Float, default=0.0)
    relevance_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    feedback_json = Column(Text, default="{}")
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="interview_results")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    company = Column(String, nullable=False)
    location = Column(String, nullable=False)
    experience_required = Column(String, default="0-2 years")
    salary_range = Column(String, default="$60,000 - $90,000")
    remote_type = Column(String, default="Hybrid") # Remote, Hybrid, On-site
    industry = Column(String, default="Technology")
    description = Column(Text, default="")
    required_skills_json = Column(Text, default="[]")
    original_apply_url = Column(String, nullable=False)
    is_demo = Column(Boolean, default=True)

class ReskillingRoadmap(Base):
    __tablename__ = "reskilling_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_job = Column(String, nullable=False)
    steps_json = Column(Text, default="[]")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="roadmaps")

class WorkforceLocation(Base):
    __tablename__ = "workforce_locations"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, nullable=False)
    country = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    job_demand_level = Column(String, default="HIGH") # LOW, MEDIUM, HIGH, VERY HIGH
    skill_demand_level = Column(String, default="HIGH")
    talent_availability_level = Column(String, default="MEDIUM")
    skill_shortage_level = Column(String, default="HIGH") # LOW, MEDIUM, HIGH
    future_demand_level = Column(String, default="VERY HIGH")
    top_skills_json = Column(Text, default="[]")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, default="Career Guidance")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    sender = Column(String, nullable=False) # 'user' or 'ai'
    content = Column(Text, nullable=False)
    context_json = Column(Text, default="{}")
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")

class DataPrompt(Base):
    __tablename__ = "data_prompts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    prompt_text = Column(Text, nullable=False)
    extracted_target_job = Column(String, nullable=True)
    extracted_skills_json = Column(Text, default="[]")
    extracted_experience = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
