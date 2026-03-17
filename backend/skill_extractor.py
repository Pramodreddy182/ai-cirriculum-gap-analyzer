"""
Skill Extractor — Keyword-based extraction from unstructured text.
Uses a comprehensive skill dictionary to identify tech skills from syllabi and job postings.
"""

import re
from typing import List


# Comprehensive skill dictionary organized by category
SKILL_DATABASE = {
    # Programming Languages
    "python": "Python",
    "java": "Java",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "c++": "C++",
    "c#": "C#",
    "ruby": "Ruby",
    "go": "Go",
    "golang": "Go",
    "rust": "Rust",
    "swift": "Swift",
    "kotlin": "Kotlin",
    "php": "PHP",
    "r": "R",
    "scala": "Scala",
    "perl": "Perl",
    "matlab": "MATLAB",
    "julia": "Julia",
    "dart": "Dart",
    "sql": "SQL",
    "bash": "Bash",
    "shell scripting": "Shell Scripting",
    "powershell": "PowerShell",
    "html": "HTML",
    "css": "CSS",
    "sass": "SASS",
    "less": "LESS",

    # Frameworks & Libraries
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "angular": "Angular",
    "angularjs": "Angular",
    "vue": "Vue.js",
    "vuejs": "Vue.js",
    "vue.js": "Vue.js",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "express": "Express.js",
    "expressjs": "Express.js",
    "django": "Django",
    "flask": "Flask",
    "fastapi": "FastAPI",
    "spring": "Spring",
    "spring boot": "Spring Boot",
    "rails": "Ruby on Rails",
    "ruby on rails": "Ruby on Rails",
    "laravel": "Laravel",
    ".net": ".NET",
    "dotnet": ".NET",
    "asp.net": "ASP.NET",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "keras": "Keras",
    "scikit-learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scipy": "SciPy",
    "matplotlib": "Matplotlib",
    "seaborn": "Seaborn",
    "plotly": "Plotly",
    "opencv": "OpenCV",
    "nltk": "NLTK",
    "spacy": "spaCy",
    "hugging face": "Hugging Face",
    "huggingface": "Hugging Face",
    "transformers": "Transformers",
    "langchain": "LangChain",
    "streamlit": "Streamlit",
    "gradio": "Gradio",
    "flutter": "Flutter",
    "react native": "React Native",
    "tailwind": "TailwindCSS",
    "tailwindcss": "TailwindCSS",
    "bootstrap": "Bootstrap",
    "jquery": "jQuery",

    # Databases
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mongodb": "MongoDB",
    "sqlite": "SQLite",
    "redis": "Redis",
    "cassandra": "Cassandra",
    "dynamodb": "DynamoDB",
    "neo4j": "Neo4j",
    "elasticsearch": "Elasticsearch",
    "firebase": "Firebase",
    "supabase": "Supabase",
    "oracle": "Oracle DB",
    "sql server": "SQL Server",
    "nosql": "NoSQL",

    # Cloud & DevOps
    "aws": "AWS",
    "amazon web services": "AWS",
    "azure": "Azure",
    "microsoft azure": "Azure",
    "gcp": "Google Cloud Platform",
    "google cloud": "Google Cloud Platform",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "jenkins": "Jenkins",
    "github actions": "GitHub Actions",
    "gitlab ci": "GitLab CI/CD",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "continuous integration": "CI/CD",
    "continuous deployment": "CI/CD",
    "nginx": "NGINX",
    "apache": "Apache",
    "linux": "Linux",
    "unix": "Unix",
    "heroku": "Heroku",
    "vercel": "Vercel",
    "netlify": "Netlify",
    "serverless": "Serverless",
    "microservices": "Microservices",

    # Data Science & ML
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "artificial intelligence": "Artificial Intelligence",
    "neural networks": "Neural Networks",
    "natural language processing": "Natural Language Processing",
    "nlp": "Natural Language Processing",
    "computer vision": "Computer Vision",
    "reinforcement learning": "Reinforcement Learning",
    "supervised learning": "Supervised Learning",
    "unsupervised learning": "Unsupervised Learning",
    "decision trees": "Decision Trees",
    "random forest": "Random Forest",
    "svm": "Support Vector Machines",
    "support vector": "Support Vector Machines",
    "logistic regression": "Logistic Regression",
    "linear regression": "Linear Regression",
    "gradient boosting": "Gradient Boosting",
    "xgboost": "XGBoost",
    "convolutional neural": "CNNs",
    "cnn": "CNNs",
    "recurrent neural": "RNNs",
    "rnn": "RNNs",
    "lstm": "LSTM",
    "gan": "GANs",
    "generative adversarial": "GANs",
    "transformer": "Transformer Architecture",
    "attention mechanism": "Attention Mechanism",
    "bert": "BERT",
    "gpt": "GPT",
    "large language model": "Large Language Models",
    "llm": "Large Language Models",
    "llms": "Large Language Models",
    "prompt engineering": "Prompt Engineering",
    "rag": "RAG",
    "retrieval augmented": "RAG",
    "fine-tuning": "Fine-tuning",
    "transfer learning": "Transfer Learning",
    "feature engineering": "Feature Engineering",
    "data preprocessing": "Data Preprocessing",
    "data cleaning": "Data Cleaning",
    "data wrangling": "Data Wrangling",
    "exploratory data analysis": "EDA",
    "eda": "EDA",
    "data visualization": "Data Visualization",
    "statistics": "Statistics",
    "probability": "Probability",
    "hypothesis testing": "Hypothesis Testing",
    "a/b testing": "A/B Testing",
    "time series": "Time Series Analysis",
    "dimensionality reduction": "Dimensionality Reduction",
    "pca": "PCA",
    "clustering": "Clustering",
    "k-means": "K-Means Clustering",
    "classification": "Classification",
    "regression": "Regression",
    "model deployment": "Model Deployment",
    "mlops": "MLOps",
    "mlflow": "MLflow",
    "kubeflow": "Kubeflow",
    "data pipeline": "Data Pipelines",
    "etl": "ETL",
    "data engineering": "Data Engineering",
    "big data": "Big Data",
    "hadoop": "Hadoop",
    "spark": "Apache Spark",
    "apache spark": "Apache Spark",
    "kafka": "Apache Kafka",
    "apache kafka": "Apache Kafka",
    "airflow": "Apache Airflow",
    "apache airflow": "Apache Airflow",
    "power bi": "Power BI",
    "tableau": "Tableau",
    "looker": "Looker",

    # Software Engineering Concepts
    "object-oriented programming": "Object-Oriented Programming",
    "oop": "Object-Oriented Programming",
    "functional programming": "Functional Programming",
    "data structures": "Data Structures",
    "algorithms": "Algorithms",
    "design patterns": "Design Patterns",
    "solid principles": "SOLID Principles",
    "clean code": "Clean Code",
    "test-driven development": "TDD",
    "tdd": "TDD",
    "unit testing": "Unit Testing",
    "integration testing": "Integration Testing",
    "end-to-end testing": "E2E Testing",
    "agile": "Agile",
    "scrum": "Scrum",
    "kanban": "Kanban",
    "devops": "DevOps",
    "git": "Git",
    "version control": "Version Control",
    "github": "GitHub",
    "gitlab": "GitLab",
    "bitbucket": "Bitbucket",
    "rest api": "REST APIs",
    "restful": "REST APIs",
    "graphql": "GraphQL",
    "grpc": "gRPC",
    "websocket": "WebSockets",
    "websockets": "WebSockets",
    "api design": "API Design",
    "system design": "System Design",
    "software architecture": "Software Architecture",
    "mvc": "MVC Pattern",
    "mvvm": "MVVM Pattern",
    "clean architecture": "Clean Architecture",
    "domain-driven design": "Domain-Driven Design",
    "event-driven": "Event-Driven Architecture",

    # Security
    "cybersecurity": "Cybersecurity",
    "cyber security": "Cybersecurity",
    "information security": "Information Security",
    "network security": "Network Security",
    "encryption": "Encryption",
    "authentication": "Authentication",
    "authorization": "Authorization",
    "oauth": "OAuth",
    "jwt": "JWT",
    "ssl": "SSL/TLS",
    "tls": "SSL/TLS",
    "penetration testing": "Penetration Testing",
    "vulnerability assessment": "Vulnerability Assessment",
    "owasp": "OWASP",

    # Other
    "blockchain": "Blockchain",
    "web3": "Web3",
    "smart contracts": "Smart Contracts",
    "solidity": "Solidity",
    "iot": "IoT",
    "internet of things": "IoT",
    "embedded systems": "Embedded Systems",
    "robotics": "Robotics",
    "ar/vr": "AR/VR",
    "augmented reality": "Augmented Reality",
    "virtual reality": "Virtual Reality",
    "cloud computing": "Cloud Computing",
    "edge computing": "Edge Computing",
    "quantum computing": "Quantum Computing",
    "distributed systems": "Distributed Systems",
    "parallel computing": "Parallel Computing",
    "operating systems": "Operating Systems",
    "computer networks": "Computer Networks",
    "networking": "Networking",
    "tcp/ip": "TCP/IP",
    "dns": "DNS",
    "http": "HTTP",
    "https": "HTTPS",
    "compiler design": "Compiler Design",
    "database management": "Database Management",
    "normalization": "Database Normalization",
    "indexing": "Database Indexing",
    "caching": "Caching",
    "load balancing": "Load Balancing",
    "monitoring": "Monitoring",
    "logging": "Logging",
    "observability": "Observability",
    "prometheus": "Prometheus",
    "grafana": "Grafana",
    "jira": "Jira",
    "confluence": "Confluence",
    "figma": "Figma",
    "ui/ux": "UI/UX Design",
    "responsive design": "Responsive Design",
    "accessibility": "Web Accessibility",
    "seo": "SEO",
    "webpack": "Webpack",
    "vite": "Vite",
    "babel": "Babel",
    "eslint": "ESLint",
    "prettier": "Prettier",
}

