import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear the 'token' cookie by setting its maxAge to 0
    (await cookies()).set({
      name: 'token',
      value: '',
      path: '/',
      domain: 'localhost', // Ensure this matches how your cookie was set
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      maxAge: 0,
    });

    return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
  }
}
