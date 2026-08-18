# SkillDemand AI (AI Workforce Gap Radar)

> **Know what skills you need before the job market changes.**

SkillDemand AI is an AI-powered workforce intelligence platform designed to assess technical skills dynamically, calculate transparent job readiness scores, analyze skill gaps, generate adaptive test questions & mock interview scenarios, build personalized reskilling roadmaps, and explore real-time workforce radar demand.

---

## 🚀 Features

- **🤖 AI Agent Test Question Generator**: Dynamically generates adaptive MCQs, progressive preparation stages, and AI mock interview scenarios tailored to candidate's chosen role & skill focus.
- **⚡ AI Agent Personalized Roadmap Generator**: Synthesizes step-by-step reskilling milestones with timelines, priorities, industry demand trends, curated resources, practice projects, and capstone assignments.
- **🎯 Job Readiness Engine**: Transparent 6-weighted-component readiness evaluation (Skills 35%, Technical Test 20%, Projects 15%, Experience 10%, Education 5%, Interview 15%).
- **📊 Workforce Demand Radar**: Interactive map tracking job demand, skill shortage levels, and future emerging skills across tech hubs.
- **💬 AI Doubt Clarity Chatbot**: Floating assistant providing real-time career guidance, technology explanations, and interview tips.

---

## 🛠 Tech Stack

- **Backend**: FastAPI (Python), SQLAlchemy, SQLite / PostgreSQL, Uvicorn, Pydantic, JWT Authentication.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, React Leaflet.

---

## 💻 Local Setup & Running

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install fastapi uvicorn sqlalchemy pydantic pyjwt passlib[bcrypt] python-multipart pypdf python-docx
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: `http://127.0.0.1:8000/docs`

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend web application will be live at: `http://127.0.0.1:5173`

---

## 🌐 Deployment Instructions

### Deploying Frontend (Vercel / Netlify / Render)
1. Import `https://github.com/Venkatadri9119/SkillDemand-AI.git`.
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`

### Deploying Backend (Render / Railway / Render Web Service)
1. Import `https://github.com/Venkatadri9119/SkillDemand-AI.git`.
2. Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 📄 License
MIT License &copy; 2026 SkillDemand AI.
