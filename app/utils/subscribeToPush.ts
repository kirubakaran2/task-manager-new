// app/utils/subscribeToPush.ts
import { getFCMToken } from '../../lib/firebase/client'; 
export async function subscribeToPush(userId: string, userEmail: string) { 
  try {
    const token = await getFCMToken(); 
    if (token) {
      const response = await fetch('/api/register-fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userId, userEmail }), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to register FCM token:', errorData);
      } else {
        console.log('FCM token registered successfully!');
      }
    } else {
      console.warn('FCM token not available. Cannot subscribe to push notifications.');
    }
  } catch (error) {
    console.error('Error in subscribeToPush:', error);
  }
}