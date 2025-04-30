// app/api/applications/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    
    if (!jobId) {
      return NextResponse.json({ message: "Job ID is required" }, { status: 400 });
    }

    await connectDB();
    
    // Determine identifier 
    const identifier = session.user.email;
    
    if (!identifier) {
      return NextResponse.json({ message: "User identifier not found" }, { status: 400 });
    }

    // Get the applications collection
    const applicationsCollection = mongoose.connection.collection("applications");
    
    // Check if user has applied for this job
    const query = { email: session.user.email, jobId };
      
    const application = await applicationsCollection.findOne(query);
    
    return NextResponse.json({
      hasApplied: !!application,
      application
    });
    
  } catch (error) {
    console.error("Error checking application:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}