# Skill categories for grouping in reports
SKILL_CATEGORIES = {
    "Programming Languages": [
        "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Ruby", "Go",
        "Rust", "Swift", "Kotlin", "PHP", "R", "Scala", "MATLAB", "Julia", "Dart",
        "SQL", "Bash", "Shell Scripting", "PowerShell", "HTML", "CSS", "SASS", "LESS",
    ],
    "Frameworks & Libraries": [
        "React", "Angular", "Vue.js", "Next.js", "Node.js", "Express.js", "Django",
        "Flask", "FastAPI", "Spring", "Spring Boot", "Ruby on Rails", "Laravel",
        ".NET", "ASP.NET", "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Pandas",
        "NumPy", "SciPy", "Matplotlib", "Seaborn", "Plotly", "OpenCV", "NLTK", "spaCy",
        "Hugging Face", "Transformers", "LangChain", "Streamlit", "Gradio", "Flutter",
        "React Native", "TailwindCSS", "Bootstrap", "jQuery",
    ],
    "Data Science & ML": [
        "Machine Learning", "Deep Learning", "Artificial Intelligence", "Neural Networks",
        "Natural Language Processing", "Computer Vision", "Reinforcement Learning",
        "Supervised Learning", "Unsupervised Learning", "Decision Trees", "Random Forest",
        "Support Vector Machines", "CNNs", "RNNs", "LSTM", "GANs",
        "Transformer Architecture", "BERT", "GPT", "Large Language Models",
        "Prompt Engineering", "RAG", "Fine-tuning", "Transfer Learning",
        "Feature Engineering", "Data Preprocessing", "EDA", "Data Visualization",
        "Statistics", "Probability", "Time Series Analysis", "Clustering",
        "Classification", "Regression", "Model Deployment", "MLOps", "MLflow",
    ],
    "Cloud & DevOps": [
        "AWS", "Azure", "Google Cloud Platform", "Docker", "Kubernetes", "Terraform",
        "Ansible", "Jenkins", "GitHub Actions", "GitLab CI/CD", "CI/CD", "NGINX",
        "Linux", "Heroku", "Vercel", "Serverless", "Microservices",
    ],
    "Databases": [
        "MySQL", "PostgreSQL", "MongoDB", "SQLite", "Redis", "Cassandra", "DynamoDB",
        "Neo4j", "Elasticsearch", "Firebase", "Supabase", "Oracle DB", "SQL Server", "NoSQL",
    ],
    "Software Engineering": [
        "Object-Oriented Programming", "Functional Programming", "Data Structures",
        "Algorithms", "Design Patterns", "SOLID Principles", "Clean Code", "TDD",
        "Unit Testing", "Integration Testing", "E2E Testing", "Agile", "Scrum",
        "DevOps", "Git", "Version Control", "REST APIs", "GraphQL", "gRPC",
        "WebSockets", "API Design", "System Design", "Software Architecture",
    ],
    "Security": [
        "Cybersecurity", "Information Security", "Network Security", "Encryption",
        "Authentication", "Authorization", "OAuth", "JWT", "SSL/TLS",
        "Penetration Testing", "OWASP",
    ],
}


