// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to MongoDB using Mongoose
    await connectDB();
    
    // Since we're using Mongoose, we need to use the connection directly
    const usersCollection = mongoose.connection.collection("users");

    // Check if user exists
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    await usersCollection.insertOne(newUser);

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}