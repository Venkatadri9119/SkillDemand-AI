import json
from sqlalchemy.orm import Session
import models

def seed_target_jobs(db: Session):
    db.query(models.TargetJobCatalog).delete()
    
    catalog = [
        {
            "title": "Python Developer",
            "description": "Design and maintain high-performance backend microservices, REST APIs, and database pipelines using Python, FastAPI, Django, and PostgreSQL.",
            "required_skills": ["Python", "SQL", "Django", "REST API", "Docker", "Git", "PostgreSQL", "FastAPI"],
            "recommended_experience": "0-3 years"
        },
        {
            "title": "Java Developer",
            "description": "Build high-throughput, enterprise-grade backend systems and distributed microservices using Java 17+, Spring Boot, SQL, and Kafka.",
            "required_skills": ["Java", "SQL", "REST API", "Git", "Data Structures & Algorithms", "Docker", "PostgreSQL"],
            "recommended_experience": "1-3 years"
        },
        {
            "title": "Web Developer",
            "description": "Engineer modern, accessible, responsive web applications and user interfaces using React, TypeScript, Tailwind CSS, and Node.js REST APIs.",
            "required_skills": ["React", "JavaScript", "TypeScript", "HTML/CSS", "REST API", "Git", "Node.js"],
            "recommended_experience": "0-2 years"
        },
        {
            "title": "Data Analyst",
            "description": "Extract data insights, build executive dashboards, perform SQL statistical queries, and model market trends with Python and Pandas.",
            "required_skills": ["Python", "SQL", "Pandas", "NumPy", "Git"],
            "recommended_experience": "0-2 years"
        },
        {
            "title": "AI/ML Engineer",
            "description": "Train, evaluate, and deploy machine learning models, neural networks, PyTorch pipelines, and LLM applications at scale.",
            "required_skills": ["Python", "Machine Learning", "PyTorch", "Pandas", "NumPy", "SQL", "Git", "REST API"],
            "recommended_experience": "1-4 years"
        },
        {
            "title": "Cloud Engineer",
            "description": "Architect cloud-native infrastructure, automate CI/CD pipelines, and manage container orchestration using AWS, Docker, and Kubernetes.",
            "required_skills": ["AWS", "Docker", "Kubernetes", "Linux", "CI/CD", "Git", "Python"],
            "recommended_experience": "1-3 years"
        },
        {
            "title": "Software Developer",
            "description": "Generalist software engineer handling core Computer Science algorithms, object-oriented software design, databases, and system scalability.",
            "required_skills": ["Python", "Java", "SQL", "Git", "Data Structures & Algorithms", "REST API", "System Design"],
            "recommended_experience": "0-3 years"
        }
    ]
    
    for item in catalog:
        job_cat = models.TargetJobCatalog(
            title=item["title"],
            description=item["description"],
            required_skills_json=json.dumps(item["required_skills"]),
            recommended_experience=item["recommended_experience"]
        )
        db.add(job_cat)
    db.commit()

