// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import  connectDB  from '../../../../lib/db';
import User from '../../../../models/User';
import { generateResetCode, sendPasswordResetEmail } from '../../../services/emailServices';

// Initialize a simple in-memory store for reset codes (in production use Redis or similar)
const resetCodes: Record<string, { code: string, expiry: Date }> = {};

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal if the email exists in the database
      return NextResponse.json({ success: true, message: 'If your email exists in our system, you will receive a reset code.' });
    }

    // Generate reset code
    const resetCode = generateResetCode();
    
    // Store reset code with 15-minute expiry
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 15);
    resetCodes[email] = { code: resetCode, expiry: expiryTime };
    
    // Send email with reset code
    const emailSent = await sendPasswordResetEmail(email, resetCode);
    
    if (emailSent) {
      return NextResponse.json({ 
        success: true, 
        message: 'If your email exists in our system, you will receive a reset code.'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send email' 
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

// Export the reset codes for access in the verification endpoint
export { resetCodes };