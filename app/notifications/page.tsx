// app/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { FaBell, FaTrash } from 'react-icons/fa';

// Import the IndexedDB helper functions
import { getAllNotifications, updateNotification, clearAllNotificationsDbClient } from '../utils/indexDb';

interface AppNotification {
  id: string | number; // Ensure this matches the ID type (e.g., messageId from payload)
  title: string;
  body: string;
  timestamp: string; // ISO string
  data: { [key: string]: string };
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch notifications from IndexedDB
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const storedNotifications = await getAllNotifications(); // Call the IndexedDB helper
      // Sort by timestamp descending (newest first)
      storedNotifications.sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime());
      setNotifications(storedNotifications as AppNotification[]); // Type assertion
    } catch (e) {
      console.error('Failed to load notifications from IndexedDB:', e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(); // Initial fetch on mount

    // Listen for messages from the Service Worker (e.g., to re-fetch on new notification)
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NEW_NOTIFICATION_ADDED') {
        fetchNotifications(); // Re-fetch when SW adds a new notification
      }
      if (event.data && event.data.type === 'NOTIFICATIONS_CLEARED') {
        setNotifications([]); // Update UI immediately after clear from SW
      }
    };

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

      // Tell the service worker to update the client when a new notification is added.
      // You'll need to add a postMessage in firebase-messaging-sw.js as well.
      // This is a more proactive way to keep the UI in sync.
      navigator.serviceWorker.ready.then(registration => {
        // You might send a message to the SW here to indicate client is ready to receive updates
        // Or simply rely on the SW to post messages when it adds data.
      });
    }

    return () => {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // Function to mark a notification as read in IndexedDB
  const markAsRead = async (id: string | number) => { // Use string|number for ID
    const notificationToUpdate = notifications.find(notif => notif.id === id);
    if (notificationToUpdate && !notificationToUpdate.read) {
      const updatedNotif = { ...notificationToUpdate, read: true };
      try {
        await updateNotification(updatedNotif); // Update in IndexedDB
        setNotifications(prev => prev.map(notif => notif.id === id ? updatedNotif : notif));
      } catch (e) {
        console.error('Failed to mark notification as read in IndexedDB:', e);
      }
    }
  };

  // Function to clear all notifications from IndexedDB
  const clearAllNotifications = async () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      try {
        // Send a message to the Service Worker to clear its IndexedDB
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_NOTIFICATIONS' });
        } else {
          // Fallback if no active service worker controller (though less common in a PWA context)
          await clearAllNotificationsDbClient(); // Direct client-side clear
          setNotifications([]);
        }
        alert('All notifications cleared!');
      } catch (e) {
        console.error('Failed to clear notifications:', e);
        alert('Failed to clear notifications.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <p className="text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FaBell className="mr-3 text-blue-500" /> Notifications
          </h1>
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center text-sm"
            >
              <FaTrash className="mr-2" /> Clear All
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="text-center text-gray-500 text-lg py-10">
            You don't have any notifications yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200
                  ${notif.read ? 'bg-gray-50 border-gray-200 text-gray-600' : 'bg-white border-blue-200 shadow-md hover:shadow-lg'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h2 className={`text-lg font-semibold ${notif.read ? 'text-gray-700' : 'text-blue-700'}`}>
                    {notif.title}
                  </h2>
                  <span className={`text-sm ${notif.read ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDistanceToNow(parseISO(notif.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className={`text-sm ${notif.read ? 'text-gray-500' : 'text-gray-600'}`}>
                  {notif.body}
                </p>
                {notif.data && Object.keys(notif.data).length > 0 && (
                  <div className="mt-2 text-xs text-gray-400">
                    {Object.entries(notif.data).map(([key, value]) => (
                      <span key={key} className="mr-2">
                        <strong>{key}:</strong> {value}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}