"""
Upload Routes — Handle syllabus and job posting uploads.
"""

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Syllabus, JobPosting
from pdf_parser import extract_text
from skill_extractor import extract_skills
from skill_normalizer import normalize_skills
from typing import Optional
import json

router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("/syllabus")
async def upload_syllabus(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    course_name: Optional[str] = Form("Uploaded Course"),
    db: Session = Depends(get_db),
):
    """Upload a syllabus PDF or text. Extract and normalize skills."""
    if file:
        file_bytes = await file.read()
        raw_text = extract_text(file_bytes, file.filename)
        filename = file.filename
    elif text:
        raw_text = text
        filename = "text_input.txt"
    else:
        raise HTTPException(status_code=400, detail="Provide either a file or text")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted")

    # Extract and normalize skills
    raw_skills = extract_skills(raw_text)
    normalized = normalize_skills(raw_skills)

    syllabus = Syllabus(
        filename=filename,
        course_name=course_name,
        raw_text=raw_text,
        extracted_skills=normalized,
    )
    db.add(syllabus)
    db.commit()
    db.refresh(syllabus)

    return {
        "id": syllabus.id,
        "filename": syllabus.filename,
        "course_name": syllabus.course_name,
        "extracted_skills": syllabus.extracted_skills,
        "skill_count": len(syllabus.extracted_skills),
    }


@router.post("/jobs")
async def upload_job_postings(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    title: Optional[str] = Form("Job Posting"),
    db: Session = Depends(get_db),
):
    """Upload job postings as text, JSON, or file."""
    if file:
        file_bytes = await file.read()
        raw_text = extract_text(file_bytes, file.filename)
        # Try to parse as JSON for structured postings
        try:
            data = json.loads(raw_text)
            if isinstance(data, list):
                results = []
                for item in data:
                    posting_text = item.get("description", "") or item.get("text", "") or str(item)
                    posting_title = item.get("title", title)
                    raw_skills = extract_skills(posting_text)
                    normalized = normalize_skills(raw_skills)
                    posting = JobPosting(
                        title=posting_title,
                        raw_text=posting_text,
                        extracted_skills=normalized,
                    )
                    db.add(posting)
                    db.commit()
                    db.refresh(posting)
                    results.append({
                        "id": posting.id,
                        "title": posting.title,
                        "extracted_skills": posting.extracted_skills,
                        "skill_count": len(posting.extracted_skills),
                    })
                return {"postings": results, "count": len(results)}
            else:
                raw_text = data.get("description", "") or data.get("text", "") or str(data)
                title = data.get("title", title)
        except (json.JSONDecodeError, AttributeError):
            pass
    elif text:
        raw_text = text
    else:
        raise HTTPException(status_code=400, detail="Provide either a file or text")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted")

    raw_skills = extract_skills(raw_text)
    normalized = normalize_skills(raw_skills)

    posting = JobPosting(
        title=title,
        raw_text=raw_text,
        extracted_skills=normalized,
    )
    db.add(posting)
    db.commit()
    db.refresh(posting)

    return {
        "id": posting.id,
        "title": posting.title,
        "extracted_skills": posting.extracted_skills,
        "skill_count": len(posting.extracted_skills),
    }


@router.get("/syllabi")
def list_syllabi(db: Session = Depends(get_db)):
    """List all uploaded syllabi."""
    syllabi = db.query(Syllabus).order_by(Syllabus.created_at.desc()).all()
    return [
        {
            "id": s.id,
            "filename": s.filename,
            "course_name": s.course_name,
            "skill_count": len(s.extracted_skills) if s.extracted_skills else 0,
            "skills": s.extracted_skills,
            "created_at": str(s.created_at),
        }
        for s in syllabi
    ]


@router.get("/jobs")
def list_job_postings(db: Session = Depends(get_db)):
    """List all uploaded job postings."""
    postings = db.query(JobPosting).order_by(JobPosting.created_at.desc()).all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "skill_count": len(p.extracted_skills) if p.extracted_skills else 0,
            "skills": p.extracted_skills,
            "created_at": str(p.created_at),
        }
        for p in postings
    ]
