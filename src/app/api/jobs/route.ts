import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import Job from "@/models/Job";

export async function GET() {
  await connectToDatabase();
  const jobs = await Job.find();
  return NextResponse.json(jobs);
}

export async function POST(req: Request) {
  await connectToDatabase();
  const data = await req.json();
  const newJob = await Job.create(data);
  return NextResponse.json(newJob);
}