def extract_skills(text: str) -> List[str]:
    """
    Extract skills from unstructured text using keyword matching.
    Returns a deduplicated list of canonical skill names.
    """
    if not text:
        return []

    text_lower = text.lower()
    found_skills = set()

    # Sort skill keywords by length (longest first) to match multi-word phrases first
    sorted_keywords = sorted(SKILL_DATABASE.keys(), key=len, reverse=True)

    for keyword in sorted_keywords:
        canonical = SKILL_DATABASE[keyword]
        if canonical in found_skills:
            continue

        # Use word boundary matching for short keywords to avoid false positives
        if len(keyword) <= 3:
            pattern = r'\b' + re.escape(keyword) + r'\b'
            if re.search(pattern, text_lower):
                found_skills.add(canonical)
        else:
            if keyword in text_lower:
                found_skills.add(canonical)

    return sorted(list(found_skills))


def get_skill_category(skill: str) -> str:
    """Return the category for a given skill."""
    for category, skills in SKILL_CATEGORIES.items():
        if skill in skills:
            return category
    return "Other"


def categorize_skills(skills: List[str]) -> dict:
    """Group skills by category."""
    categorized = {}
    for skill in skills:
        cat = get_skill_category(skill)
        if cat not in categorized:
            categorized[cat] = []
        categorized[cat].append(skill)
    return categorized
