import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from seed_data import run_all_seeds
from api import router as api_router

# Create DB tables
Base.metadata.create_all(bind=engine)

# Seed database with demo catalog & market dataset
db = SessionLocal()
try:
    run_all_seeds(db)
finally:
    db.close()

app = FastAPI(
    title="AI Workforce Gap Radar API",
    description="Career intelligence platform API for skill gap analysis, job readiness scoring, reskilling roadmaps, and workforce radar.",
    version="1.0.0"
)

# CORS setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "AI Workforce Gap Radar",
        "tagline": "Know what skills you need before the job market changes.",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
