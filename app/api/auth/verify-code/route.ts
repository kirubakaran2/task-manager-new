// app/api/auth/verify-code/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db'; // Import connectDB
import User from '@models/User'; // Import User model
import PasswordResetToken from '@models/PasswordResetToken'; // Import PasswordResetToken model

export async function POST(req: NextRequest) {
  try {
    await connectDB(); // Connect to the database
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and code are required' 
      }, { status: 400 });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email or code' 
      }, { status: 400 });
    }

    // Find the password reset token associated with the user and the provided code
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

    // Check if the reset code has expired
    if (new Date() > tokenRecord.expiresAt) {
      // Clean up the expired code from the database
      await PasswordResetToken.deleteOne({ _id: tokenRecord._id });
      return NextResponse.json({ 
        success: false, 
        error: 'Reset code has expired' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Code verified successfully. You can now reset your password.'

    });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred' 
    }, { status: 500 });
  }
}
