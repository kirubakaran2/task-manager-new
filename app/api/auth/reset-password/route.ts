// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { resetToken, newPassword } = await req.json();

    if (!resetToken || !newPassword) {
      return NextResponse.json({
        success: false,
        error: 'Reset token and new password are required'
      }, { status: 400 });
    }

    // Password validation
    if (newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET) as { email: string, purpose: string };
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token'
      }, { status: 400 });
    }

    // Check token purpose
    if (decoded.purpose !== 'password-reset') {
      return NextResponse.json({
        success: false,
        error: 'Invalid token purpose'
      }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // WARNING: Saving passwords in plain text is insecure and should never be done in production
    user.password = newPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred'
    }, { status: 500 });
  }
}
