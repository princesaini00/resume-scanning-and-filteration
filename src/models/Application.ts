import mongoose, { Schema, models } from "mongoose";

const ApplicationSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactEmail: { type: String},
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    resumeUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    status: {
      type: String,
      required: true,
      default: 'submitted',
      enum: ['submitted', 'reviewed', 'rejected', 'hired']
    },
    parsedData: {
      type: Schema.Types.Mixed,  // Added parsed data field to schema
      default: {},
    },
  },
  { timestamps: true }
);

// Check if model already exists before creating it
const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
export default Application;
