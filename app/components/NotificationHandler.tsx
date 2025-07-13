'use client';

import { useEffect, useState } from 'react';
import { getFCMToken, onMessageListener } from '../../lib/firebase/client';
import  toast  from 'react-hot-toast';
import { useUser } from '../Pushwrapper';

export default function NotificationHandler() {
  const user = useUser();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    const setupNotifications = async () => {
      if (!user?.email || !user?.id) {
        console.log("User not logged in, skipping notification setup in NotificationHandler.");
        return;
      }

      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log('Service Worker registered with scope:', registration.scope);
        } catch (error) {
          console.error('Service Worker registration failed:', error);
          toast.error("Failed to register push notifications.");
        }
      }

      const token = await getFCMToken();
      if (token) {
        setFcmToken(token);
        await sendTokenToServer(token, user.id, user.email);
      }
    };

    if (user) {
      setupNotifications();
    }

    const listener = onMessageListener?.();
    if (listener && typeof listener.then === 'function') {
      listener.then((payload) => {
        if (
          typeof payload === 'object' &&
          payload !== null &&
          'notification' in payload &&
          typeof (payload as any).notification === 'object'
        ) {
          const { title, body } = (payload as any).notification;
          setNotification(payload);
          toast(`🔔 ${title}: ${body}`, {
            position: "top-right",
            duration: 5000,
          });
        }
      }).catch((err) => {
        console.error("Error handling foreground notification:", err);
      });
    }

    return () => {
      // Add cleanup logic here if necessary
    };
  }, [user]);

  const sendTokenToServer = async (token: string, userId: string, userEmail: string) => {
    try {
      const response = await fetch('/api/register-fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userId, userEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to save FCM token:', data);
        toast.error("Failed to save push notification subscription.");
      } else {
        console.log('FCM Token saved on backend:', data);
      }
    } catch (error) {
      console.error('Error sending FCM token to backend:', error);
      toast.error("Error connecting for push notifications.");
    }
  };

  return <div />;
}
