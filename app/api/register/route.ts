/**
 * User Registration API Endpoint
 *
 * POST /api/register
 *
 * Creates a new user account with username, email, and password.
 * Validates input, checks for duplicates, hashes password, and creates user in database.
 *
 * Request body:
 * {
 *   username: string (min 3 chars, alphanumeric + underscore/dash)
 *   email: string (valid email format)
 *   password: string (min 6 chars)
 * }
 *
 * Response codes:
 * - 201: User created successfully
 * - 400: Invalid input (missing fields, invalid format)
 * - 409: Duplicate username or email
 * - 500: Server error
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Validation helpers
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUsername(username: string): boolean {
  // 3-20 characters, alphanumeric plus underscore and dash
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

function isValidPassword(password: string): boolean {
  // Minimum 6 characters (can be enhanced later)
  return password.length >= 6;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { username, email, password } = body;

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields. Please provide username, email, and password." },
        { status: 400 }
      );
    }

    // Validate username format
    if (!isValidUsername(username)) {
      return NextResponse.json(
        {
          error:
            "Invalid username. Must be 3-20 characters, alphanumeric with optional underscores/dashes.",
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check for duplicate username
    const existingUsername = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken. Please choose a different username." },
        { status: 409 }
      );
    }

    // Check for duplicate email
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already registered. Please use a different email or try logging in." },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        name: username, // Default name to username
      },
      // Don't return password hash
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Return success response
    return NextResponse.json(
      {
        message: "Account created successfully! You can now log in.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Return generic error message to avoid exposing internal details
    return NextResponse.json(
      { error: "An error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
