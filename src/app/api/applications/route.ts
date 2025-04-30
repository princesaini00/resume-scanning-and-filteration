import { NextResponse } from 'next/server';
import Application from '@/models/Application';
import connectToDatabase from '@/lib/database';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    const loggedInEmail = session?.user?.email;

    if (!loggedInEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  

    const formData = await request.formData();
    const name = formData.get('name')?.toString();
    const contactEmail = formData.get('email')?.toString();
    const jobId = formData.get('jobId')?.toString();
    const resume = formData.get('resume');

    if (!name || !contactEmail || !jobId || !resume) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!(resume instanceof Blob)) {
      return NextResponse.json({ error: "Invalid file format" }, { status: 400 });
    }

    const existingApp = await Application.findOne({ email: loggedInEmail, jobId });
    if (existingApp) {
      return NextResponse.json(
        { error: "You've already applied for this position" },
        { status: 409 }
      );
    }

    const bytes = await resume.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = (resume as File).name || "resume.pdf";
    const fileName = `resumes/${Date.now()}_${name.replace(/\s+/g, '_')}_${originalName.replace(/\s+/g, '_')}`;

    const storageRef = ref(storage, fileName);

    console.log("Uploading resume to Firebase...");

    try {
      await uploadBytes(storageRef, buffer);
    } catch (uploadErr) {
      console.error("Upload error:", uploadErr);
      return NextResponse.json({ error: "Failed to upload resume" }, { status: 500 });
    }

    console.log("Got resume file name:", originalName);

    const resumeUrl = await getDownloadURL(storageRef);

    // Send resume to Python Flask server for parsing
    // Declare these variables before using them
    let parsedData = {};
    let parseError = null;

    try {
      const resumeBlob = resume as Blob;
      const parseFormData = new FormData();
      parseFormData.append('resume', resumeBlob, originalName);

      console.log("Sending resume to parsing server...");
      
      const parseResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parse-resume`, {
        method: "POST",
        body: parseFormData,
      });

      const responseText = await parseResponse.text();
      console.log("Parser response received");
      
      try {
        // Try to parse as JSON
        const jsonData = JSON.parse(responseText);
        
        if (!parseResponse.ok) {
          parseError = jsonData.error || "Resume parsing failed";
          console.error("Resume parsing failed:", parseError);
        } else {
          parsedData = jsonData;
          // Log a sample of the parsed data
          console.log("Successfully parsed resume data with fields:", 
            Object.keys(parsedData).join(", "));
        }
      } catch (jsonErr) {
        console.error("Failed to parse JSON response:", responseText.substring(0, 200));
        parseError = "Invalid response from parsing server";
      }
    } catch (err) {
      parseError = err instanceof Error ? err.message : "Error contacting Flask server";
      console.error("Error contacting Flask server:", parseError);
    }

    // Create the application with parsedData (even if empty)
    const application = await Application.create({
      name,
      email: loggedInEmail,
      contactEmail,
      jobId,
      resumeUrl,
      fileName: originalName,
      status: 'submitted',
      parsedData: parsedData || {}, // Ensure we have at least an empty object
    });

    return NextResponse.json({
      success: true,
      applicationId: application._id.toString(),
      resumeUrl,
      parseError: parseError, // Return any parsing error to the client
    });

  } catch (error: any) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      {
        error: error.message || "Server error",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
