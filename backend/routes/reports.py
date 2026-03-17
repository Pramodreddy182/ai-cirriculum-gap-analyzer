"""
Report Routes — Retrieve student and faculty reports.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import GapAnalysis, Syllabus, JobPosting

router = APIRouter(prefix="/api/report", tags=["reports"])


@router.get("/student/{analysis_id}")
def get_student_report(analysis_id: int, db: Session = Depends(get_db)):
    """Get student report for a specific analysis."""
    analysis = db.query(GapAnalysis).filter(GapAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis.student_report


@router.get("/faculty/{analysis_id}")
def get_faculty_report(analysis_id: int, db: Session = Depends(get_db)):
    """Get faculty report for a specific analysis."""
    analysis = db.query(GapAnalysis).filter(GapAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis.faculty_report


@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get aggregated stats for the dashboard."""
    total_syllabi = db.query(Syllabus).count()
    total_jobs = db.query(JobPosting).count()
    total_analyses = db.query(GapAnalysis).count()

    # Get latest analysis for overview
    latest = db.query(GapAnalysis).order_by(GapAnalysis.created_at.desc()).first()

    stats = {
        "total_syllabi": total_syllabi,
        "total_job_postings": total_jobs,
        "total_analyses": total_analyses,
        "latest_analysis": None,
    }

    if latest:
        stats["latest_analysis"] = {
            "id": latest.id,
            "readiness_score": latest.readiness_score,
            "missing_count": len(latest.missing_skills) if latest.missing_skills else 0,
            "overlap_count": len(latest.overlap_skills) if latest.overlap_skills else 0,
            "excess_count": len(latest.excess_skills) if latest.excess_skills else 0,
            "curriculum_skills": latest.curriculum_skills,
            "industry_skills": latest.industry_skills,
            "missing_skills": latest.missing_skills,
            "overlap_skills": latest.overlap_skills,
            "excess_skills": latest.excess_skills,
            "student_report": latest.student_report,
            "faculty_report": latest.faculty_report,
        }

    return stats
