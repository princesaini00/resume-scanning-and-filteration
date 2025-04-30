// app/api/applications/user/route.ts
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
    
    await connectDB();
    
    if (!session.user.email) {
      return NextResponse.json({ message: "User email not found" }, { status: 400 });
    }
    
    // Get the applications collection
    const applicationsCollection = mongoose.connection.collection("applications");
    
    // Find applications by user email
    const applications = await applicationsCollection.aggregate([
      {
        $match: { email: session.user.email }
      },
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "jobDetails"
        }
      },
      { $unwind: "$jobDetails" },
      {
        $project: {
          _id: 1,
          jobId: 1,
          applicationDate: 1,
          createdAt: 1, // Make sure this field is included
          status: { $ifNull: ["$status", "Pending"] },
          resumeUrl: 1,
          jobTitle: "$jobDetails.title",
          company: "$jobDetails.company",
          location: "$jobDetails.location"
        }
      }
    ]).toArray();
    
    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching user applications:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
