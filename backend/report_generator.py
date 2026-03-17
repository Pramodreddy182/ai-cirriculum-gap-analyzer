"""
Report Generator — Produces structured reports for students and faculty.
"""

from typing import List, Dict, Any
from skill_extractor import get_skill_category, categorize_skills
from gap_analyzer import compute_priority_scores


# Learning resource suggestions for common skills
LEARNING_RESOURCES = {
    "Docker": {"type": "Course", "resource": "Docker Mastery on Udemy", "difficulty": "Intermediate"},
    "Kubernetes": {"type": "Course", "resource": "Kubernetes for Developers on Coursera", "difficulty": "Advanced"},
    "CI/CD": {"type": "Tutorial", "resource": "GitHub Actions Documentation", "difficulty": "Intermediate"},
    "MLOps": {"type": "Course", "resource": "MLOps Specialization on Coursera", "difficulty": "Advanced"},
    "MLflow": {"type": "Documentation", "resource": "MLflow Official Docs", "difficulty": "Intermediate"},
    "FastAPI": {"type": "Tutorial", "resource": "FastAPI Official Tutorial", "difficulty": "Beginner"},
    "React": {"type": "Course", "resource": "React Documentation + Tutorial", "difficulty": "Intermediate"},
    "AWS": {"type": "Certification", "resource": "AWS Cloud Practitioner", "difficulty": "Intermediate"},
    "Azure": {"type": "Certification", "resource": "Azure Fundamentals AZ-900", "difficulty": "Beginner"},
    "Google Cloud Platform": {"type": "Certification", "resource": "GCP Associate Cloud Engineer", "difficulty": "Intermediate"},
    "TensorFlow": {"type": "Course", "resource": "TensorFlow Developer Certificate", "difficulty": "Advanced"},
    "PyTorch": {"type": "Course", "resource": "Deep Learning with PyTorch on Coursera", "difficulty": "Advanced"},
    "Machine Learning": {"type": "Course", "resource": "Andrew Ng's ML Specialization", "difficulty": "Intermediate"},
    "Deep Learning": {"type": "Course", "resource": "Deep Learning Specialization on Coursera", "difficulty": "Advanced"},
    "Natural Language Processing": {"type": "Course", "resource": "NLP Specialization on Coursera", "difficulty": "Advanced"},
    "System Design": {"type": "Book", "resource": "Designing Data-Intensive Applications", "difficulty": "Advanced"},
    "Git": {"type": "Tutorial", "resource": "Pro Git Book (free)", "difficulty": "Beginner"},
    "REST APIs": {"type": "Tutorial", "resource": "RESTful API Design Guide", "difficulty": "Intermediate"},
    "GraphQL": {"type": "Tutorial", "resource": "GraphQL Official Learn", "difficulty": "Intermediate"},
    "Data Structures": {"type": "Course", "resource": "Data Structures & Algorithms on LeetCode", "difficulty": "Intermediate"},
    "Algorithms": {"type": "Course", "resource": "Algorithms Specialization on Coursera", "difficulty": "Intermediate"},
    "Large Language Models": {"type": "Course", "resource": "LLM University by Cohere", "difficulty": "Advanced"},
    "Prompt Engineering": {"type": "Course", "resource": "ChatGPT Prompt Engineering for Developers", "difficulty": "Beginner"},
}


def generate_student_report(
    gap_result: Dict[str, Any],
    job_postings_skills: List[List[str]],
) -> Dict[str, Any]:
    """
    Generate a personalized report for students.
    Includes readiness score, prioritized missing skills, and learning resources.
    """
    missing = gap_result["missing_skills"]
    priority_skills = compute_priority_scores(missing, job_postings_skills)

    # Attach learning resources
    recommendations = []
    for ps in priority_skills:
        skill_name = ps["skill"]
        resource = LEARNING_RESOURCES.get(skill_name, {
            "type": "Self-study",
            "resource": f"Search for {skill_name} tutorials online",
            "difficulty": "Varies",
        })
        recommendations.append({
            **ps,
            "learning_resource": resource,
            "category": get_skill_category(skill_name),
        })

    return {
        "readiness_score": gap_result["readiness_score"],
        "total_industry_skills": gap_result["total_industry"],
        "skills_you_have": gap_result["overlap"],
        "skills_you_need": recommendations,
        "total_missing": len(missing),
        "critical_gaps": [r for r in recommendations if r["priority"] == "Critical"],
        "high_priority": [r for r in recommendations if r["priority"] == "High"],
        "summary": _generate_student_summary(gap_result, recommendations),
    }


