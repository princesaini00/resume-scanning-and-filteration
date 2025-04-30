"use client";

import { useEffect, useState } from "react";
import UploadNavbar from "@/app/upload-resume/components/UploadNavbar";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FaClock, FaCalendarAlt, FaFileAlt } from "react-icons/fa";

interface Application {
  _id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  createdAt: string;
  status: string;
  resumeUrl: string;
}

export default function AlreadyAppliedPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch("/api/applications/user");
          const data = await res.json();
          setApplications(data);
        } catch (err) {
          console.error("Failed to fetch applications", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [session]);

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
      <UploadNavbar />
      <div className="p-4 sm:p-6 md:p-10">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 md:mb-4">My Applications</h1>
          <p className="text-gray-700 text-sm sm:text-base">
            Track all your job applications and their current status. Check back regularly for updates on your applications.
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 md:p-8 border border-gray-200 text-center">
            <p className="text-base sm:text-lg text-gray-600 mb-4">You haven't applied to any jobs yet.</p>
            <Link
              href="/upload-resume"
              className="bg-red-500 text-white px-4 sm:px-6 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {applications.map((application) => (
              <div
                key={application._id}
                className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 md:p-8 border border-gray-200 flex flex-col justify-between min-h-[300px] sm:min-h-[340px] transform hover:scale-[1.02] transition"
              >
                <div>
                  {/* Title and Status */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-red-600 mb-2 sm:mb-0">{application.jobTitle}</h2>
                    <span
                      className={`px-3 sm:px-4 py-1 rounded-full text-xs font-semibold w-fit ${
                        application.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : application.status === "Reviewing"
                          ? "bg-blue-100 text-blue-800"
                          : application.status === "Accepted"
                          ? "bg-green-100 text-green-800"
                          : application.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>

                  {/* Company and Location */}
                  <p className="text-gray-700 font-semibold mb-1">{application.company}</p>
                  <p className="text-gray-600 mb-3">{application.location}</p>

                  {/* Applied Date */}
                  <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-2">
                    <FaCalendarAlt className="mr-2" />
                    <span>Applied on {new Date(application.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Resume Link */}
                  <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                    <FaFileAlt className="mr-2" />
                    <Link href={application.resumeUrl} target="_blank" className="underline hover:text-red-500">
                      View Resume
                    </Link>
                  </div>
                </div>

                {/* View Job Button */}
                <div className="mt-4 sm:mt-6">
                  <Link
                    href={`/jobs/${application.jobId}`}
                    className="w-full inline-block text-center bg-red-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-600 transition text-xs sm:text-sm font-semibold"
                  >
                    View Job Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}