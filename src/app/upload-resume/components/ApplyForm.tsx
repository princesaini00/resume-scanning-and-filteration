"use client";

import { useState } from "react";
import { FiUpload } from "react-icons/fi";

interface ApplyFormProps {
    job: any;
    onClose: () => void;
    onSubmit: (applicationId: string) => void;
}

export default function ApplyForm({ job, onClose, onSubmit }: ApplyFormProps) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [resume, setResume] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            // Validate inputs
            if (!fullName.trim()) throw new Error("Please enter your full name");
            if (!email.trim()) throw new Error("Please enter your email");
            if (!resume) throw new Error("Please upload your resume");
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error("Please enter a valid email address");
            }

            // Validate file type
            if (resume.type !== "application/pdf") {
                throw new Error("Only PDF files are accepted");
            }

            // Validate file size (5MB max)
            if (resume.size > 5 * 1024 * 1024) {
                throw new Error("File size must be less than 5MB");
            }

            const formData = new FormData();
            formData.append("name", fullName);
            formData.append("email", email);
            formData.append("jobId", job._id);
            formData.append("resume", resume);

            const response = await fetch("/api/applications", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Application submission failed");
            }

            const result = await response.json();
            onSubmit(result.applicationId);
            
            // Store application info in local storage
            localStorage.setItem('userEmail', email);
            
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : typeof err === "string"
                    ? err
                    : "Application submission failed";
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-[500px] shadow-xl relative z-10 border-1 border-gray-400">
                <h2 className="text-red-600 font-bold text-base sm:text-lg mb-1 sm:mb-2">{job?.title}</h2>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                    Please fill in the details correctly to apply for this position.
                </p>

                {error && (
                    <div className="mb-3 sm:mb-4 p-2 bg-red-100 text-red-700 text-xs sm:text-sm rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div>
                        <label className="block text-gray-800 text-xs sm:text-sm mb-1">Full Name</label>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-800 text-xs sm:text-sm mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 p-2 rounded text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-800 text-xs sm:text-sm mb-1">
                            Upload Resume (PDF only, max 5MB)
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                            <label className="cursor-pointer">
                                <span className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-100 border border-gray-300 rounded-md text-xs sm:text-sm flex items-center gap-2 hover:bg-gray-200">
                                    Upload <FiUpload />
                                </span>
                                <input
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={(e) => setResume(e.target.files ? e.target.files[0] : null)}
                                    className="hidden"
                                    required
                                />
                            </label>

                            <span className="text-xs sm:text-sm text-gray-500 truncate max-w-[200px] sm:max-w-full">
                                {resume ? resume.name : "No file chosen"}
                            </span>
                        </div>
                        {resume && (
                            <p className="text-xs text-gray-500 mt-1">
                                File size: {(resume.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2 sm:space-x-3 pt-3 sm:pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 sm:px-10 py-1.5 rounded-lg hover:bg-gray-100 border border-gray-300 text-sm"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 sm:px-10 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:cursor-pointer disabled:bg-red-300 text-sm"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Submitting..." : "Apply"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}