import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    company: String,
    title: String,
    location: String,
    deadline: String,
    salary: String,
    shortDescription: String,
    detailedDescription: String,
    responsibilities: [String],
    skills: [String],
    contactEmail: String,
    contactPhone: String,
  },
  { timestamps: true }
);

export default mongoose.models.Job || mongoose.model("Job", JobSchema);
