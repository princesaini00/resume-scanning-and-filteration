from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
import os
import tempfile
import time
import traceback
import spacy
import re
import nltk
from nltk.corpus import stopwords
import PyPDF2
import docx
from datetime import datetime
from dateutil.relativedelta import relativedelta
import string
import os

resume_parser_blueprint = Blueprint("resume_parser", __name__)

# Download NLTK data if not already available
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
    
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Initialize spaCy model
nlp = spacy.load("en_core_web_sm")
stop_words = set(stopwords.words('english'))

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file"""
    text = ""
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:  # Check if text extraction was successful
                text += page_text + "\n"
    return text

def extract_text_from_docx(docx_path):
    """Extract text from DOCX file"""
    doc = docx.Document(docx_path)
    text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
    return text

def extract_text(file_path):
    """Extract text from PDF or DOCX file"""
    if file_path.lower().endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    elif file_path.lower().endswith('.docx'):
        return extract_text_from_docx(file_path)
    else:
        raise ValueError("Unsupported file format. Only PDF and DOCX are supported.")

def extract_name(text, nlp_doc):
    """Extract name from resume text"""
    # Look for patterns like "Name: John Smith" or text at the beginning
    name_pattern = re.compile(r'(?:name[:\s]+)([a-zA-Z\s]+)', re.IGNORECASE)
    match = name_pattern.search(text)
    
    if match:
        return match.group(1).strip()
    
    # Otherwise, try to find person names using NER
    for ent in nlp_doc.ents:
        if ent.label_ == "PERSON":
            # Check if this is actually a person name, not just a false positive
            if len(ent.text.split()) >= 2 and not any(word.lower() in stop_words for word in ent.text.split()):
                return ent.text
    
    # If nothing found, return first line (often contains name)
    first_line = text.strip().split('\n')[0].strip()
    if len(first_line) < 40:  # Reasonable name length
        return first_line
    
    return ""

def extract_email(text):
    """Extract email from resume text"""
    email_pattern = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')
    match = email_pattern.search(text)
    return match.group(0) if match else ""

def extract_phone(text):
    """Extract phone number from resume text"""
    # More comprehensive phone pattern
    phone_pattern = re.compile(r'(?:\+\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}')
    matches = phone_pattern.findall(text)
    if matches:
        # Return the first match that looks like a phone number
        for match in matches:
            # Check if it has enough digits to be a phone number
            digits = ''.join(c for c in match if c.isdigit())
            if len(digits) >= 10:
                return match
    return ""

def extract_education(text):
    """Extract education details from resume text"""
    edu_keywords = ['education', 'university', 'college', 'school', 'degree', 'bachelor', 'master', 'phd', 'b.tech', 'm.tech']
    
    # Find education section
    education_data = []
    lines = text.split('\n')
    is_edu_section = False
    edu_section_text = ""
    
    for i, line in enumerate(lines):
        if any(keyword.lower() in line.lower() for keyword in edu_keywords) and not is_edu_section:
            is_edu_section = True
            edu_section_text += line + "\n"
        elif is_edu_section and line.strip() and len(line) > 3:
            edu_section_text += line + "\n"
            # Check if we've moved to another section
            if i < len(lines) - 1 and lines[i+1].strip() and not any(word.lower() in lines[i+1].lower() for word in ["gpa", "course", "degree", "university", "college", "school"]):
                next_line_lower = lines[i+1].lower()
                # Check if next line starts a new section
                if any(next_line_lower.startswith(section) for section in ["experience", "work", "employment", "skills", "project"]):
                    is_edu_section = False
    
    # If no specific education section found, search the entire text
    if not edu_section_text:
        edu_section_text = text
    
    # Extract degree info from the education section
    edu_matches = re.findall(r'(?:(?:Bachelor|Master|MBA|PhD|B\.Tech|M\.Tech|B\.E|M\.E|B\.S|M\.S|B\.A|M\.A)[.\s]+(?:of|in)?[.\s]+(?:[A-Za-z\s]+))|(?:[A-Za-z]+\s+University|College|Institute|School)', edu_section_text)
    
    # Look for graduation years
    year_pattern = re.compile(r'\b(19|20)\d{2}\b')
    years = year_pattern.findall(edu_section_text)
    
    # Add unique matches to education data
    seen_edu = set()
    for match in edu_matches:
        if match and len(match.strip()) > 3:
            clean_match = match.strip()
            if clean_match not in seen_edu:
                seen_edu.add(clean_match)
                edu_entry = {"institution": clean_match}
                
                # Try to find a nearby year for this education entry
                year_match = re.search(r'\b' + re.escape(clean_match) + r'.*?\b((?:19|20)\d{2})\b', edu_section_text)
                if year_match:
                    edu_entry["year"] = year_match.group(1)
                
                education_data.append(edu_entry)
    
    return education_data

def extract_skills(text, nlp_doc):
    """Extract skills from resume text"""
    # Expanded technical skills list
    tech_skills = [
        # Programming Languages
        "python", "java", "javascript", "typescript", "c", "c\\+\\+", "c#", "php", "ruby", "perl", 
        "swift", "kotlin", "go", "rust", "scala", "shell", "powershell", "bash", "r", "matlab", 
        "objective-c", "assembly", "groovy", "dart", "lua", "haskell", "fortran", "cobol", "erlang",
        
        # Frontend
        "html", "css", "sass", "less", "bootstrap", "tailwind", "jquery", "react", "angular", "vue", 
        "redux", "svelte", "webpack", "babel", "gatsby", "next.js", "material-ui", "styled-components",
        
        # Backend & Frameworks
        "nodejs", "express", "django", "flask", "spring", "laravel", "symfony", "rails", ".net", 
        "asp.net", "core", "hibernate", "struts", "codeigniter", "fastapi", "sinatra", 
        
        # Databases
        "sql", "mysql", "postgresql", "mongodb", "sqlite", "oracle", "sqlserver", "cassandra",
        "dynamodb", "redis", "elasticsearch", "firebase", "neo4j", "mariadb", "couchdb", "graphql",
        
        # Cloud & DevOps
        "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "gitlab", "github", "bitbucket",
        "terraform", "ansible", "chef", "puppet", "circleci", "travis", "heroku", "netlify", "vercel",
        
        # Data Science & AI
        "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "scipy", "matplotlib",
        "seaborn", "tableau", "power bi", "hadoop", "spark", "machine learning", "deep learning", 
        "nlp", "computer vision", "ai", "artificial intelligence", "data science", "data analytics",
        
        # Mobile
        "android", "ios", "flutter", "react native", "xamarin", "ionic", "cordova", "swift ui",
        
        # Embedded Systems
        "embedded systems", "circuit design", "pcb layout", "pcb", "firmware", "iot", "arduino", 
        "raspberry pi", "microcontrollers", "vhdl", "verilog", "embedded c", "rtos",
        
        # Other Tools & Technologies
        "git", "svn", "jira", "confluence", "trello", "slack", "agile", "scrum", "waterfall", 
        "restful", "soap", "json", "xml", "yaml", "markdown", "figma", "sketch", "adobe", 
        "photoshop", "illustrator", "xd", "indesign", "premiere", "linux", "windows", "macos"
    ]
    
    # Create a skill extraction pattern with word boundaries
    pattern = r'\b(?:' + '|'.join(tech_skills) + r')\b'
    skill_pattern = re.compile(pattern, re.IGNORECASE)
    
    # Find skills section
    skills_keywords = ['skills', 'technologies', 'technical skills', 'competencies', 'proficiencies', 'expertise', 'technical expertise']
    skills_section = ""
    
    lines = text.split('\n')
    is_skill_section = False
    
    for i, line in enumerate(lines):
        line_lower = line.lower()
        if any(keyword.lower() in line_lower for keyword in skills_keywords) and not is_skill_section:
            is_skill_section = True
            skills_section += line + "\n"
        elif is_skill_section and line.strip():
            skills_section += line + "\n"
            # Check if we've moved to another section
            if i < len(lines) - 1 and lines[i+1].strip():
                next_line_lower = lines[i+1].lower()
                if any(next_line_lower.startswith(section) for section in ["experience", "education", "project", "certification", "work"]):
                    is_skill_section = False
    
    # If no specific skills section found, use the whole text
    if not skills_section:
        skills_section = text
    
    # Extract skills using the pattern
    found_skills = skill_pattern.findall(skills_section.lower())
    
    # Special handling for C++
    cpp_pattern = re.compile(r'\bc\+\+\b', re.IGNORECASE)
    cpp_matches = cpp_pattern.findall(text)
    if cpp_matches:
        found_skills.append("c++")
    
    # Check for skills that might be written with different formatting
    special_skills = {
        "c++": ["c++", "cplusplus", "c plus plus"],
        ".net": [".net", "dotnet"],
        "asp.net": ["asp.net", "aspnet"],
        "node.js": ["node.js", "nodejs"],
        "next.js": ["next.js", "nextjs"],
        "react.js": ["react.js", "reactjs"],
        "vue.js": ["vue.js", "vuejs"],
        "embedded systems": ["embedded systems", "embedded system", "embedded"]
    }
    
    for skill_name, variations in special_skills.items():
        for variation in variations:
            if variation in text.lower() and skill_name not in found_skills:
                found_skills.append(skill_name)
    
    # Remove duplicates and format
    unique_skills = []
    seen_skills = set()
    for skill in found_skills:
        skill_lower = skill.lower()
        if skill_lower not in seen_skills:
            seen_skills.add(skill_lower)
            # Format specific skills properly
            if skill_lower == "c++":
                unique_skills.append("C++")
            elif skill_lower in [".net", "asp.net"]:
                unique_skills.append(skill_lower.upper())
            else:
                # Properly capitalize skill names
                unique_skills.append(skill.capitalize())
    
    return unique_skills


def parse_work_dates(date_str):
    """Parse a single date range and return start and end dates"""
    current_date = datetime.now()
    date_str = date_str.lower().replace('–', '-').replace('—', '-').replace('to', '-').strip()

    # Extract all year ranges from the string
    range_pattern = re.compile(r'((19|20)\d{2})\s*[-–—]\s*((19|20)\d{2}|present|current|now)', re.IGNORECASE)
    matches = range_pattern.findall(date_str)

    parsed_ranges = []

    for match in matches:
        try:
            start_year = int(match[0])
            end_raw = match[2].lower()

            if end_raw in ['present', 'current', 'now']:
                end_year = current_date.year
            else:
                end_year = int(end_raw)

            # Basic validation
            if start_year > current_date.year:
                start_year = current_date.year - 1
            if end_year > current_date.year:
                end_year = current_date.year
            if end_year < start_year:
                end_year = start_year + 1
            if (end_year - start_year) > 50:
                end_year = start_year + 50

            parsed_ranges.append((datetime(start_year, 1, 1), datetime(end_year, 1, 1)))
        except:
            continue

    return parsed_ranges


def calculate_years_experience(experiences):
    """Calculate total years of experience with overlap handling"""
    all_ranges = []

    for exp in experiences:
        if not exp.get('period'):
            continue
        date_ranges = parse_work_dates(exp['period'])
        for start_date, end_date in date_ranges:
            if not start_date or not end_date:
                continue
            all_ranges.append((start_date, end_date))

    if not all_ranges:
        return {'years': 0, 'months': 0, 'total_experience': '0 years'}

    # Merge overlapping ranges
    all_ranges.sort()
    merged = [all_ranges[0]]
    for current_start, current_end in all_ranges[1:]:
        last_start, last_end = merged[-1]
        if current_start <= last_end:
            merged[-1] = (last_start, max(last_end, current_end))
        else:
            merged.append((current_start, current_end))

    # Total months
    total_months = 0
    for start, end in merged:
        delta = relativedelta(end, start)
        total_months += delta.years * 12 + delta.months

    total_years = total_months // 12
    remaining_months = total_months % 12

    if total_years > 50:
        total_years = 50
        remaining_months = 0

    experience_str = f"{total_years} year{'s' if total_years != 1 else ''}"
    if remaining_months > 0:
        experience_str += f", {remaining_months} month{'s' if remaining_months != 1 else ''}"

    return {
        'years': total_years,
        'months': remaining_months,
        'total_experience': experience_str
    }

def extract_experience(text):
    """Extract work experience details from resume text"""
    exp_keywords = ['experience', 'employment', 'work history', 'professional experience', 'career', 'work experience']
    exp_section = ""
    
    lines = text.split('\n')
    is_exp_section = False

    for i, line in enumerate(lines):
        line_lower = line.lower()
        if any(keyword in line_lower for keyword in exp_keywords) and not is_exp_section:
            is_exp_section = True
            exp_section += line + "\n"
        elif is_exp_section and line.strip():
            exp_section += line + "\n"
            if i < len(lines) - 1:
                next_line = lines[i+1].strip().lower()
                if any(kw in next_line for kw in ["education", "skills", "project", "certification", "achievement"]):
                    is_exp_section = False

    if not exp_section:
        exp_section = text

    job_entries = []

    # 🔁 NEW: Match multiple experience entries from text
    multi_job_pattern = re.compile(
        r'(?:(?:^|\n)-?\s*)?([A-Z][A-Za-z\s/&.-]+?)\s+(?:at|@|with|for)\s+([A-Z][A-Za-z\s&.,]+?)\s*[\(\[]?\s*((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|[Pp]resent|[Cc]urrent)', 
        re.MULTILINE
    )

    for match in multi_job_pattern.finditer(exp_section):
        title = match.group(1).strip()
        company = match.group(2).strip()
        period = f"{match.group(3)} - {match.group(4)}"
        job_entries.append({
            'title': title,
            'company': company,
            'period': period
        })

    # Optional fallback if nothing matched
    if not job_entries:
        date_pattern = re.compile(r'(?:19|20)\d{2}\s*[-–—]\s*(?:19|20\d{2}|[Pp]resent|[Cc]urrent)')
        for line in exp_section.split('\n'):
            date_match = date_pattern.search(line)
            if date_match:
                period = date_match.group(0)
                remainder = line.replace(period, '').strip()
                if 'at' in remainder:
                    parts = remainder.split('at', 1)
                    job_entries.append({
                        'title': parts[0].strip(),
                        'company': parts[1].strip(),
                        'period': period
                    })
                else:
                    job_entries.append({
                        'title': remainder,
                        'period': period
                    })

    experience_summary = calculate_years_experience(job_entries)
    return job_entries, experience_summary

def clean_text(text):
    """Clean and normalize text for better processing"""
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters that might interfere with regex patterns
    text = text.replace('\u2013', '-').replace('\u2014', '-').replace('\u2019', "'")
    return text

def parse_resume(file_path):
    """Parse resume and extract relevant information"""
    try:
        # Extract text from file
        text = extract_text(file_path)
        
        # Clean and normalize text
        text = clean_text(text)
        
        # Process with spaCy
        doc = nlp(text[:100000] if len(text) > 100000 else text)  # Limit text size for spaCy processing
        
        # Extract information
        name = extract_name(text, doc)
        email = extract_email(text)
        phone = extract_phone(text)
        skills = extract_skills(text, doc)
        education = extract_education(text)
        experience, experience_summary = extract_experience(text)
        
        # Create structured result
        result = {
            "name": name,
            "email": email,
            "phone": phone,
            "skills": skills,
            "education": education,
            "experience": experience,
            "years_of_experience": experience_summary,
            "raw_text": text[:500] + ("..." if len(text) > 500 else "")  # Truncated raw text
        }
        
        return result
    except Exception as e:
        print(f"Error parsing resume: {str(e)}")
        print(traceback.format_exc())
        raise


@resume_parser_blueprint.route("/parse-resume", methods=["POST"])
@app.route('/parse-resume', methods=['POST'])
def handle_parse_resume():
    temp_path = None
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume uploaded'}), 400

        resume_file = request.files['resume']
        
        # Check if filename exists and is not empty
        if not resume_file.filename:
            return jsonify({'error': 'Invalid file'}), 400
            
        # Check file extension
        if not resume_file.filename.lower().endswith(('.pdf', '.docx')):
            return jsonify({'error': 'Only PDF and DOCX files are supported'}), 400

        # Create a temporary file
        temp_fd, temp_path = tempfile.mkstemp(suffix=os.path.splitext(resume_file.filename)[1])
        os.close(temp_fd)
        
        # Save the file
        resume_file.save(temp_path)
        print(f"Saved file to {temp_path}")
        
        # Parse the resume
        parsed_data = parse_resume(temp_path)
        
        # Return parsed data
        return jsonify(parsed_data)
    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': f"Error parsing resume: {str(e)}"}), 500
    
    finally:
        # Clean up temp file
        if temp_path and os.path.exists(temp_path):
            try:
                time.sleep(0.5)  # Small delay to ensure file is released
                os.remove(temp_path)
                print(f"Removed temporary file {temp_path}")
            except Exception as e:
                print(f"Could not delete temporary file: {str(e)}")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'spacy_loaded': bool(nlp)})

if __name__ == '__main__':
    # Make sure the required packages are installed
    print("Starting resume parser server...")
    app.run(host='0.0.0.0', port=5000, debug=True)

