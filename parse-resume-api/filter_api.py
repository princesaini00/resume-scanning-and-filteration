from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import os
import re
from bson import ObjectId

filter_api_blueprint = Blueprint("filter_api", __name__)

client = MongoClient(os.getenv("MONGODB_URI"))
db = client.get_database("test")
applications_collection = db.applications
jobs_collection = db.jobs

@filter_api_blueprint.route("/filter-resumes", methods=["POST"])
def filter_resumes():
    filters = request.get_json()
    query = {}

    print(f"Received filters: {filters}")

    # Step 1: Resolve matching job ObjectIds
    job_query = {}

    if "position" in filters and filters["position"]:
        regex_patterns = [re.compile(f".*{re.escape(pos)}.*", re.IGNORECASE) for pos in filters["position"]]
        job_query["title"] = {"$in": regex_patterns}

    if "location" in filters and filters["location"]:
        regex_patterns = [re.compile(f".*{re.escape(loc)}.*", re.IGNORECASE) for loc in filters["location"]]
        job_query["location"] = {"$in": regex_patterns}

    matching_job_ids = []
    if job_query:
        jobs = jobs_collection.find(job_query, {"_id": 1})
        matching_job_ids = [job["_id"] for job in jobs]
        print(f"Matching job IDs: {matching_job_ids}")
        if matching_job_ids:
            query["jobId"] = {"$in": matching_job_ids}
        else:
            # No jobs matched; return empty result early
            return jsonify([])

    # Step 2: Apply remaining filters (skills, experience)
    if "skills" in filters and filters["skills"]:
        skills_values = filters["skills"]
        if isinstance(skills_values, list) and skills_values:
            regex_patterns = [re.compile(f".*{re.escape(skill)}.*", re.IGNORECASE) for skill in skills_values]
            query["parsedData.skills"] = {"$elemMatch": {"$in": regex_patterns}}

    if "experience" in filters and filters["experience"]:
        exp_values = filters["experience"]
        if isinstance(exp_values, list) and exp_values:
            exp_query = []
            for exp in exp_values:
                if "1 year" in exp.lower():
                    exp_query.append({"parsedData.years_of_experience.years": {"$gte": 0.5, "$lt": 2}})
                elif "2 years" in exp.lower():
                    exp_query.append({"parsedData.years_of_experience.years": {"$gte": 2, "$lt": 3}})
                elif "3 years" in exp.lower():
                    exp_query.append({"parsedData.years_of_experience.years": {"$gte": 3, "$lt": 4}})
                elif "4 years" in exp.lower():
                    exp_query.append({"parsedData.years_of_experience.years": {"$gte": 4, "$lt": 5}})
                elif "5+" in exp.lower() or "5 years" in exp.lower():
                    exp_query.append({"parsedData.years_of_experience.years": {"$gte": 5}})
            if exp_query:
                query["$or"] = exp_query

    print(f"MongoDB query: {query}")

    projection = {
        "name": 1,
        "email": 1,
        "contactEmail": 1,
        "resumeUrl": 1,
        "fileName": 1,
        "jobId": 1,
        "parsedData.years_of_experience.years": 1,
        "parsedData.skills": 1,
        "_id": 0
    }

    applications = list(applications_collection.find(query, projection))
    print(f"Query returned {len(applications)} results")

    # Format response
    formatted_results = []
    for application in applications:
        years_exp = None
        skills = []

        if "parsedData" in application:
            if "years_of_experience" in application["parsedData"]:
                years_exp = application["parsedData"]["years_of_experience"].get("years")
            skills = application["parsedData"].get("skills", [])

        job_details = {"title": "Not specified", "company": "Not specified", "location": "Not specified"}
        if "jobId" in application and application["jobId"]:
            try:
                job_id = application["jobId"]
                if isinstance(job_id, str):
                    job_id = ObjectId(job_id)
                job = jobs_collection.find_one({"_id": job_id})
                if job:
                    job_details = {
                        "title": job.get("title", "Not specified"),
                        "company": job.get("company", "Not specified"),
                        "location": job.get("location", "Not specified")
                    }
            except Exception as e:
                print(f"Error fetching job details: {e}")

        formatted_application = {
            "name": application.get("name", ""),
            "email": application.get("email", ""),
            "contactEmail": application.get("email", ""),
            "resumeUrl": application.get("resumeUrl", ""),
            "fileName": application.get("fileName", ""),
            "jobTitle": job_details["title"],
            "jobCompany": job_details["company"],
            "jobLocation": job_details["location"],
            "totalExperience": years_exp,
            "skills": skills
        }

        formatted_results.append(formatted_application)

    return jsonify(formatted_results)
