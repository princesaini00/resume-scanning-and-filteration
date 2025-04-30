"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EmployeeNavbar from "../resume-filter/components/EmployeeNavbar";

type Resume = {
  name: string;
  email: string;
  contactEmail: string;
  resumeUrl: string;
  fileName?: string;
  jobTitle: string;
  jobCompany: string;
  jobLocation: string;
  totalExperience: number | null;
  skills: string[];
};

export default function ResumeResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResumes = async () => {
      setLoading(true);
      setError(null);

      try {
        // Extract filter values from search params
        const position = searchParams.get("position");
        const skills = searchParams.get("skills");
        const experience = searchParams.get("experience");
        const location = searchParams.get("location");

        // Prepare filters object - only include non-empty filters
        const filters: Record<string, string[]> = {};
        
        if (position) filters.position = position.split(",");
        if (skills) filters.skills = skills.split(",");
        if (experience) filters.experience = experience.split(",");
        if (location) filters.location = location.split(",");

        console.log("Sending filters to API:", filters);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/filter-resumes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(filters),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch resumes");
        }

        const data = await response.json();
        console.log("API response:", data);
        setResumes(data);
      } catch (error: any) {
        console.error("Error fetching resumes:", error);
        setError(error.message || "Failed to load resumes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, [searchParams]);

  return (
    <>
      <div className="shadow fixed top-0 z-50 right-0 left-0">
        <EmployeeNavbar />
      </div>

      <div className="max-w-5xl mx-auto py-6 md:py-8 px-3 md:px-4 mt-16 min-h-screen">
        <button
          onClick={() => router.back()}
          className="px-3 py-1.5 md:px-4 md:py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm md:text-base"
        >
          ← Back to Filters
        </button>

        <h2 className="text-2xl md:text-3xl font-bold my-2 text-gray-800">Matching Resumes</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-8 md:py-10">
            <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-b-2 border-red-500"></div>
            <span className="ml-3 text-sm md:text-base">Loading resumes...</span>
          </div>
        ) : (
          <>
            <p className="mb-4 md:mb-6 text-gray-600 text-sm md:text-base">
              Found <span className="font-semibold text-xl md:text-2xl text-red-500">{resumes.length}</span> resumes matching your criteria
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded mb-4 text-sm md:text-base">
                {error}
              </div>
            )}

            <div className="space-y-4 md:space-y-6">
              {resumes.map((resume, index) => (
                <div key={index} className="bg-white border-2 border-gray-200 rounded-lg shadow-xl overflow-hidden">
                  <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800">{resume.name || "Anonymous Applicant"}</h3>
                    <p className="text-xs md:text-sm text-gray-600 truncate">{resume.contactEmail || resume.email || "Email not provided"}</p>
                  </div>
                  
                  <div className="p-3 md:p-4">
                    <div className="mb-3 md:mb-4 bg-red-50 p-2 md:p-3 rounded-md border border-red-100">
                      <h4 className="text-xs md:text-sm font-semibold uppercase text-red-500 mb-1 md:mb-2">Applied Position</h4>
                      <p className="text-sm md:text-base text-gray-800 font-medium">{resume.jobTitle}</p>
                      <div className="mt-1 flex items-center text-xs md:text-sm text-gray-600">
                        <span>{resume.jobCompany}</span>
                        {resume.jobLocation !== "Not specified" && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{resume.jobLocation}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <p className="font-semibold text-xs md:text-sm text-gray-700">Total Experience:</p>
                        <p className="text-xs md:text-sm text-gray-800">
                          {resume.totalExperience !== null ? 
                            `${resume.totalExperience} ${resume.totalExperience === 1 ? "year" : "years"}` : 
                            "Fresher"}
                        </p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <p className="font-semibold text-xs md:text-sm text-gray-700 mb-1">Skills:</p>
                        {resume.skills && resume.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 md:gap-2">
                            {resume.skills.map((skill, i) => (
                              <span key={i} className="px-1.5 py-0.5 md:px-2 md:py-1 bg-gray-100 text-gray-700 rounded-md text-xs md:text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs md:text-sm text-gray-500">No skills listed</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 md:p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                    {resume.resumeUrl ? (
                      <a
                        href={resume.resumeUrl}
                        download={resume.fileName || "resume.pdf"}
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-xs md:text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download Resume
                      </a>
                    ) : (
                      <span className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed text-xs md:text-sm">
                        Resume Not Available
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {resumes.length === 0 && !error && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 md:p-4 my-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-xs md:text-sm text-yellow-700">
                      No resumes found matching your criteria. Try adjusting your filters.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}