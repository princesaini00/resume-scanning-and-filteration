"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import axios from "axios";
import Navbar from "@/app/resume-filter/components/EmployeeNavbar";

interface Job {
  _id: string;
  company: string;
  title: string;
  location: string;
  deadline: string;
  salary: string;
  shortDescription: string;
  detailedDescription: string;
  responsibilities: string[];
  skills: string[];
  contactEmail: string;
  contactPhone: string;
}

export default function AdminAddJobPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [formData, setFormData] = useState({
    company: "",
    title: "",
    location: "",
    deadline: "",
    salary: "",
    shortDescription: "",
    detailedDescription: "",
    responsibilities: "",
    skills: "",
    contactEmail: "",
    contactPhone: "",
  });

  const fetchJobs = async () => {
    try {
      const res = await axios.get("/api/jobs");
      setJobs(res.data);
    } catch (error) {
      toast.error("Failed to fetch jobs");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const jobData = {
        ...formData,
        responsibilities: formData.responsibilities.split("\n"),
        skills: formData.skills.split("\n"),
      };
      await axios.post("/api/jobs", jobData);
      toast.success("Job added successfully!");
      setFormData({
        company: "",
        title: "",
        location: "",
        deadline: "",
        salary: "",
        shortDescription: "",
        detailedDescription: "",
        responsibilities: "",
        skills: "",
        contactEmail: "",
        contactPhone: "",
      });
      fetchJobs();
    } catch {
      toast.error("Error adding job.");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this job and all related data?");
    if (!confirmDelete) return;
    try {
      await axios.delete(`/api/jobs/${id}`);
      toast.success("Job deleted.");
      fetchJobs();
    } catch {
      toast.error("Failed to delete job.");
    }
  };

  return (
    <>
    <Navbar/>
    <div className="p-4 sm:p-6 md:p-10 max-w-6xl mx-auto">
      {/* Header and Nav */}
      <div className="mb-6 md:mb-10 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-red-600">Admin Job Manager</h1>
        <p className="text-gray-700 mb-4 text-base md:text-lg px-2">
          Manage your job postings here. Add, view, and delete jobs as needed. This platform helps streamline job management.
        </p>
        <Link
          href="/resume-filter"
          className="inline-block bg-red-500 text-white px-4 py-2 md:px-6 md:py-2 rounded-lg hover:bg-red-600 transition text-sm md:text-base"
        >
          Go to Resume Filter
        </Link>
      </div>

      {/* Add Job Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-4 md:p-6 space-y-3 md:space-y-4 border border-gray-200 max-w-3xl mx-auto mb-6 md:mb-10">
        <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">Add New Job</h2>
        {[
          { name: "company", label: "Company Name" },
          { name: "title", label: "Job Title" },
          { name: "location", label: "Location" },
          { name: "deadline", label: "Deadline" },
          { name: "salary", label: "Salary" },
          { name: "contactEmail", label: "Contact Email" },
          { name: "contactPhone", label: "Contact Phone" },
        ].map(({ name, label }) => (
          <input
            key={name}
            name={name}
            placeholder={label}
            value={formData[name as keyof typeof formData]}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-2 md:p-3 rounded-lg text-base md:text-lg"
          />
        ))}
        <textarea
          name="shortDescription"
          placeholder="Short Description (Max. one line)"
          value={formData.shortDescription}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-2 md:p-3 rounded-lg text-base md:text-lg"
        />
        <textarea
          name="detailedDescription"
          placeholder="Detailed Description"
          value={formData.detailedDescription}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-2 md:p-3 rounded-lg text-base md:text-lg"
        />
        <textarea
          name="responsibilities"
          placeholder="Responsibilities (one per line)"
          value={formData.responsibilities}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-2 md:p-3 rounded-lg text-base md:text-lg"
        />
        <textarea
          name="skills"
          placeholder="Skills Required (one per line)"
          value={formData.skills}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-2 md:p-3 rounded-lg text-base md:text-lg"
        />
        <button
          type="submit"
          className="bg-red-500 text-white px-6 py-2 md:px-8 md:py-3 rounded-lg hover:bg-red-600 transition text-sm md:text-base"
        >
          Add Job
        </button>
      </form>

      {/* Uploaded Jobs Section */}
      <div className="mb-4">
        <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Jobs You've Added</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white shadow-lg rounded-xl p-4 md:p-6 border border-gray-200">
              <h3 className="text-lg md:text-xl font-bold text-red-600 mb-2">{job.title}</h3>
              <p className="text-gray-700 text-xs md:text-sm font-semibold mb-1">Company: {job.company}</p>
              <p className="text-gray-700 text-xs md:text-sm font-semibold mb-1">Location: {job.location}</p>
              <p className="text-gray-700 text-xs md:text-sm font-semibold mb-1">Deadline: {job.deadline}</p>
              <p className="text-gray-700 text-xs md:text-sm font-semibold mb-1">Salary: {job.salary}</p>
              <p className="text-gray-700 text-xs md:text-sm font-semibold mb-2 line-clamp-2">Description: {job.shortDescription}</p>
              <button
                onClick={() => handleDelete(job._id)}
                className="bg-red-500 text-white px-5 py-1.5 md:px-7 md:py-2 rounded-lg hover:bg-red-600 transition text-sm md:text-base"
              >
                Delete Job
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}