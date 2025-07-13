// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import User from '@models/User';
import PasswordResetToken from '@models/PasswordResetToken';
import { generateResetCode, sendPasswordResetEmail } from '../../../services/emailServices';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: true, message: 'If your email exists in our system, you will receive a reset code.' });
    }

    const resetCode = generateResetCode();
    
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 15);

    await PasswordResetToken.deleteMany({ userId: user._id });

    const newResetToken = new PasswordResetToken({
      userId: user._id,
      token: resetCode,
      expiresAt: expiryTime,
    });
    await newResetToken.save();
    
    const emailSent = await sendPasswordResetEmail(email, resetCode);
    
    if (emailSent) {
      return NextResponse.json({ 
        success: true, 
        message: 'If your email exists in our system, you will receive a reset code.'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send reset email. Please try again later.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred' 
    }, { status: 500 });
  }
}
