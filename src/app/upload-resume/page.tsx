"use client";

import { useEffect, useState } from "react";
import ApplyForm from "./components/ApplyForm";
import SuccessModal from "./components/SuccessModal";
import UploadNavbar from "./components/UploadNavbar";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function UploadResumePage() {
  const { data: session } = useSession();
  const [jobListings, setJobListings] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        setJobListings(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
        setLoading(false);
      }
    };

    const fetchUserApplications = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch("/api/applications/user");
          const data = await res.json();
          // Extract job IDs from applications
          const jobIds = data.map((app: any) => app.jobId);
          setAppliedJobs(jobIds);
        } catch (err) {
          console.error("Failed to fetch user applications", err);
        }
      }
    };

    fetchJobs();
    fetchUserApplications();
  }, [session]);

  const openForm = (job: any) => {
    setSelectedJob(job);
    setShowApplyForm(true);
  };

  const closeForm = () => {
    setShowApplyForm(false);
    setSelectedJob(null);
  };

  const handleFormSubmit = (applicationId: string) => {
    setShowApplyForm(false);
    setShowSuccessModal(true);
    setApplicationId(applicationId);
    // Add the job to applied jobs list
    setAppliedJobs(prev => [...prev, selectedJob._id]);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const hasUserApplied = (jobId: string) => {
    return appliedJobs.includes(jobId);
  };

  if (loading) {
    return (
      <>
        <UploadNavbar />
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`transition-all duration-300 ${showApplyForm || showSuccessModal ? "opacity-30 pointer-events-none" : "opacity-100"}`}>
        <UploadNavbar />

        <div className="p-4 sm:p-6 md:p-10">
          <div className="mb-4 sm:mb-5">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Job Opportunities</h1>
            <p className="text-sm sm:text-base">Explore exciting opportunities tailored for students! Browse through internships and job openings, find the perfect role, and kickstart your career. Apply now and take the next step toward your future!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {jobListings.map((job: any) => (
              <div key={job._id} className="bg-white shadow-lg rounded-xl p-4 sm:p-6 border border-gray-200 transform hover:scale-[1.02] transition">
                <h2 className="text-lg sm:text-xl font-bold text-red-600 mb-2">{job.title}</h2>
                <p className="text-gray-700 mb-1 text-xs sm:text-sm font-semibold">Company: {job.company}</p>
                <p className="text-gray-700 mb-1 text-xs sm:text-sm font-semibold">Location: {job.location}</p>
                <p className="text-gray-700 mb-1 text-xs sm:text-sm font-semibold">Deadline: {job.deadline}</p>
                <p className="text-gray-700 mb-1 text-xs sm:text-sm font-semibold">Stipend / Salary: {job.salary}</p>
                <p className="text-gray-700 mb-2 text-xs sm:text-sm font-semibold">Description: {job.shortDescription}</p>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 mt-4">
                  <Link
                    href={`/jobs/${job._id}`}
                    className="w-full sm:w-auto border border-black text-black px-4 sm:px-10 py-2 rounded-lg hover:bg-gray-100 transition text-center"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => !hasUserApplied(job._id) && openForm(job)}
                    className={`w-full sm:w-auto ${
                      hasUserApplied(job._id)
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600"
                    } text-white px-4 sm:px-12 py-2 rounded-lg shadow-md transition text-center`}
                    disabled={hasUserApplied(job._id)}
                  >
                    {hasUserApplied(job._id) ? "Applied" : "Apply"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showApplyForm && <ApplyForm job={selectedJob} onClose={closeForm} onSubmit={handleFormSubmit} />}
      {showSuccessModal && applicationId && <SuccessModal onClose={closeSuccessModal} applicationId={applicationId} />}
    </>
  );
}