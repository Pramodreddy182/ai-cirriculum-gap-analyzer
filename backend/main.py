"""
AI Curriculum Gap Analyzer — FastAPI Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import upload, analyze, reports

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Curriculum Gap Analyzer",
    description="Analyze gaps between university curricula and industry job requirements",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router)
app.include_router(analyze.router)
app.include_router(reports.router)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "AI Curriculum Gap Analyzer"}


@app.get("/")
def root():
    return {
        "message": "AI Curriculum Gap Analyzer API",
        "docs": "/docs",
        "health": "/health",
    }
