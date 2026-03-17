"""
Skill Normalizer — Canonicalizes skill names to handle synonyms and abbreviations.
"""

from typing import List, Set

# Synonym mapping: alternative name -> canonical name
SYNONYMS = {
    "ml": "Machine Learning",
    "ai": "Artificial Intelligence",
    "dl": "Deep Learning",
    "nlp": "Natural Language Processing",
    "cv": "Computer Vision",
    "rl": "Reinforcement Learning",
    "oop": "Object-Oriented Programming",
    "fp": "Functional Programming",
    "dsa": "Data Structures",
    "ds": "Data Structures",
    "dbms": "Database Management",
    "rdbms": "Database Management",
    "os": "Operating Systems",
    "cn": "Computer Networks",
    "se": "Software Engineering",
    "sd": "System Design",
    "tdd": "TDD",
    "bdd": "BDD",
    "ci": "CI/CD",
    "cd": "CI/CD",
    "aws": "AWS",
    "gcp": "Google Cloud Platform",
    "k8s": "Kubernetes",
    "tf": "TensorFlow",
    "sk-learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "scikit learn": "Scikit-learn",
    "sci-kit learn": "Scikit-learn",
    "np": "NumPy",
    "pd": "Pandas",
    "plt": "Matplotlib",
    "js": "JavaScript",
    "ts": "TypeScript",
    "py": "Python",
    "rb": "Ruby",
    "cpp": "C++",
    "csharp": "C#",
    "c sharp": "C#",
    "node": "Node.js",
    "express": "Express.js",
    "react.js": "React",
    "reactjs": "React",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "angular.js": "Angular",
    "angularjs": "Angular",
    "next": "Next.js",
    "nextjs": "Next.js",
    "postgres": "PostgreSQL",
    "mongo": "MongoDB",
    "elastic search": "Elasticsearch",
    "es": "Elasticsearch",
    "rest": "REST APIs",
    "restful api": "REST APIs",
    "restful apis": "REST APIs",
    "rest api": "REST APIs",
    "graphql api": "GraphQL",
    "web sockets": "WebSockets",
    "web socket": "WebSockets",
    "object oriented programming": "Object-Oriented Programming",
    "object oriented": "Object-Oriented Programming",
    "machine learning model": "Machine Learning",
    "deep neural network": "Deep Learning",
    "deep neural networks": "Deep Learning",
    "convolutional neural network": "CNNs",
    "convolutional neural networks": "CNNs",
    "recurrent neural network": "RNNs",
    "recurrent neural networks": "RNNs",
    "generative ai": "Generative AI",
    "gen ai": "Generative AI",
    "genai": "Generative AI",
    "llm": "Large Language Models",
    "large language model": "Large Language Models",
    "version control system": "Version Control",
    "vcs": "Version Control",
    "responsive web design": "Responsive Design",
    "a/b test": "A/B Testing",
    "ab testing": "A/B Testing",
    "data science": "Data Science",
    "data analytics": "Data Analytics",
    "data analysis": "Data Analytics",
    "business intelligence": "Business Intelligence",
    "bi": "Business Intelligence",
}


def normalize_skills(skills: List[str]) -> List[str]:
    """
    Normalize a list of skills by resolving synonyms and standardizing names.
    Returns a deduplicated, sorted list of canonical skill names.
    """
    normalized: Set[str] = set()

    for skill in skills:
        skill_lower = skill.lower().strip()

        # Check if it's a known synonym
        if skill_lower in SYNONYMS:
            normalized.add(SYNONYMS[skill_lower])
        else:
            # Keep the original (already canonical from extractor)
            normalized.add(skill)

    return sorted(list(normalized))


def merge_skill_lists(*skill_lists: List[str]) -> List[str]:
    """Merge multiple skill lists into one deduplicated normalized list."""
    all_skills = []
    for sl in skill_lists:
        all_skills.extend(sl)
    return normalize_skills(all_skills)
