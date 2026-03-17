from sqlalchemy import Column, Integer, String, Text, DateTime, Float, JSON
from sqlalchemy.sql import func
from database import Base


class Syllabus(Base):
    __tablename__ = "syllabi"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    course_name = Column(String(255), default="")
    raw_text = Column(Text, nullable=False)
    extracted_skills = Column(JSON, default=list)
    created_at = Column(DateTime, server_default=func.now())


class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), default="Job Posting")
    raw_text = Column(Text, nullable=False)
    extracted_skills = Column(JSON, default=list)
    created_at = Column(DateTime, server_default=func.now())


class GapAnalysis(Base):
    __tablename__ = "gap_analyses"

    id = Column(Integer, primary_key=True, index=True)
    syllabus_ids = Column(JSON, default=list)
    job_posting_ids = Column(JSON, default=list)
    curriculum_skills = Column(JSON, default=list)
    industry_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    excess_skills = Column(JSON, default=list)
    overlap_skills = Column(JSON, default=list)
    readiness_score = Column(Float, default=0.0)
    student_report = Column(JSON, default=dict)
    faculty_report = Column(JSON, default=dict)
    created_at = Column(DateTime, server_default=func.now())
