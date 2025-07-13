// app/api/send-notification/route.ts
import { NextResponse } from 'next/server';
import { firebaseAdmin } from '../../../lib/firebase/admin';

// Same in-memory store as in register-token (NOT FOR PRODUCTION)
const deviceTokens: { [userId: string]: string } = {};
export async function POST(request: Request) {
  try {
    const { userId, title, body, imageUrl, clickUrl } = await request.json();

    const deviceToken = deviceTokens[userId]; // Retrieve from your (actual) database

    if (!deviceToken) {
      return NextResponse.json({ message: `No device token found for user ${userId}` }, { status: 404 });
    }

    const message = {
      notification: {
        title: title || 'New Next.js Notification!',
        body: body || 'This is a test notification from your Next.js backend.',
        imageUrl: imageUrl || undefined, // Optional image
      },
      data: {
        click_action: clickUrl || 'https://yournextjsapp.com/', // URL to open on click
        "key1": "value1", // Custom data
      },
      token: deviceToken,
    };

    const response = await firebaseAdmin.messaging().send(message);
    console.log('Successfully sent message:', response);

    return NextResponse.json({ message: 'Notification sent successfully', response }, { status: 200 });
  } catch (error: any) {
    console.error('Error sending message:', error);
    // You might want to differentiate errors (e.g., invalid token)
    return NextResponse.json({ message: 'Error sending notification', error: error.message }, { status: 500 });
  }
}