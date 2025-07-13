// File: app/api/auth/route.ts (or wherever this file resides)
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '../../../lib/db';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import { Document, HydratedDocument } from 'mongoose';

interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  role: string;
  department: string;
  location: string;
}

// Login endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    console.log('Login attempt with body:', body);

    if (!email || !password) {
      console.error('Email or password is missing');
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectDB();
    console.log('Database connected successfully');

    // Normalize email to lowercase and trim spaces before querying
    const normalizedEmail = email.trim().toLowerCase();
    console.log('Normalized email:', normalizedEmail);

    // Find the user by email
    const user = await User.findOne({ email: normalizedEmail }, 'email password role department location') as HydratedDocument<IUser>;
    console.log('User lookup result:', user ? 'User found' : 'User not found');

    // Check if user exists
    if (!user) {
      console.error('User not found for email:', normalizedEmail);
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Compare passwords (plain text)
    console.log('Stored password:', user.password);
    console.log('Input password:', password);
    
    // Compare passwords directly (plain text)
const storedPassword = user.password.trim();
const inputPassword = password.trim();
console.log(`Comparing passwords: Stored - ${storedPassword}, Input - ${inputPassword}`);

if (storedPassword !== inputPassword) {
  console.error('Password mismatch for user:', normalizedEmail);
  return NextResponse.json(
    { message: 'Invalid credentials' },
    { status: 401 }
  );
}


    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: rememberMe ? '30d' : '1d' }
    );

    console.log('JWT token created with expiration:', rememberMe ? '30d' : '1d');

    // Set cookie based on rememberMe option
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
      sameSite: 'strict' as const,
    };

    const cookieStore = await cookies();

    // Set JWT token
    cookieStore.set('token', token, cookieOptions);

    // Set user data as a JSON string (encoded)
    const userData = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      department: user.department,
      location: user.location,
    };

    cookieStore.set('user', JSON.stringify(userData), {
      ...cookieOptions,
      httpOnly: false, // Allows frontend access
    });
    

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token: token,
    }, { status: 200
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    );
  }
}
