// pages/api/register-fcm-token.ts (for Pages Router)
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/db'; // Adjust path
import User from '../../../models/User'; // Adjust path
import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  if (request.method !== 'POST') {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  await dbConnect();

  const { token, userEmail } = await request.json();

  if (!token || !userEmail) {
    return NextResponse.json({ message: 'Missing token or userEmail' }, { status: 400 });
  }

  try {
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const existingSubscription = user.fcmSubscriptions.find(
      (sub) => sub.token === token
    );

    if (!existingSubscription) {
      user.fcmSubscriptions.push({ token, createdAt: new Date() });
      await user.save();
      console.log(`FCM Token ${token} added for user ${userEmail}`);
    } else {
      console.log(`FCM Token ${token} already exists for user ${userEmail}, not adding duplicate.`);
    }

    return NextResponse.json({ message: 'FCM Token registered successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}