def generate_faculty_report(
    gap_result: Dict[str, Any],
    job_postings_skills: List[List[str]],
    syllabi_data: List[Dict] = None,
) -> Dict[str, Any]:
    """
    Generate a report for faculty with course update suggestions.
    """
    missing = gap_result["missing_skills"]
    priority_skills = compute_priority_scores(missing, job_postings_skills)
    missing_by_category = gap_result["missing_by_category"]

    # Generate course update suggestions
    suggestions = []
    for category, skills in missing_by_category.items():
        suggestion = {
            "category": category,
            "missing_skills": skills,
            "recommendation": _generate_course_suggestion(category, skills),
            "impact": "High" if len(skills) >= 3 else "Medium" if len(skills) >= 1 else "Low",
        }
        suggestions.append(suggestion)

    # Sort by number of missing skills in category
    suggestions.sort(key=lambda x: len(x["missing_skills"]), reverse=True)

    return {
        "readiness_score": gap_result["readiness_score"],
        "total_curriculum_skills": gap_result["total_curriculum"],
        "total_industry_skills": gap_result["total_industry"],
        "curriculum_coverage": f"{gap_result['total_overlap']}/{gap_result['total_industry']}",
        "skills_already_taught": gap_result["overlap"],
        "skills_not_in_demand": gap_result["excess_skills"],
        "course_update_suggestions": suggestions,
        "priority_additions": [ps for ps in priority_skills if ps["priority"] in ("Critical", "High")],
        "summary": _generate_faculty_summary(gap_result, suggestions),
    }


def _generate_student_summary(gap_result: Dict, recommendations: List) -> str:
    score = gap_result["readiness_score"]
    missing_count = gap_result["total_missing"]
    critical = sum(1 for r in recommendations if r["priority"] == "Critical")

    if score >= 80:
        level = "well-prepared"
    elif score >= 60:
        level = "moderately prepared"
    elif score >= 40:
        level = "underprepared"
    else:
        level = "significantly underprepared"

    summary = f"Based on the analysis, you are {level} for the current job market "
    summary += f"with a readiness score of {score}%. "
    summary += f"You are missing {missing_count} skills that employers are looking for"

    if critical > 0:
        summary += f", with {critical} being critical gaps that should be addressed immediately"

    summary += "."
    return summary


def _generate_faculty_summary(gap_result: Dict, suggestions: List) -> str:
    score = gap_result["readiness_score"]
    missing = gap_result["total_missing"]
    excess = gap_result["total_excess"]

    summary = f"The curriculum covers {score}% of the skills demanded by the industry. "
    summary += f"There are {missing} skills missing from the curriculum that employers frequently require. "

    if excess > 0:
        summary += f"Additionally, {excess} skills are taught but not prominently requested in current job postings. "

    summary += f"There are {len(suggestions)} areas with suggested course updates."
    return summary


def _generate_course_suggestion(category: str, skills: List[str]) -> str:
    """Generate a specific course update suggestion for a category."""
    skill_list = ", ".join(skills[:5])
    suggestions_map = {
        "Cloud & DevOps": f"Add a practical DevOps/Cloud module covering {skill_list}. Consider hands-on labs with containerization and CI/CD pipelines.",
        "Data Science & ML": f"Update ML curriculum to include modern topics: {skill_list}. Add projects using real-world datasets and current industry tools.",
        "Frameworks & Libraries": f"Introduce workshops on industry-standard frameworks: {skill_list}. Focus on building full-stack projects.",
        "Programming Languages": f"Add elective courses or workshops for in-demand languages: {skill_list}.",
        "Databases": f"Expand database curriculum to cover: {skill_list}. Include NoSQL and cloud database services.",
        "Software Engineering": f"Strengthen software engineering practices: {skill_list}. Emphasize industry workflows and collaboration tools.",
        "Security": f"Add cybersecurity modules covering: {skill_list}. Include practical security assessment exercises.",
    }

    return suggestions_map.get(
        category,
        f"Consider adding the following in-demand skills to relevant courses: {skill_list}."
    )
