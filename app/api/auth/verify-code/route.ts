// app/api/auth/verify-code/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import PasswordResetToken from '../../../../models/PasswordResetToken';
import jwt from 'jsonwebtoken'; // Import jwt

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-jwt-verification'; // Ensure this is a strong, secret key

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({
        success: false,
        error: 'Email and code are required'
      }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or code' // Keep generic for security
      }, { status: 400 });
    }

    const tokenRecord = await PasswordResetToken.findOne({
      userId: user._id,
      token: code,
    });

    if (!tokenRecord) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or already used reset code'
      }, { status: 400 });
    }

    if (new Date() > tokenRecord.expiresAt) {
      await PasswordResetToken.deleteOne({ _id: tokenRecord._id }); // Clean up expired
      return NextResponse.json({
        success: false,
        error: 'Reset code has expired'
      }, { status: 400 });
    }

    // --- IMPORTANT CHANGE: Generate JWT (resetToken) and Invalidate 6-digit code ---

    // 1. Invalidate the 6-digit code immediately after successful verification
    await PasswordResetToken.deleteOne({ _id: tokenRecord._id });

    // 2. Generate a JWT that the frontend will use for the actual password reset
    const resetTokenJwt = jwt.sign(
      { email: user.email, purpose: 'password-reset' },
      JWT_SECRET,
      { expiresIn: '15m' } // Token valid for 15 minutes for the reset process
    );

    return NextResponse.json({
      success: true,
      message: 'Code verified successfully. You can now reset your password.',
      resetToken: resetTokenJwt, // <-- Return the JWT here
    });

  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred'
    }, { status: 500 });
  }
}
