// app/services/notificationService.ts
import { firebaseAdmin } from '../../lib/firebase/admin';
import User, { IUser } from '../../models/User';
import dbConnect from '../../lib/db';

interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  clickUrl?: string;
  data?: { [key: string]: string }; // Custom data for the notification
}

export async function sendPushNotificationToUsers(
  userIds: string[],
  payload: NotificationPayload
) {
  if (!userIds || userIds.length === 0) {
    console.warn('No user IDs provided for notification.');
    return;
  }

  await dbConnect();

  try {
    const usersToNotify: IUser[] = await User.find({ _id: { $in: userIds } });

    const tokens: string[] = [];
    usersToNotify.forEach(user => {
      user.fcmSubscriptions.forEach(sub => {
        tokens.push(sub.token);
      });
    });

    if (tokens.length === 0) {
      console.log('No FCM tokens found for the specified users. No notification sent.');
      return;
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: {
        click_action: payload.clickUrl || '/',
        timestamp: new Date().toISOString(), // Add timestamp for client-side display
        ...payload.data, // Include any other custom data
      },
      tokens: tokens,
    };

    const response = await firebaseAdmin.messaging().sendEachForMulticast(message);
    console.log(`Successfully sent ${response.successCount} messages, failed ${response.failureCount} messages.`);

    if (response.failureCount > 0) {
      response.responses.forEach(async (resp, idx) => {
        if (!resp.success) {
          const failedToken = tokens[idx];
          console.error(`Failed to send message to token ${failedToken}:`, resp.error);
          if (resp.error?.code === 'messaging/invalid-argument' || resp.error?.code === 'messaging/registration-token-not-registered') {
            console.log(`Removing invalid token: ${failedToken}`);
            await User.updateOne(
              { 'fcmSubscriptions.token': failedToken },
              { $pull: { fcmSubscriptions: { token: failedToken } } }
            );
          }
        }
      });
    }

  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}