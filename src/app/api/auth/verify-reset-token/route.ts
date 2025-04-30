// app/api/auth/verify-reset-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get users collection
    const usersCollection = mongoose.connection.collection("users");

    // Find user with this reset token that hasn't expired
    const user = await usersCollection.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Token is valid" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying reset token:", error);
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}