def seed_questions(db: Session):
    db.query(models.Question).delete()
    
    questions = [
        # --- Python Developer Question Pool ---
        {
            "target_job": "Python Developer",
            "question_text": "Which built-in Python data structure guarantees insertion order preserving unique items in modern Python?",
            "option_a": "Set",
            "option_b": "Dictionary (dict keys in Python 3.7+)",
            "option_c": "Tuple",
            "option_d": "Frozenset",
            "correct_option": "B",
            "category": "Python",
            "difficulty": "Easy"
        },
        {
            "target_job": "Python Developer",
            "question_text": "How does Python handle asynchronous execution under the hood using asyncio?",
            "option_a": "True OS-level multi-core hardware threading",
            "option_b": "Single-threaded event loop utilizing non-blocking coroutines",
            "option_c": "C-extension process spawning",
            "option_d": "GPU thread scheduling",
            "correct_option": "B",
            "category": "Python",
            "difficulty": "Hard"
        },
        {
            "target_job": "Python Developer",
            "question_text": "What HTTP method should be used to partially update an existing resource in a REST API?",
            "option_a": "POST",
            "option_b": "PUT",
            "option_c": "PATCH",
            "option_d": "DELETE",
            "correct_option": "C",
            "category": "REST API",
            "difficulty": "Medium"
        },
        {
            "target_job": "Python Developer",
            "question_text": "What is the primary purpose of a Python decorator (@decorator)?",
            "option_a": "To delete unused memory objects",
            "option_b": "To modify or enhance function behavior without altering source code",
            "option_c": "To convert Python to C++ source",
            "option_d": "To encrypt backend database queries",
            "correct_option": "B",
            "category": "Python",
            "difficulty": "Medium"
        },
        {
            "target_job": "Python Developer",
            "question_text": "In Python list comprehensions, what is the correct syntax to filter even numbers?",
            "option_a": "[x for x in nums if x % 2 == 0]",
            "option_b": "[x if x % 2 == 0 for x in nums]",
            "option_c": "[x for x in nums where x % 2 == 0]",
            "option_d": "filter(nums, x % 2 == 0)",
            "correct_option": "A",
            "category": "Python",
            "difficulty": "Easy"
        },
        {
            "target_job": "Python Developer",
            "question_text": "What is the GIL (Global Interpreter Lock) in CPython?",
            "option_a": "A lock enabling multi-core parallel execution of Python bytecode",
            "option_b": "A mutex allowing only one native thread to execute Python bytecode at a time",
            "option_c": "A database locking mechanism",
            "option_d": "An encryption protocol for REST APIs",
            "correct_option": "B",
            "category": "Python",
            "difficulty": "Hard"
        },
        {
            "target_job": "Python Developer",
            "question_text": "What is the primary function of Docker containerization in backend engineering?",
            "option_a": "To replace source control management like Git",
            "option_b": "To package applications with all OS dependencies for consistent execution across environments",
            "option_c": "To compile Python source code into machine binary assembly",
            "option_d": "To encrypt relational database tables",
            "correct_option": "B",
            "category": "Docker",
            "difficulty": "Easy"
        },
        {
            "target_job": "Python Developer",
            "question_text": "In SQL databases like PostgreSQL, which clause filters records after aggregation by GROUP BY?",
            "option_a": "WHERE",
            "option_b": "HAVING",
            "option_c": "ORDER BY",
            "option_d": "LIMIT",
            "correct_option": "B",
            "category": "SQL",
            "difficulty": "Medium"
        },
        {
            "target_job": "Python Developer",
            "question_text": "What is the function of a database index in PostgreSQL?",
            "option_a": "To automatically compress stored tables",
            "option_b": "To speed up query search retrieval times at the cost of additional write overhead",
            "option_c": "To prevent foreign key references",
            "option_d": "To encrypt table columns",
            "correct_option": "B",
            "category": "PostgreSQL",
            "difficulty": "Medium"
        },

        # --- Java Developer Question Pool ---
        {
            "target_job": "Java Developer",
            "question_text": "In Java 17+, how does a 'record' class differ from a standard class?",
            "option_a": "Records are mutable data models with automatic getters and setters",
            "option_b": "Records are immutable data carriers with auto-generated constructor, equals(), hashCode(), and toString()",
            "option_c": "Records cannot implement interfaces",
            "option_d": "Records can extend other concrete classes",
            "correct_option": "B",
            "category": "Java",
            "difficulty": "Medium"
        },
        {
            "target_job": "Java Developer",
            "question_text": "Which Spring Boot annotation marks a class as a RESTful controller returning JSON responses?",
            "option_a": "@Controller",
            "option_b": "@RestController",
            "option_c": "@Service",
            "option_d": "@Component",
            "correct_option": "B",
            "category": "REST API",
            "difficulty": "Easy"
        },
        {
            "target_job": "Java Developer",
            "question_text": "What memory region in the JVM stores runtime object instances?",
            "option_a": "Stack Memory",
            "option_b": "Heap Memory",
            "option_c": "Metaspace",
            "option_d": "Program Counter Register",
            "correct_option": "B",
            "category": "Java",
            "difficulty": "Medium"
        },

        # --- Web Developer Question Pool ---
        {
            "target_job": "Web Developer",
            "question_text": "Which React hook executes side-effects after DOM render cycles?",
            "option_a": "useState",
            "option_b": "useEffect",
            "option_c": "useContext",
            "option_d": "useRef",
            "correct_option": "B",
            "category": "React",
            "difficulty": "Easy"
        },
        {
            "target_job": "Web Developer",
            "question_text": "What key advantage does TypeScript provide over standard JavaScript?",
            "option_a": "Faster browser DOM execution speed",
            "option_b": "Static type checking at compile time to catch bugs early",
            "option_c": "Automatic CSS generation",
            "option_d": "Built-in database ORM engine",
            "correct_option": "B",
            "category": "TypeScript",
            "difficulty": "Easy"
        },
        {
            "target_job": "Web Developer",
            "question_text": "What is the Virtual DOM in React?",
            "option_a": "A lightweight JavaScript representation of the actual browser DOM used for efficient reconciliation diffing",
            "option_b": "A browser hardware acceleration API",
            "option_c": "A database cache layer",
            "option_d": "A CSS preprocessor",
            "correct_option": "A",
            "category": "React",
            "difficulty": "Medium"
        },

        # --- AI/ML Engineer Question Pool ---
        {
            "target_job": "AI/ML Engineer",
            "question_text": "Which metric is most appropriate for evaluating a binary classification model on highly imbalanced data?",
            "option_a": "Accuracy",
            "option_b": "F1-Score / PR-AUC",
            "option_c": "Mean Absolute Error",
            "option_d": "R-Squared",
            "correct_option": "B",
            "category": "Machine Learning",
            "difficulty": "Medium"
        },
        {
            "target_job": "AI/ML Engineer",
            "question_text": "In PyTorch, what method call computes gradients during backpropagation?",
            "option_a": "tensor.backward()",
            "option_b": "tensor.grad()",
            "option_c": "tensor.step()",
            "option_d": "tensor.zero_grad()",
            "correct_option": "A",
            "category": "PyTorch",
            "difficulty": "Medium"
        },
        {
            "target_job": "AI/ML Engineer",
            "question_text": "What is the primary role of an activation function in artificial neural networks?",
            "option_a": "To normalize input data features",
            "option_b": "To introduce non-linearity enabling networks to learn complex non-linear patterns",
            "option_c": "To prevent GPU memory overflow",
            "option_d": "To calculate learning rate decay",
            "correct_option": "B",
            "category": "Machine Learning",
            "difficulty": "Medium"
        }
    ]
    
    for q in questions:
        q_obj = models.Question(
            target_job=q["target_job"],
            question_text=q["question_text"],
            option_a=q["option_a"],
            option_b=q["option_b"],
            option_c=q["option_c"],
            option_d=q["option_d"],
            correct_option=q["correct_option"],
            category=q["category"],
            difficulty=q["difficulty"]
        )
        db.add(q_obj)
    db.commit()

