"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import UploadNavbar from "../../upload-resume/components/UploadNavbar";
import { FaCalendarAlt, FaMoneyBillAlt, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";
import { useEffect, useState } from "react";

type JobDetails = {
  _id: string;
  title: string;
  company: string;
  location: string;
  deadline: string;
  salary: string;
  shortDescription: string;
  detailedDescription: string;
  responsibilities: string[];
  skills: string[];
  contactEmail: string;
  contactPhone: string;
};

export default function JobDetailsPage() {
  const { id: jobId } = useParams();

  const [job, setJob] = useState<JobDetails | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) throw new Error("Job not found");
        const data = await response.json();
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoadingJob(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);


  if (loadingJob) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 text-xl sm:text-2xl px-4 text-center">{error || "Job not found"}</p>
      </div>
    );
  }

  return (
    <>
        <UploadNavbar />
        <div className="p-4 sm:p-6 md:p-10 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 md:p-8">
            <Link href="/upload-resume" className="text-gray-600 hover:text-red-500 transition mb-4 items-center text-sm sm:text-base inline-block">
              ← Back to Jobs
            </Link>

            <div className="flex items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{job.company}</h2>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-red-500 mb-3 sm:mb-4 break-words">{job.title}</h1>

            <div className="space-y-2 sm:space-y-3 mb-5 sm:mb-6">
              <div className="flex items-center text-gray-700 text-sm sm:text-base">
                <FaMapMarkerAlt className="mr-2 text-gray-500 flex-shrink-0" />
                <span className="font-semibold">Location:</span>&nbsp;{job.location}
              </div>
              <div className="flex items-center text-gray-700 text-sm sm:text-base">
                <FaCalendarAlt className="mr-2 text-gray-500 flex-shrink-0" />
                <span className="font-semibold">Deadline:</span>&nbsp;{job.deadline}
              </div>
              <div className="flex items-center text-gray-700 text-sm sm:text-base">
                <FaMoneyBillAlt className="mr-2 text-gray-500 flex-shrink-0" />
                <span className="font-semibold">Salary:</span>&nbsp;{job.salary}
              </div>
            </div>

            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Job Description</h2>
              <p className="text-gray-700 text-sm sm:text-base">{job.detailedDescription || job.shortDescription}</p>
            </div>

            {job.responsibilities.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Key Responsibilities</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1 sm:space-y-2 text-sm sm:text-base">
                  {job.responsibilities.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.skills.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Skills Required</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1 sm:space-y-2 text-sm sm:text-base">
                  {job.skills.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-4 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Contact Information</h2>
              <div className="space-y-1 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                <div className="flex items-center">
                  <FaEnvelope className="mr-2 text-gray-500 flex-shrink-0" />
                  <span className="break-words">{job.contactEmail || "Not provided"}</span>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="mr-2 text-gray-500 flex-shrink-0" />
                  <span>{job.contactPhone || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}