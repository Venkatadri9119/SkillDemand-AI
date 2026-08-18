import json
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from auth_utils import hash_password, verify_password, create_access_token, get_current_user, oauth2_scheme
import ai_engine

router = APIRouter(prefix="/api")

# --- AUTHENTICATION ---
@router.post("/auth/register", response_model=schemas.Token)
def register(data: schemas.UserRegister, db: Session = Depends(get_db)):
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
        
    existing_user = db.query(models.User).filter(models.User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists")
        
    hashed_pwd = hash_password(data.password)
    user = models.User(
        email=data.email,
        password_hash=hashed_pwd,
        full_name=data.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create empty profile
    profile = models.Profile(user_id=user.id)
    db.add(profile)
    
    # Create default user target job
    target_job = models.UserTargetJob(user_id=user.id, job_title="Python Developer", is_primary=True)
    db.add(target_job)
    
    # Add default sample skills
    default_skills = [
        ("Python", "Advanced"),
        ("SQL", "Intermediate"),
        ("Git", "Intermediate")
    ]
    for sk_name, prof in default_skills:
        db.add(models.UserSkill(user_id=user.id, skill_name=sk_name, proficiency=prof))
        
    db.commit()
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email
    }

@router.post("/auth/login", response_model=schemas.Token)
def login(data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    access_token = create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email
    }

@router.get("/auth/me", response_model=schemas.ProfileResponse)
def get_me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    prof = current_user.profile
    if not prof:
        prof = models.Profile(user_id=current_user.id)
        db.add(prof)
        db.commit()
        db.refresh(prof)
        
    return {
        "user_id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "location": prof.location or "",
        "education": prof.education or "",
        "experience_level": prof.experience_level or "Fresher",
        "current_role": prof.current_role or "",
        "preferred_location": prof.preferred_location or "",
        "preferred_job_type": prof.preferred_job_type or "Full-time",
        "preferred_industry": prof.preferred_industry or "Technology",
        "remote_preference": prof.remote_preference or "Hybrid",
        "onboarding_completed": prof.onboarding_completed
    }

# --- ONBOARDING & PROFILE ---
@router.post("/profile/step1")
def update_profile_step1(
    data: schemas.BasicProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prof = current_user.profile
    if not prof:
        prof = models.Profile(user_id=current_user.id)
        db.add(prof)
        
    prof.location = data.location
    prof.education = data.education
    prof.experience_level = data.experience_level
    prof.current_role = data.current_role
    prof.preferred_location = data.preferred_location
    db.commit()
    return {"message": "Basic profile updated successfully"}

@router.post("/profile/step3")
def update_profile_step3(
    data: schemas.UpdateTargetJobsRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prof = current_user.profile
    if prof:
        if data.preferred_location:
            prof.preferred_location = data.preferred_location
        if data.remote_preference:
            prof.remote_preference = data.remote_preference
        if data.preferred_job_type:
            prof.preferred_job_type = data.preferred_job_type
        if data.preferred_industry:
            prof.preferred_industry = data.preferred_industry
        prof.onboarding_completed = True
        
    # Update target jobs
    db.query(models.UserTargetJob).filter(models.UserTargetJob.user_id == current_user.id).delete()
    for index, job_title in enumerate(data.target_jobs[:3]): # Max 3 target jobs
        is_p = (index == 0)
        db.add(models.UserTargetJob(user_id=current_user.id, job_title=job_title, is_primary=is_p))
        
    db.commit()
    return {"message": "Target jobs updated successfully"}

# --- RESUME PARSING & CONFIRMATION ---
@router.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not (file.filename.endswith(".pdf") or file.filename.endswith(".docx") or file.filename.endswith(".txt")):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, or TXT files are accepted.")
        
    content = await file.read()
    raw_text = ai_engine.extract_text_from_file_bytes(content, file.filename)
    extracted = ai_engine.parse_resume_nlp(raw_text)
    
    primary_job_obj = db.query(models.UserTargetJob).filter(
        models.UserTargetJob.user_id == current_user.id,
        models.UserTargetJob.is_primary == True
    ).first()
    target_job = primary_job_obj.job_title if primary_job_obj else "Python Developer"

    ats_analysis = ai_engine.calculate_ats_score(raw_text, target_job, extracted.get("skills", []))
    extracted["ats_analysis"] = ats_analysis

    # Save resume record & ATS report
    existing_resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).first()
    if existing_resume:
        existing_resume.filename = file.filename
        existing_resume.extracted_json = json.dumps(extracted)
        existing_resume.ats_json = json.dumps(ats_analysis)
    else:
        new_resume = models.Resume(
            user_id=current_user.id,
            filename=file.filename,
            file_path=f"uploads/{file.filename}",
            extracted_json=json.dumps(extracted),
            ats_json=json.dumps(ats_analysis)
        )
        db.add(new_resume)

    # Auto-register extracted skills to user_skills
    existing_skills = {s.skill_name for s in current_user.skills}
    for sk in extracted.get("skills", []):
        if sk not in existing_skills:
            db.add(models.UserSkill(user_id=current_user.id, skill_name=sk, proficiency="Intermediate"))

    db.commit()
    return {"filename": file.filename, "extracted_data": extracted, "ats_analysis": ats_analysis}

@router.get("/resume/ats")
def get_latest_ats_report(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetches candidate's latest saved ATS match score & optimization audit report."""
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).first()
    if not resume or not resume.ats_json:
        return None
    try:
        return json.loads(resume.ats_json)
    except Exception:
        return None

@router.post("/resume/confirm")
def confirm_resume_data(
    data: schemas.UpdateExtractedResumeData,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Apply confirmed extracted data to user's profile and skills
    prof = current_user.profile
    if prof:
        if data.education:
            prof.education = data.education
        if data.experience:
            prof.experience_level = data.experience
            
    # Add extracted skills if not present
    existing_skills = {s.skill_name for s in current_user.skills}
    for sk in data.skills:
        if sk not in existing_skills:
            db.add(models.UserSkill(user_id=current_user.id, skill_name=sk, proficiency="Intermediate"))
            
    db.commit()
    return {"message": "Extracted resume information confirmed & saved successfully"}

# --- SKILLS MANAGEMENT ---
@router.get("/skills", response_model=List[schemas.SkillItem])
def get_user_skills(current_user: models.User = Depends(get_current_user)):
    return [
        {"skill_name": s.skill_name, "proficiency": s.proficiency}
        for s in current_user.skills
    ]

@router.post("/skills/add")
def add_user_skill(
    data: schemas.AddSkillRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(models.UserSkill).filter(
        models.UserSkill.user_id == current_user.id,
        models.UserSkill.skill_name == data.skill_name
    ).first()
    
    if existing:
        existing.proficiency = data.proficiency
    else:
        db.add(models.UserSkill(user_id=current_user.id, skill_name=data.skill_name, proficiency=data.proficiency))
        
    db.commit()
    return {"message": "Skill added/updated successfully"}

@router.delete("/skills/remove/{skill_name}")
def remove_user_skill(
    skill_name: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(models.UserSkill).filter(
        models.UserSkill.user_id == current_user.id,
        models.UserSkill.skill_name == skill_name
    ).delete()
    db.commit()
    return {"message": f"Skill {skill_name} removed"}

# --- TARGET JOBS ---
@router.get("/target-jobs")
def get_target_jobs(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_jobs = db.query(models.UserTargetJob).filter(models.UserTargetJob.user_id == current_user.id).all()
    if not user_jobs:
        # Default Python Developer
        return [{"job_title": "Python Developer", "is_primary": True}]
    return [{"job_title": j.job_title, "is_primary": j.is_primary} for j in user_jobs]

@router.post("/target-jobs/primary")
def set_primary_target_job(
    job_title: str = Query(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(models.UserTargetJob).filter(models.UserTargetJob.user_id == current_user.id).update({"is_primary": False})
    
    existing = db.query(models.UserTargetJob).filter(
        models.UserTargetJob.user_id == current_user.id,
        models.UserTargetJob.job_title == job_title
    ).first()
    
    if existing:
        existing.is_primary = True
    else:
        db.add(models.UserTargetJob(user_id=current_user.id, job_title=job_title, is_primary=True))
        
    db.commit()
    return {"message": f"Primary target job set to {job_title}"}

# --- READINESS ENGINE ---
@router.get("/readiness", response_model=schemas.ReadinessResponse)
def get_readiness_score(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    primary_job_obj = db.query(models.UserTargetJob).filter(
        models.UserTargetJob.user_id == current_user.id,
        models.UserTargetJob.is_primary == True
    ).first()
    target_job = primary_job_obj.job_title if primary_job_obj else "Python Developer"
    
    user_skills = [{"skill_name": s.skill_name, "proficiency": s.proficiency} for s in current_user.skills]
    prof = current_user.profile
    
    # Latest test score for candidate
    latest_test = db.query(models.TestResult).filter(
        models.TestResult.user_id == current_user.id
    ).order_by(models.TestResult.completed_at.desc()).first()
    test_score = latest_test.score_percentage if latest_test else 0.0
    
    # Latest interview score
    latest_int = db.query(models.InterviewResult).filter(
        models.InterviewResult.user_id == current_user.id,
        models.InterviewResult.target_job == target_job
    ).order_by(models.InterviewResult.completed_at.desc()).first()
    interview_score = latest_int.overall_score if latest_int else 0.0
    
    readiness = ai_engine.calculate_job_readiness(
        user_skills=user_skills,
        target_job=target_job,
        education=prof.education if prof else "",
        experience=prof.experience_level if prof else "",
        test_score=test_score,
        interview_score=interview_score
    )
    readiness["last_synced"] = datetime.utcnow().strftime("%H:%M:%S UTC")
    return readiness

# --- DATA PROMPT ENGINE ---
@router.post("/data-prompt", response_model=schemas.ReadinessResponse)
def submit_data_prompt(
    data: schemas.DataPromptRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Processes natural language data prompt, updates isolated user record, and recalculates metrics."""
    parsed = ai_engine.parse_user_data_prompt(data.prompt_text)
    
    # Store prompt record for isolated person
    prompt_rec = models.DataPrompt(
        user_id=current_user.id,
        prompt_text=data.prompt_text,
        extracted_target_job=parsed.get("target_job"),
        extracted_skills_json=json.dumps(parsed.get("skills", [])),
        extracted_experience=parsed.get("experience_level")
    )
    db.add(prompt_rec)

    # 1. Update Target Job if extracted
    if parsed.get("target_job"):
        new_job = parsed["target_job"]
        db.query(models.UserTargetJob).filter(models.UserTargetJob.user_id == current_user.id).update({"is_primary": False})
        existing = db.query(models.UserTargetJob).filter(
            models.UserTargetJob.user_id == current_user.id,
            models.UserTargetJob.job_title == new_job
        ).first()
        if existing:
            existing.is_primary = True
        else:
            db.add(models.UserTargetJob(user_id=current_user.id, job_title=new_job, is_primary=True))

    # 2. Add extracted skills to isolated user skills
    existing_skills = {s.skill_name for s in current_user.skills}
    for sk in parsed.get("skills", []):
        if sk not in existing_skills:
            db.add(models.UserSkill(user_id=current_user.id, skill_name=sk, proficiency="Intermediate"))

    # 3. Update profile experience level if present
    if parsed.get("experience_level") and current_user.profile:
        current_user.profile.experience_level = parsed["experience_level"]

    db.commit()

    return get_readiness_score(current_user=current_user, db=db)

# --- SKILL GAP ANALYSIS ---
@router.get("/skill-gap", response_model=schemas.SkillGapResponse)
def get_skill_gap(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    primary_job_obj = db.query(models.UserTargetJob).filter(
        models.UserTargetJob.user_id == current_user.id,
        models.UserTargetJob.is_primary == True
    ).first()
    target_job = primary_job_obj.job_title if primary_job_obj else "Python Developer"
    
    user_skills = [{"skill_name": s.skill_name, "proficiency": s.proficiency} for s in current_user.skills]
    gap_result = ai_engine.analyze_skill_gap(user_skills, target_job)
    return gap_result

# --- TESTS SYSTEM ---
@router.get("/tests/questions", response_model=List[schemas.QuestionDTO])
def get_test_questions(
    target_job: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not target_job:
        primary_job_obj = db.query(models.UserTargetJob).filter(
            models.UserTargetJob.user_id == current_user.id,
            models.UserTargetJob.is_primary == True
        ).first()
        target_job = primary_job_obj.job_title if primary_job_obj else "Python Developer"
        
    questions = db.query(models.Question).filter(models.Question.target_job == target_job).all()
    if not questions:
        # Fetch dynamically from database
        questions = db.query(models.Question).all()
        
    return [
        {
            "id": q.id,
            "target_job": q.target_job,
            "question_text": q.question_text,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
            "category": q.category,
            "difficulty": q.difficulty
        }
        for q in questions
    ]

@router.post("/tests/submit", response_model=schemas.TestResultResponse)
def submit_test(
    submission: schemas.TestSubmission,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    questions = db.query(models.Question).filter(models.Question.target_job == submission.target_job).all()
    if not questions:
        questions = db.query(models.Question).all()
        
    total = len(questions)
    correct = 0
    strong_categories = set()
    weak_categories = set()
    
    for q in questions:
        user_ans = submission.answers.get(q.id)
        if user_ans and user_ans.upper() == q.correct_option.upper():
            correct += 1
            strong_categories.add(q.category)
        else:
            weak_categories.add(q.category)
            
    score_pct = round((correct / total) * 100, 1) if total > 0 else 0.0
    
    # Store result
    result = models.TestResult(
        user_id=current_user.id,
        target_job=submission.target_job,
        total_questions=total,
        correct_answers=correct,
        score_percentage=score_pct,
        strong_skills_json=json.dumps(list(strong_categories)),
        weak_skills_json=json.dumps(list(weak_categories))
    )
    db.add(result)

    # Automatically register test-verified skills to candidate profile
    existing_skill_names = {s.skill_name for s in current_user.skills}
    for category_skill in strong_categories:
        if category_skill and category_skill not in existing_skill_names:
            new_user_skill = models.UserSkill(
                user_id=current_user.id,
                skill_name=category_skill,
                proficiency="Advanced"
            )
            db.add(new_user_skill)

    db.commit()
    
    return {
        "total_questions": total,
        "correct_answers": correct,
        "score_percentage": score_pct,
        "strong_skills": list(strong_categories),
        "weak_skills": list(weak_categories),
        "completed_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    }

@router.get("/tests/history")
def get_test_history(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    results = db.query(models.TestResult).filter(
        models.TestResult.user_id == current_user.id
    ).order_by(models.TestResult.completed_at.desc()).all()
    
    output = []
    for r in results:
        strong = json.loads(r.strong_skills_json or "[]")
        weak = json.loads(r.weak_skills_json or "[]")
        output.append({
            "id": r.id,
            "target_job": r.target_job,
            "score_percentage": r.score_percentage,
            "correct_answers": r.correct_answers,
            "total_questions": r.total_questions,
            "strong_skills": strong,
            "weak_skills": weak,
            "completed_at": r.completed_at.strftime("%Y-%m-%d %H:%M") if r.completed_at else "Just now"
        })
    return output

# --- STAGE-BY-STAGE PROGRESSIVE PREPARATION QUESTIONS ---
@router.get("/tests/progressive-prep")
def get_progressive_prep_questions(
    target_job: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates preparation questions organized into Stage 1 (Simple), Stage 2 (Medium), and Stage 3 (High)."""
    if not target_job:
        target_job_obj = db.query(models.UserTargetJob).filter(
            models.UserTargetJob.user_id == current_user.id,
            models.UserTargetJob.is_primary == True
        ).first()
        target_job = target_job_obj.job_title if target_job_obj else "Python Developer"
        
    user_skills = [{"skill_name": s.skill_name, "proficiency": s.proficiency} for s in current_user.skills]
    gap = ai_engine.analyze_skill_gap(user_skills, target_job)

    return ai_engine.generate_progressive_preparation_questions(target_job=target_job)

@router.get("/tests/questions", response_model=List[schemas.QuestionDTO])
def get_test_questions(
    target_job: Optional[str] = None,
    module_name: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates test questions from AI Engine derived from roadmap missing skills and test completions."""
    if not target_job:
        target_job_obj = db.query(models.UserTargetJob).filter(
            models.UserTargetJob.user_id == current_user.id,
            models.UserTargetJob.is_primary == True
        ).first()
        target_job = target_job_obj.job_title if target_job_obj else "Python Developer"

    if not module_name:
        user_skills = [{"skill_name": s.skill_name, "proficiency": s.proficiency} for s in current_user.skills]
        gap = ai_engine.analyze_skill_gap(user_skills, target_job)
        
        # Extract completed test skills
        test_results = db.query(models.TestResult).filter(models.TestResult.user_id == current_user.id).all()
        completed_skills = set()
        for tr in test_results:
            if tr.strong_skills_json:
                try:
                    completed_skills.update(json.loads(tr.strong_skills_json))
                except Exception:
                    pass

        # Find candidate's PRESENT ONGOING ROADMAP MODULE (status == 'In Progress')
        roadmap_steps = ai_engine.generate_reskilling_roadmap(
            target_job=target_job,
            missing_skills=gap["missing_skills"],
            strong_skills=gap["strong_skills"],
            completed_test_skills=list(completed_skills)
        )
        
        ongoing_step = next((step for step in roadmap_steps if step.get("status") == "In Progress"), None)
        module_name = ongoing_step["skill"] if ongoing_step else "REST API Architecture"

    # AI Engine generated test questions targeting candidate's SPECIFIC ROADMAP MODULE
    questions = ai_engine.generate_ai_test_questions(target_job=target_job, ongoing_module=module_name)
    return questions

# --- AI MOCK INTERVIEW QUESTIONS ---
@router.get("/interview/questions")
def get_ai_interview_questions(
    target_job: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetches AI Engine generated interview questions progressing Easy -> Medium -> Hard."""
    if not target_job:
        target_job_obj = db.query(models.UserTargetJob).filter(
            models.UserTargetJob.user_id == current_user.id,
            models.UserTargetJob.is_primary == True
        ).first()
        target_job = target_job_obj.job_title if target_job_obj else "Python Developer"

    return ai_engine.generate_ai_interview_questions(target_job=target_job)

@router.post("/interview/message", response_model=schemas.InterviewFeedbackResponse)
def evaluate_interview_step(
    data: schemas.InterviewMessageRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview_pool = ai_engine.generate_ai_interview_questions(target_job=data.target_job)
    q_obj = interview_pool[min(data.question_index, len(interview_pool)-1)]
    current_q = q_obj["question"]
    
    eval_res = ai_engine.evaluate_mock_interview_answer(
        user_answer=data.message,
        interview_question=current_q,
        target_job=data.target_job
    )
    
    is_done = data.question_index >= len(interview_pool) - 1
    next_q = interview_pool[data.question_index + 1]["question"] if not is_done else None
    
    if is_done:
        res_obj = models.InterviewResult(
            user_id=current_user.id,
            target_job=data.target_job,
            technical_score=eval_res["technical_knowledge"],
            relevance_score=eval_res["relevance"],
            communication_score=eval_res["communication"],
            confidence_score=eval_res["confidence"],
            overall_score=eval_res["overall_score"],
            feedback_json=json.dumps(eval_res)
        )
        db.add(res_obj)
        db.commit()
        
    eval_res["next_question"] = next_q
    eval_res["is_completed"] = is_done
    return eval_res

# --- RESKILLING ROADMAP ---
@router.get("/roadmap", response_model=schemas.RoadmapResponse)
def get_roadmap(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    primary_job_obj = db.query(models.UserTargetJob).filter(
        models.UserTargetJob.user_id == current_user.id,
        models.UserTargetJob.is_primary == True
    ).first()
    target_job = primary_job_obj.job_title if primary_job_obj else "Python Developer"
    
    user_skills = [{"skill_name": s.skill_name, "proficiency": s.proficiency} for s in current_user.skills]
    gap = ai_engine.analyze_skill_gap(user_skills, target_job)
    
    # Extract completed test skills from TestResults
    test_results = db.query(models.TestResult).filter(models.TestResult.user_id == current_user.id).all()
    completed_skills = set()
    for tr in test_results:
        if tr.strong_skills_json:
            try:
                completed_skills.update(json.loads(tr.strong_skills_json))
            except Exception:
                pass

    steps = ai_engine.generate_reskilling_roadmap(
        target_job=target_job,
        missing_skills=gap["missing_skills"],
        strong_skills=gap["strong_skills"],
        completed_test_skills=list(completed_skills)
    )
    
    return {
        "target_job": target_job,
        "steps": steps,
        "updated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    }

# --- JOBS & MATCHING ---
@router.get("/jobs", response_model=List[schemas.JobDTO])
def get_job_recommendations(
    search: Optional[str] = None,
    remote_type: Optional[str] = None,
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    first_catalog = db.query(models.TargetJobCatalog).first()
    target_job = first_catalog.title if first_catalog else ""
    user_skills = set()
    
    if token:
        try:
            current_user = get_current_user(token, db)
            primary_job_obj = db.query(models.UserTargetJob).filter(
                models.UserTargetJob.user_id == current_user.id,
                models.UserTargetJob.is_primary == True
            ).first()
            if primary_job_obj:
                target_job = primary_job_obj.job_title
            user_skills = {s.skill_name for s in current_user.skills}
        except Exception:
            pass
    
    all_jobs = db.query(models.Job).all()
    results = []
    
    for j in all_jobs:
        if search and search.lower() not in j.title.lower() and search.lower() not in j.company.lower():
            continue
        if remote_type and remote_type != "All" and j.remote_type != remote_type:
            continue
            
        req_skills = json.loads(j.required_skills_json or "[]")
        matching = [s for s in req_skills if s in user_skills]
        missing = [s for s in req_skills if s not in user_skills]
        
        match_pct = (len(matching) / len(req_skills) * 100) if req_skills else 80.0
        if target_job.lower() in j.title.lower():
            match_pct = min(match_pct + 15.0, 98.0)
            
        match_pct = round(match_pct, 1)
        
        results.append({
            "id": j.id,
            "title": j.title,
            "company": j.company,
            "location": j.location,
            "experience_required": j.experience_required,
            "salary_range": j.salary_range,
            "remote_type": j.remote_type,
            "description": j.description,
            "required_skills": req_skills,
            "match_percentage": match_pct,
            "matching_skills": matching,
            "missing_skills": missing,
            "original_apply_url": j.original_apply_url,
            "is_demo": j.is_demo
        })
        
    results.sort(key=lambda x: x["match_percentage"], reverse=True)
    return results

# --- WORKFORCE RADAR MAP ---
@router.get("/workforce-radar", response_model=List[schemas.WorkforceLocationDTO])
def get_workforce_radar(db: Session = Depends(get_db)):
    locs = db.query(models.WorkforceLocation).all()
    return [
        {
            "id": l.id,
            "city": l.city,
            "country": l.country,
            "latitude": l.latitude,
            "longitude": l.longitude,
            "job_demand_level": l.job_demand_level,
            "skill_demand_level": l.skill_demand_level,
            "talent_availability_level": l.talent_availability_level,
            "skill_shortage_level": l.skill_shortage_level,
            "future_demand_level": l.future_demand_level,
            "top_skills": json.loads(l.top_skills_json or "[]")
        }
        for l in locs
    ]

# --- AI DOUBT CLARITY CHATBOT ---
@router.post("/chatbot/ask")
def ask_chatbot(
    request: schemas.ChatPromptRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    primary_job_obj = db.query(models.UserTargetJob).filter(
        models.UserTargetJob.user_id == current_user.id,
        models.UserTargetJob.is_primary == True
    ).first()
    target_job = primary_job_obj.job_title if primary_job_obj else "Python Developer"
    
    user_skills = [{"skill_name": s.skill_name, "proficiency": s.proficiency} for s in current_user.skills]
    gap = ai_engine.analyze_skill_gap(user_skills, target_job)
    readiness = ai_engine.calculate_job_readiness(user_skills, target_job)
    
    context = {
        "target_job": target_job,
        "readiness_score": readiness["overall_readiness"],
        "missing_skills": gap["missing_skills"],
        "current_page": request.current_page_context
    }
    
    answer_text = ai_engine.answer_chatbot_query(request.user_message, context)
    return {
        "answer": answer_text,
        "context_used": context,
        "timestamp": datetime.utcnow().strftime("%H:%M:%S")
    }

# --- AI AGENT ENGINES ---
@router.post("/ai-agent/generate-tests")
def agent_generate_test_suite(
    request: schemas.AgentGenerateTestRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI Agent endpoint that creates dynamic test questions, progressive prep stages, 
    and mock interview scenarios tailored specifically to candidate's chosen role.
    """
    role = request.role_title or "Python Developer"
    test_suite = ai_engine.generate_ai_agent_test_suite(
        role_title=role,
        skill_focus=request.skill_focus,
        difficulty=request.difficulty or "Medium"
    )
    return test_suite

@router.post("/ai-agent/generate-roadmap")
def agent_generate_roadmap(
    request: schemas.AgentGenerateRoadmapRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI Agent endpoint that builds a personalized reskilling roadmap with step-by-step milestones,
    timelines, priority levels, resources, and practice projects tailored to candidate's chosen role.
    """
    role = request.role_title or "Python Developer"
    user_skills = [{"skill_name": s.skill_name, "proficiency": s.proficiency} for s in current_user.skills]
    roadmap_res = ai_engine.generate_ai_agent_personalized_roadmap(
        role_title=role,
        user_skills=user_skills,
        focus_areas=request.focus_areas
    )
    return roadmap_res