def seed_jobs(db: Session):
    db.query(models.Job).delete()
    
    jobs = [
        {
            "title": "Software Engineer - Backend (Python / FastAPI)",
            "company": "Stripe",
            "location": "San Francisco, CA, USA / Remote",
            "experience_required": "1-3 years",
            "salary_range": "$170,000 - $220,000 / year",
            "remote_type": "Remote",
            "industry": "Fintech / Payment Processing",
            "description": "Join Stripe's core infrastructure team building microservices using Python, FastAPI, PostgreSQL, and distributed caching to power global commerce.",
            "required_skills": ["Python", "SQL", "FastAPI", "REST API", "Docker", "PostgreSQL", "Git"],
            "original_apply_url": "https://stripe.com/jobs/search?q=python",
            "is_demo": False
        },
        {
            "title": "Backend AI Systems Engineer (Python / PyTorch)",
            "company": "OpenAI",
            "location": "San Francisco, CA, USA",
            "experience_required": "1-4 years",
            "salary_range": "$190,000 - $260,000 / year",
            "remote_type": "Hybrid",
            "industry": "Artificial Intelligence",
            "description": "Develop high-throughput inference APIs, model serving infrastructure, and vector store pipelines supporting ChatGPT and enterprise LLMs.",
            "required_skills": ["Python", "Machine Learning", "PyTorch", "FastAPI", "REST API", "Docker", "Git"],
            "original_apply_url": "https://openai.com/careers/search",
            "is_demo": False
        },
        {
            "title": "Software Development Engineer (Python / AWS)",
            "company": "Amazon Web Services (AWS)",
            "location": "Austin, TX, USA",
            "experience_required": "0-2 years",
            "salary_range": "$145,000 - $190,000 / year",
            "remote_type": "Hybrid",
            "industry": "Cloud Computing",
            "description": "Architect cloud-native backend services, automated CI/CD deployments, and scalable AWS cloud infrastructure APIs.",
            "required_skills": ["Python", "AWS", "Docker", "REST API", "SQL", "Git"],
            "original_apply_url": "https://amazon.jobs/en/search?base_query=python",
            "is_demo": False
        },
        {
            "title": "Software Engineer II - Java & Spring Boot",
            "company": "Microsoft",
            "location": "Redmond, WA, USA / Remote",
            "experience_required": "1-3 years",
            "salary_range": "$150,000 - $195,000 / year",
            "remote_type": "Hybrid",
            "industry": "Enterprise Software",
            "description": "Build high-throughput enterprise backends and cloud microservices supporting Azure cloud platform services using Java 17 and SQL.",
            "required_skills": ["Java", "SQL", "REST API", "Docker", "Data Structures & Algorithms", "Git"],
            "original_apply_url": "https://careers.microsoft.com/v2/global/en/home.html",
            "is_demo": False
        },
        {
            "title": "Full Stack Engineer (React + TypeScript)",
            "company": "Meta",
            "location": "Menlo Park, CA, USA / Remote",
            "experience_required": "1-3 years",
            "salary_range": "$160,000 - $210,000 / year",
            "remote_type": "Remote",
            "industry": "Social Tech / Web",
            "description": "Engineer interactive web frontends using React 18, TypeScript, GraphQL, and modern web application frameworks.",
            "required_skills": ["React", "JavaScript", "TypeScript", "HTML/CSS", "REST API", "Git", "Node.js"],
            "original_apply_url": "https://www.metacareers.com/jobs",
            "is_demo": False
        },
        {
            "title": "Research Engineer - Deep Learning",
            "company": "Google DeepMind",
            "location": "London, UK",
            "experience_required": "1-4 years",
            "salary_range": "£95,000 - £130,000 / year",
            "remote_type": "Hybrid",
            "industry": "AI Research",
            "description": "Implement cutting-edge deep learning research algorithms, neural networks, and scalable training frameworks with Python and PyTorch.",
            "required_skills": ["Python", "Machine Learning", "PyTorch", "Pandas", "NumPy", "Git"],
            "original_apply_url": "https://careers.google.com/jobs/results/?q=machine%20learning",
            "is_demo": False
        },
        {
            "title": "Data & Product Analytics Engineer",
            "company": "Uber",
            "location": "Hyderabad, India / Remote",
            "experience_required": "0-3 years",
            "salary_range": "₹18,00,000 - ₹26,00,000 / year",
            "remote_type": "Hybrid",
            "industry": "Mobility & Tech",
            "description": "Transform massive mobility dataset telemetry into predictive analytics, statistical models, and executive dashboards using SQL and Python.",
            "required_skills": ["Python", "SQL", "Pandas", "NumPy", "Git"],
            "original_apply_url": "https://www.uber.com/us/en/careers/list/",
            "is_demo": False
        },
        {
            "title": "Cloud Infrastructure & Container Reliability Engineer",
            "company": "Netflix",
            "location": "Los Gatos, CA, USA / Remote",
            "experience_required": "2-4 years",
            "salary_range": "$185,000 - $245,000 / year",
            "remote_type": "Remote",
            "industry": "Entertainment & Streaming Tech",
            "description": "Manage global container orchestration, Kubernetes clusters, CI/CD automated deployment pipelines, and multi-region AWS infrastructure.",
            "required_skills": ["AWS", "Docker", "Kubernetes", "Linux", "CI/CD", "Python", "Git"],
            "original_apply_url": "https://jobs.netflix.com/search?q=cloud",
            "is_demo": False
        },
        {
            "title": "Python Backend & API Specialist",
            "company": "Tata Consultancy Services (TCS)",
            "location": "Bengaluru, India",
            "experience_required": "0-2 years",
            "salary_range": "₹8,50,000 - ₹14,00,000 / year",
            "remote_type": "Hybrid",
            "industry": "IT Services",
            "description": "Develop scalable Python REST web services, database ORMs, and secure cloud API integrations for international enterprise clients.",
            "required_skills": ["Python", "SQL", "Django", "REST API", "PostgreSQL", "Git"],
            "original_apply_url": "https://www.tcs.com/careers",
            "is_demo": False
        },
        {
            "title": "Data Warehouse & SQL Engineer",
            "company": "Snowflake",
            "location": "San Mateo, CA, USA",
            "experience_required": "1-3 years",
            "salary_range": "$160,00,000 - $205,000 / year",
            "remote_type": "Hybrid",
            "industry": "Data Cloud",
            "description": "Build high-performance cloud data warehouses, query optimization routines, and automated SQL data pipelines.",
            "required_skills": ["SQL", "Python", "Pandas", "PostgreSQL", "Git"],
            "original_apply_url": "https://www.snowflake.com/en/company/careers/",
            "is_demo": False
        }
    ]
    
    for j in jobs:
        j_obj = models.Job(
            title=j["title"],
            company=j["company"],
            location=j["location"],
            experience_required=j["experience_required"],
            salary_range=j["salary_range"],
            remote_type=j["remote_type"],
            industry=j["industry"],
            description=j["description"],
            required_skills_json=json.dumps(j["required_skills"]),
            original_apply_url=j["original_apply_url"],
            is_demo=False
        )
        db.add(j_obj)
    db.commit()

