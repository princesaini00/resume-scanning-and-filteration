import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
import Job from "@/models/Job";

// Fetch a single job by ID (GET)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = await params;  // Await params to get the value
    const job = await Job.findById(id).lean();

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    console.error("GET /api/jobs/[id] error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// Delete a job by ID (DELETE)
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const deleted = await Job.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Job deleted", deleted }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/jobs/[id] error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
