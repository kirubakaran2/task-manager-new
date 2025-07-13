// lib/firebase/client.ts
"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your Firebase configuration (copied from Firebase Console)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (only once)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const messaging = typeof window !== 'undefined' && getMessaging(app);

// Function to save a notification to localStorage
const saveNotificationToLocalStorage = (notificationData: any) => {
  if (typeof window !== 'undefined') {
    try {
      const existingNotifications = JSON.parse(localStorage.getItem('app_notifications') || '[]');
      const newNotification = {
        id: Date.now(), // Simple unique ID
        title: notificationData.title || 'Notification',
        body: notificationData.body || '',
        timestamp: new Date().toISOString(),
        data: notificationData.data || {}, // Store any custom data
        read: false, // Mark as unread by default
      };
      existingNotifications.unshift(newNotification); // Add to the beginning
      localStorage.setItem('app_notifications', JSON.stringify(existingNotifications));
      console.log('Notification saved to localStorage:', newNotification);
    } catch (e) {
      console.error('Failed to save notification to localStorage:', e);
    }
  }
};

// Request permission and get FCM token
export async function getFCMToken() {
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
      });
      if (currentToken) {
        console.log('FCM registration token:', currentToken);
        return currentToken;
      } else {
        console.warn('No registration token available. Request permission to generate one.');
        return null;
      }
    } else {
      console.warn('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

// Handle foreground messages
export function onMessageListener() {
    if (!messaging) return;

    return new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            console.log('Foreground message received: ', payload);
            // Save the foreground notification to localStorage
            saveNotificationToLocalStorage(payload.notification);
            resolve(payload);
        });
    });
}