// app/api/auth/verify-code/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { resetCodes } from '../forgot-password/route'; // Import the reset codes from the forgot password route
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and code are required' 
      }, { status: 400 });
    }

    // Check if reset code exists and is valid
    const resetData = resetCodes[email];
    if (!resetData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired reset code' 
      }, { status: 400 });
    }

    // Check if reset code has expired
    if (new Date() > resetData.expiry) {
      delete resetCodes[email]; // Clean up expired code
      return NextResponse.json({ 
        success: false, 
        error: 'Reset code has expired' 
      }, { status: 400 });
    }

    // Check if code matches
    if (resetData.code !== code) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid reset code' 
      }, { status: 400 });
    }

    // Generate a reset token that will be valid for 15 minutes
    const resetToken = jwt.sign(
      { email, purpose: 'password-reset' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Clean up the used reset code
    delete resetCodes[email];

    return NextResponse.json({ 
      success: true, 
      resetToken 
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred' 
    }, { status: 500 });
  }
}