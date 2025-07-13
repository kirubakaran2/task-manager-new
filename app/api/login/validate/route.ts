import { NextRequest, NextResponse } from 'next/server';
// Remove the unused cookies import
// import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';

interface IUser {
  _id: string;
  email: string;
  role: string;
  department: string;
  location: string;
  password: string;
}

// Token validation endpoint
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as jwt.JwtPayload;

    // Check if user exists in database
    await connectDB();
    const user = await User.findById<IUser>(decoded.id).select('-password').lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
    }

    // Return success with user data
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        department: user.department,
        location: user.location
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid token' },
      { status: 401 }
    );
  }
}