def seed_workforce_locations(db: Session):
    db.query(models.WorkforceLocation).delete()
    
    locations = [
        {
            "city": "Hyderabad",
            "country": "India",
            "latitude": 17.3850,
            "longitude": 78.4867,
            "job_demand_level": "HIGH",
            "skill_demand_level": "HIGH",
            "talent_availability_level": "MEDIUM",
            "skill_shortage_level": "HIGH",
            "future_demand_level": "VERY HIGH",
            "top_skills": ["Python", "FastAPI", "Docker", "AWS", "REST API"]
        },
        {
            "city": "Bengaluru",
            "country": "India",
            "latitude": 12.9716,
            "longitude": 77.5946,
            "job_demand_level": "VERY HIGH",
            "skill_demand_level": "VERY HIGH",
            "talent_availability_level": "HIGH",
            "skill_shortage_level": "HIGH",
            "future_demand_level": "VERY HIGH",
            "top_skills": ["Java", "Spring Boot", "React", "AI/ML", "Cloud Native"]
        },
        {
            "city": "San Francisco",
            "country": "USA",
            "latitude": 37.7749,
            "longitude": -122.4194,
            "job_demand_level": "VERY HIGH",
            "skill_demand_level": "VERY HIGH",
            "talent_availability_level": "HIGH",
            "skill_shortage_level": "MEDIUM",
            "future_demand_level": "VERY HIGH",
            "top_skills": ["AI/ML", "PyTorch", "LLM Ops", "TypeScript", "System Design"]
        },
        {
            "city": "Austin",
            "country": "USA",
            "latitude": 30.2672,
            "longitude": -97.7431,
            "job_demand_level": "HIGH",
            "skill_demand_level": "HIGH",
            "talent_availability_level": "MEDIUM",
            "skill_shortage_level": "HIGH",
            "future_demand_level": "VERY HIGH",
            "top_skills": ["Python", "AWS", "Docker", "Web Development", "SQL"]
        },
        {
            "city": "London",
            "country": "UK",
            "latitude": 51.5074,
            "longitude": -0.1278,
            "job_demand_level": "HIGH",
            "skill_demand_level": "HIGH",
            "talent_availability_level": "MEDIUM",
            "skill_shortage_level": "HIGH",
            "future_demand_level": "HIGH",
            "top_skills": ["Cloud Infrastructure", "Kubernetes", "Fintech API", "Java"]
        },
        {
            "city": "Berlin",
            "country": "Germany",
            "latitude": 52.5200,
            "longitude": 13.4050,
            "job_demand_level": "MEDIUM",
            "skill_demand_level": "HIGH",
            "talent_availability_level": "MEDIUM",
            "skill_shortage_level": "MEDIUM",
            "future_demand_level": "HIGH",
            "top_skills": ["Python", "React", "Docker", "Data Engineering"]
        }
    ]
    
    for loc in locations:
        loc_obj = models.WorkforceLocation(
            city=loc["city"],
            country=loc["country"],
            latitude=loc["latitude"],
            longitude=loc["longitude"],
            job_demand_level=loc["job_demand_level"],
            skill_demand_level=loc["skill_demand_level"],
            talent_availability_level=loc["talent_availability_level"],
            skill_shortage_level=loc["skill_shortage_level"],
            future_demand_level=loc["future_demand_level"],
            top_skills_json=json.dumps(loc["top_skills"])
        )
        db.add(loc_obj)
    db.commit()

def run_all_seeds(db: Session):
    seed_target_jobs(db)
    seed_questions(db)
    seed_jobs(db)
    seed_workforce_locations(db)
