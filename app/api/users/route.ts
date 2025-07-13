import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import User from '../../../models/User';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userData = cookieStore.get('user_data');
    if (!userData) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { role, department } = JSON.parse(userData.value);

    await connectDB();

    let usersQuery = User.find().sort({ createdAt: -1 }).lean();

    if (role === 'user') {
      return NextResponse.json({ message: 'Hi' });
    }

    if (role === 'admin') {
      usersQuery = usersQuery.where('department').equals(department);
    }

    if (role === 'superadmin') {
      // No additional filtering needed
    }

    const users = await usersQuery.exec();

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}


// POST a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role, department, location } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Create new user without password hashing
    const user = await User.create({
      email,
      password: password, // Store the password in plain text
      role: role || 'user',
      department: department || '',
      location: location || '',
    });

    // Return user data without password
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      department: user.department,
      location: user.location,
      createdAt: user.createdAt,
    };

    return NextResponse.json(userData, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Failed to create user' },
      { status: 500 }
    );
  }
}
