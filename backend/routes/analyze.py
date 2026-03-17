"""
Analyze Routes — Trigger gap analysis and retrieve results.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import Syllabus, JobPosting, GapAnalysis
from skill_normalizer import merge_skill_lists
from gap_analyzer import analyze_gap
from report_generator import generate_student_report, generate_faculty_report

router = APIRouter(prefix="/api", tags=["analyze"])


class AnalyzeRequest(BaseModel):
    syllabus_ids: List[int]
    job_posting_ids: List[int]


@router.post("/analyze")
def run_analysis(req: AnalyzeRequest, db: Session = Depends(get_db)):
    """Run gap analysis between selected syllabi and job postings."""
    # Fetch syllabi
    syllabi = db.query(Syllabus).filter(Syllabus.id.in_(req.syllabus_ids)).all()
    if not syllabi:
        raise HTTPException(status_code=404, detail="No syllabi found with given IDs")

    # Fetch job postings
    postings = db.query(JobPosting).filter(JobPosting.id.in_(req.job_posting_ids)).all()
    if not postings:
        raise HTTPException(status_code=404, detail="No job postings found with given IDs")

    # Merge all skills
    curriculum_skills = merge_skill_lists(*[s.extracted_skills or [] for s in syllabi])
    industry_skills = merge_skill_lists(*[p.extracted_skills or [] for p in postings])
    job_postings_skills = [p.extracted_skills or [] for p in postings]

    # Run gap analysis
    gap_result = analyze_gap(curriculum_skills, industry_skills)

    # Generate reports
    student_report = generate_student_report(gap_result, job_postings_skills)
    faculty_report = generate_faculty_report(gap_result, job_postings_skills)

    # Save analysis
    analysis = GapAnalysis(
        syllabus_ids=req.syllabus_ids,
        job_posting_ids=req.job_posting_ids,
        curriculum_skills=curriculum_skills,
        industry_skills=industry_skills,
        missing_skills=gap_result["missing_skills"],
        excess_skills=gap_result["excess_skills"],
        overlap_skills=gap_result["overlap"],
        readiness_score=gap_result["readiness_score"],
        student_report=student_report,
        faculty_report=faculty_report,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return {
        "id": analysis.id,
        "readiness_score": gap_result["readiness_score"],
        "gap_result": gap_result,
        "student_report": student_report,
        "faculty_report": faculty_report,
    }


@router.get("/analyses")
def list_analyses(db: Session = Depends(get_db)):
    """List all gap analyses."""
    analyses = db.query(GapAnalysis).order_by(GapAnalysis.created_at.desc()).all()
    return [
        {
            "id": a.id,
            "readiness_score": a.readiness_score,
            "missing_count": len(a.missing_skills) if a.missing_skills else 0,
            "overlap_count": len(a.overlap_skills) if a.overlap_skills else 0,
            "excess_count": len(a.excess_skills) if a.excess_skills else 0,
            "created_at": str(a.created_at),
        }
        for a in analyses
    ]


@router.get("/analysis/{analysis_id}")
def get_analysis(analysis_id: int, db: Session = Depends(get_db)):
    """Get detailed analysis result by ID."""
    analysis = db.query(GapAnalysis).filter(GapAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return {
        "id": analysis.id,
        "readiness_score": analysis.readiness_score,
        "curriculum_skills": analysis.curriculum_skills,
        "industry_skills": analysis.industry_skills,
        "missing_skills": analysis.missing_skills,
        "excess_skills": analysis.excess_skills,
        "overlap_skills": analysis.overlap_skills,
        "student_report": analysis.student_report,
        "faculty_report": analysis.faculty_report,
        "created_at": str(analysis.created_at),
    }
