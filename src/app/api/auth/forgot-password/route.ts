// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import mongoose from "mongoose";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email"; // You'll need to create this

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get users collection
    const usersCollection = mongoose.connection.collection("users");

    // Check if user exists
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    // Even if user doesn't exist, return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: "If your email exists, you will receive a password reset link" },
        { status: 200 }
      );
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
        },
      }
    );

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Send email with reset link
    await sendPasswordResetEmail(user.email, resetUrl);

    return NextResponse.json(
      { message: "If your email exists, you will receive a password reset link" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return NextResponse.json(
      { message: "An error occurred. Please try again later" },
      { status: 500 }
    );
  }
}