import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { name, email, password } = await request.json();

  // Validate required fields
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 } // Changed to standard 400 for bad request
    );
  }

  try {
    await connectToDatabase();

    // Check for existing user
    const existingUser = await User.findOne({ email }).select('_id').lean();
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" }, // More concise message
        { status: 409 } // 409 Conflict for duplicate resource
      );
    }

    // Create new user
    await User.create({ name, email, password });

    return NextResponse.json(
      { message: "Registration successful" }, // More concise message
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" }, // More user-friendly
      { status: 500 } // 500 for server errors
    );
  }
}