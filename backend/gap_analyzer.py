"""
Gap Analyzer — Compares curriculum skills vs industry skills and computes gaps.
"""

from typing import List, Dict, Any
from skill_extractor import categorize_skills


def analyze_gap(curriculum_skills: List[str], industry_skills: List[str]) -> Dict[str, Any]:
    """
    Compare curriculum skills with industry skills.
    Returns missing, excess, overlap, and readiness score.
    """
    curriculum_set = set(curriculum_skills)
    industry_set = set(industry_skills)

    overlap = sorted(list(curriculum_set & industry_set))
    missing = sorted(list(industry_set - curriculum_set))  # In industry, not in curriculum
    excess = sorted(list(curriculum_set - industry_set))   # In curriculum, not in industry

    # Readiness score: percentage of industry skills covered
    if len(industry_set) > 0:
        readiness_score = round((len(overlap) / len(industry_set)) * 100, 1)
    else:
        readiness_score = 100.0

    return {
        "curriculum_skills": sorted(list(curriculum_set)),
        "industry_skills": sorted(list(industry_set)),
        "overlap": overlap,
        "missing_skills": missing,
        "excess_skills": excess,
        "readiness_score": readiness_score,
        "total_curriculum": len(curriculum_set),
        "total_industry": len(industry_set),
        "total_overlap": len(overlap),
        "total_missing": len(missing),
        "total_excess": len(excess),
        "missing_by_category": categorize_skills(missing),
        "overlap_by_category": categorize_skills(overlap),
        "excess_by_category": categorize_skills(excess),
    }


def compute_priority_scores(missing_skills: List[str], job_postings_skills: List[List[str]]) -> List[Dict[str, Any]]:
    """
    Rank missing skills by how frequently they appear in job postings.
    Returns sorted list with skill name, frequency, and priority level.
    """
    frequency = {}
    total_postings = len(job_postings_skills)

    for posting_skills in job_postings_skills:
        for skill in posting_skills:
            if skill in missing_skills:
                frequency[skill] = frequency.get(skill, 0) + 1

    priority_list = []
    for skill in missing_skills:
        count = frequency.get(skill, 0)
        pct = round((count / total_postings) * 100, 1) if total_postings > 0 else 0

        if pct >= 60:
            priority = "Critical"
        elif pct >= 30:
            priority = "High"
        elif pct >= 10:
            priority = "Medium"
        else:
            priority = "Low"

        priority_list.append({
            "skill": skill,
            "demand_count": count,
            "demand_percentage": pct,
            "priority": priority,
        })

    # Sort by demand_count descending
    priority_list.sort(key=lambda x: x["demand_count"], reverse=True)
    return priority_list
