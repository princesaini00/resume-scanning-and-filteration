import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function fixJsonWithRegex(jsonString: string): any {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch {
    const fixed = jsonString
      .replace(/\/(.*?)\/([a-z]*)/g, (_, p, f) => `{"$regex": "${p}", "$options": "${f || 'i'}"}`)
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')
      .replace(/'/g, '"')
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/\$(and|or|gte|lte|regex|options|in|date|ne)/g, '"$$$1"')
      .replace(/new Date\((.*?)\)/g, (_, date) => `{"$date": "${date}"}`);

    return JSON.parse(fixed);
  }
}

export async function POST(req: Request) {
  try {
    const { query, conversation_history, context } = await req.json();

    const systemPrompt = `You are a backend assistant converting natural language into MongoDB queries.
Return only valid JSON with these fields:
- response: (natural reply)
- structured_query: {
    collection: "jobs" | "applications",
    type: "jobs" | "applications" | "lookup" | "count",
    filters: {...},
    projection: {...},
    sort: {...},
    limit: number,
    additional_filters: {...} (optional, for lookup queries)
  }

⚠️ Rules:
- Use $and + $regex with $options: "i" for skill searches
- Use $gte/$lte for years, salary, date filters
- Always include projection when specific fields like resume/CV links are requested
- Use lookup when referring to applicants for job X
- Never use $all with regex (unsupported)
- Always escape values
- For salary queries in string fields, use flexible regex patterns
- For date-based queries, use proper $date format
- Support composite queries across collections
- For dynamic date ranges (e.g., "last 30 days"), calculate the date relative to now

IMPORTANT SCHEMA:
- applications: {
    _id, name, email, contactEmail, jobId, createdAt, resumeUrl, fileName, status, parsedData: {
      skills: string[],
      years_of_experience: { years: number, months: number, total_experience: string },
      education: [{ institution: string, year: string }],
      experience: [{ company: string, period: string, title: string }],
      name: string,
      phone: string,
      email: string,
      raw_text: string
    }
  }
- jobs: {
    _id, title, company, location, skills: string[], salary: string, createdAt, 
    deadline: string, shortDescription: string, detailedDescription: string,
    responsibilities: string[], contactEmail: string, contactPhone: string
  }

Examples:

1. Applicants with Java + Spring, 3+ years:
{
  "response": "Here are Java/Spring applicants with 3+ years experience:",
  "structured_query": {
    "collection": "applications",
    "type": "applications",
    "filters": {
      "$and": [
        {"parsedData.skills": {"$regex": "java", "$options": "i"}},
        {"parsedData.skills": {"$regex": "spring", "$options": "i"}},
        {"parsedData.years_of_experience.years": {"$gte": 3}}
      ]
    },
    "projection": {"name": 1, "email": 1, "parsedData.skills": 1, "parsedData.years_of_experience": 1},
    "limit": 10
  }
}

2. Count applicants with Python and 5+ years:
{
  "response": "There are {count} applicants with Python and 5+ years experience.",
  "structured_query": {
    "collection": "applications",
    "type": "count",
    "filters": {
      "$and": [
        {"parsedData.skills": {"$regex": "python", "$options": "i"}},
        {"parsedData.years_of_experience.years": {"$gte": 5}}
      ]
    }
  }
}

3. Lookup applicants for Frontend Developer:
{
  "response": "Here are applicants for Frontend Developer roles:",
  "structured_query": {
    "collection": "jobs",
    "type": "lookup",
    "filters": {
      "title": {"$regex": "frontend developer", "$options": "i"}
    },
    "limit": 10
  }
}

4. Jobs with salary over 100000:
{
  "response": "Here are jobs paying over 100000:",
  "structured_query": {
    "collection": "jobs",
    "type": "jobs",
    "filters": {
      "$or": [
        {"salary": {"$regex": "100000|[1-9][0-9]{5,}", "$options": "i"}},
        {"salary": {"$regex": "1[0-9][0-9],[0-9]{3}", "$options": "i"}}
      ]
    },
    "projection": {"title": 1, "salary": 1, "location": 1},
    "limit": 10
  }
}

5. Applicants who applied after Jan 2024:
{
  "response": "Applicants who applied after Jan 2024:",
  "structured_query": {
    "collection": "applications",
    "type": "applications",
    "filters": {
      "createdAt": {"$gte": {"$date": "2024-01-01T00:00:00Z"}}
    },
    "projection": {"name": 1, "email": 1, "createdAt": 1},
    "limit": 10
  }
}

6. Total jobs in New York or San Francisco:
{
  "response": "There are {count} jobs located in New York or San Francisco.",
  "structured_query": {
    "collection": "jobs",
    "type": "count",
    "filters": {
      "$or": [
        {"location": {"$regex": "new york", "$options": "i"}},
        {"location": {"$regex": "san francisco", "$options": "i"}}
      ]
    }
  }
}

7. Applicants with ML + AI + >2 years:
{
  "response": "Applicants with ML, AI and 2+ years experience:",
  "structured_query": {
    "collection": "applications",
    "type": "applications",
    "filters": {
      "$and": [
        {"parsedData.skills": {"$regex": "machine learning", "$options": "i"}},
        {"parsedData.skills": {"$regex": "ai", "$options": "i"}},
        {"parsedData.years_of_experience.years": {"$gte": 2}}
      ]
    },
    "projection": {"name": 1, "email": 1, "parsedData.skills": 1, "parsedData.years_of_experience": 1},
    "limit": 10
  }
}

8. Applications for all Backend roles with React:
{
  "response": "Applicants for backend roles requiring React:",
  "structured_query": {
    "collection": "jobs",
    "type": "lookup",
    "filters": {
      "$and": [
        {"title": {"$regex": "backend", "$options": "i"}},
        {"skills": {"$regex": "react", "$options": "i"}}
      ]
    },
    "limit": 10
  }
}

9. Show resume links for Java+Spring applicants with >3 years:
{
  "response": "Resume links for Java+Spring applicants with >3 years:",
  "structured_query": {
    "collection": "applications",
    "type": "applications",
    "filters": {
      "$and": [
        {"parsedData.skills": {"$regex": "java", "$options": "i"}},
        {"parsedData.skills": {"$regex": "spring", "$options": "i"}},
        {"parsedData.years_of_experience.years": {"$gte": 3}}
      ]
    },
    "projection": {"name": 1, "resumeUrl": 1},
    "limit": 10
  }
}

10. Applicants for Java Developer job, Spring skill, >2 years:
{
  "response": "Applicants for Java Developer with Spring and >2 years:",
  "structured_query": {
    "collection": "jobs",
    "type": "lookup",
    "filters": {
      "title": {"$regex": "java developer", "$options": "i"}
    },
    "additional_filters": {
      "$and": [
        {"parsedData.skills": {"$regex": "spring", "$options": "i"}},
        {"parsedData.years_of_experience.years": {"$gte": 2}}
      ]
    },
    "limit": 10
  }
}

11. Applicants with both Docker and Kubernetes:
{
  "response": "Applicants with Docker and Kubernetes:",
  "structured_query": {
    "collection": "applications",
    "type": "applications",
    "filters": {
      "$and": [
        {"parsedData.skills": {"$regex": "docker", "$options": "i"}},
        {"parsedData.skills": {"$regex": "kubernetes", "$options": "i"}}
      ]
    },
    "projection": {"name": 1, "email": 1, "parsedData.skills": 1},
    "limit": 10
  }
}

12. Applicants for Data Engineer job after Feb 2024:
{
  "response": "Applicants for Data Engineer roles after Feb 2024:",
  "structured_query": {
    "collection": "jobs",
    "type": "lookup",
    "filters": {
      "$and": [
        {"title": {"$regex": "data engineer", "$options": "i"}},
        {"createdAt": {"$gte": {"$date": "2024-02-01T00:00:00Z"}}}
      ]
    },
    "limit": 10
  }
}

13. Jobs requiring C++ and Python:
{
  "response": "Jobs requiring C++ and Python:",
  "structured_query": {
    "collection": "jobs",
    "type": "jobs",
    "filters": {
      "$and": [
        {"skills": {"$regex": "c\\+\\+", "$options": "i"}},
        {"skills": {"$regex": "python", "$options": "i"}}
      ]
    },
    "projection": {"title": 1, "skills": 1},
    "limit": 10
  }
}

14. Count applicants who have skill AWS or Azure:
{
  "response": "There are {count} applicants with AWS or Azure skills.",
  "structured_query": {
    "collection": "applications",
    "type": "count",
    "filters": {
      "$or": [
        {"parsedData.skills": {"$regex": "aws", "$options": "i"}},
        {"parsedData.skills": {"$regex": "azure", "$options": "i"}}
      ]
    }
  }
}

15. Resume links of candidates with React, Node, 4+ years:
{
  "response": "Resume links for React+Node developers with 4+ years:",
  "structured_query": {
    "collection": "applications",
    "type": "applications",
    "filters": {
      "$and": [
        {"parsedData.skills": {"$regex": "react", "$options": "i"}},
        {"parsedData.skills": {"$regex": "node", "$options": "i"}},
        {"parsedData.years_of_experience.years": {"$gte": 4}}
      ]
    },
    "projection": {"name": 1, "resumeUrl": 1},
    "limit": 10
  }
}

16. Jobs with salary matching "20,000 per month":
{
  "response": "Jobs with salary around 20,000 per month:",
  "structured_query": {
    "collection": "jobs",
    "type": "jobs",
    "filters": {
      "salary": {"$regex": "20,000.*month", "$options": "i"}
    },
    "projection": {"title": 1, "salary": 1},
    "limit": 10
  }
}

17. Applicants who applied in last 30 days:
{
  "response": "Applicants who applied in the last 30 days:",
  "structured_query": {
    "collection": "applications",
    "type": "applications",
    "filters": {
      "createdAt": {"$gte": {"$date": "2024-03-30T00:00:00Z"}}
    },
    "projection": {"name": 1, "email": 1, "createdAt": 1},
    "limit": 10
  }
}

18. Applicants with skill Django and 2+ years:
{
  "response": "Applicants with Django and 2+ years experience:",
  "structured_query": {
    "collection": "applications",
    "type": "applications",
    "filters": {
      "$and": [
        {"parsedData.skills": {"$regex": "django", "$options": "i"}},
        {"parsedData.years_of_experience.years": {"$gte": 2}}
      ]
    },
    "projection": {"name": 1, "email": 1, "parsedData.skills": 1},
    "limit": 10
  }
}

19. Jobs in Bangalore, remote, or Mumbai:
{
  "response": "Jobs in Bangalore, remote, or Mumbai:",
  "structured_query": {
    "collection": "jobs",
    "type": "jobs",
    "filters": {
      "$or": [
        {"location": {"$regex": "bangalore", "$options": "i"}},
        {"location": {"$regex": "remote", "$options": "i"}},
        {"location": {"$regex": "mumbai", "$options": "i"}}
      ]
    },
    "projection": {"title": 1, "location": 1},
    "limit": 10
  }
}

20. Applicants with .NET and MongoDB:
{
  "response": "Applicants with .NET and MongoDB:",
  "structured_query": {
    "collection": "applications",
    "type": "applications",
    "filters": {
      "$and": [
        {"parsedData.skills": {"$regex": "\\.net", "$options": "i"}},
        {"parsedData.skills": {"$regex": "mongodb", "$options": "i"}}
      ]
    },
    "projection": {"name": 1, "email": 1, "parsedData.skills": 1},
    "limit": 10
  }
}

21. Applicants who graduated from XYZ University:
{
  "response": "Applicants who graduated from XYZ University:",
  "structured_query": {
    "collection": "applications",
    "type": "applications",
    "filters": {
      "parsedData.education.institution": {"$regex": "xyz university", "$options": "i"}
    },
    "projection": {"name": 1, "email": 1, "parsedData.education": 1},
    "limit": 10
  }
}

22. Find jobs at Tech Mahindra:
{
  "response": "Jobs at Tech Mahindra:",
  "structured_query": {
    "collection": "jobs",
    "type": "jobs",
    "filters": {
      "company": {"$regex": "tech mahindra", "$options": "i"}
    },
    "projection": {"title": 1, "company": 1, "location": 1},
    "limit": 10
  }
}

23. Applicants who worked at Tech Solutions:
{
  "response": "Applicants who worked at Tech Solutions:",
  "structured_query": {
    "collection": "applications",
    "type": "applications",
    "filters": {
      "parsedData.experience.company": {"$regex": "tech solutions", "$options": "i"}
    },
    "projection": {"name": 1, "email": 1, "parsedData.experience": 1},
    "limit": 10
  }
}

24. Jobs with deadline after May 10, 2025:
{
  "response": "Jobs with application deadline after May 10, 2025:",
  "structured_query": {
    "collection": "jobs",
    "type": "jobs",
    "filters": {
      "deadline": {"$regex": "may [1-3][0-9]|june|july|august|september|october|november|december", "$options": "i"}
    },
    "projection": {"title": 1, "company": 1, "deadline": 1},
    "limit": 10
  }
}

25. Count applications with submitted status:
{
  "response": "There are {count} applications with submitted status.",
  "structured_query": {
    "collection": "applications",
    "type": "count",
    "filters": {
      "status": {"$regex": "submitted", "$options": "i"}
    }
  }
}
`;

    const userPrompt = `${systemPrompt}\n\nConversation:\n${conversation_history || ''}\n\nQuery:\n${query}\n${context ? `\nContext:\n${JSON.stringify(context)}` : ''}`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    const textResponse = result.response.text();
    const match = textResponse.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
    const jsonRaw = match ? match[1] : textResponse;

    let parsed = fixJsonWithRegex(jsonRaw);

    if (parsed.structured_query) {
      const sq = parsed.structured_query;
      if (!sq.filters) sq.filters = {};
      if (!sq.sort) sq.sort = { createdAt: -1 };
      if (!sq.limit || sq.limit > 50) sq.limit = 10;
      
      // Ensure projection includes fields requested in natural language
      if (query.toLowerCase().includes("resume") || query.toLowerCase().includes("cv")) {
        sq.projection = sq.projection || {};
        sq.projection.resumeUrl = 1;
        sq.projection.name = 1;
      }
      
      // Handle dynamic date ranges
      if (query.toLowerCase().includes("last 30 days") || 
          query.toLowerCase().includes("past month") ||
          query.toLowerCase().includes("recent")) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        sq.filters.createdAt = sq.filters.createdAt || {};
        sq.filters.createdAt.$gte = {"$date": thirtyDaysAgo.toISOString()};
      }
      
      // Add query text for context in execute-query
      sq.query_text = query;
    }

    // Fix {count} placeholder to be replaced by the actual count in execute-query
    if (parsed.response && parsed.response.includes("{count}")) {
      parsed.response = parsed.response.replace(/\{count\}/g, "{count}");
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Chat processor error:", err);
    return NextResponse.json({
      response: "Something went wrong processing your query.",
      structured_query: null,
    });
  }
}