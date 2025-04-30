// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
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

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password and remove reset token fields
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { resetToken: "", resetTokenExpiry: "" },
      }
    );

    return NextResponse.json(
      { message: "Password has been reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { message: "An error occurred" },
      { status: 500 }
    );
  }
}