// public/firebase-messaging-sw.js

// --- IndexedDB Helper Functions Start ---
const DB_NAME = 'NotificationsDB';
const STORE_NAME = 'notifications';
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
}

async function addNotification(notification) {
  const db = await openDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.add(notification);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}

// Function to update a notification (e.g., mark as read)
async function updateNotification(notification) {
  const db = await openDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.put(notification); // put() updates or adds if not exists
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}


async function getAllNotifications() {
  const db = await openDb();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function clearAllNotificationsDb() {
  const db = await openDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}
// --- IndexedDB Helper Functions End ---

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// --- PUT THIS MISSING BLOCK BACK IN ---
// Your Firebase config (ensure this matches your client.ts)
const firebaseConfig = {
  apiKey: "AIzaSyCnk5dJSyxMF56dqNlbRfQl_ipYF15SUeA",
  authDomain: "task-manager-7c1e5.firebaseapp.com",
  projectId: "task-manager-7c1e5",
  storageBucket: "task-manager-7c1e5.firebasestorage.app",
  messagingSenderId: "664967727346",
  appId: "1:664967727346:web:e6c7c4b11cba6695a6e86b",
  measurementId: "G-8H1CXS5WE2"
};

let app;
let messaging; // Declare messaging here

try {
  app = firebase.initializeApp(firebaseConfig);
  messaging = firebase.messaging(); // Initialize messaging here
  console.log('Firebase and Messaging initialized in SW successfully.');
} catch (e) {
  console.error('Failed to initialize Firebase or Messaging in SW:', e);
}
// --- END OF MISSING BLOCK ---


messaging.onBackgroundMessage(async (payload) => { // This line should now work
  console.log('[firebase-messaging-sw.js] Received background message', payload);

  const newNotification = {
    id: payload.messageId || Date.now(), // Use messageId for better uniqueness, fallback to Date.now()
    title: payload.notification?.title || 'Notification',
    body: payload.notification?.body || '',
    timestamp: payload.data?.timestamp || new Date().toISOString(),
    data: payload.data || {},
    read: false,
  };

  try {
    await addNotification(newNotification); // Save to IndexedDB
    console.log('Notification saved to IndexedDB by SW:', newNotification);
  } catch (e) {
    console.error('Failed to save notification to IndexedDB by SW:', e);
  }

  const notificationTitle = newNotification.title;
  const notificationOptions = {
    body: newNotification.body,
    icon: payload.notification?.icon || '/android-chrome-192x192.png',
    data: {
      url: payload.data?.click_action || '/notifications',
      // Pass the notification ID for the click handler to mark it read
      notificationId: newNotification.id,
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', async (event) => { // This line will also now work
    event.notification.close();

    const clickedNotificationId = event.notification.data?.notificationId;

    if (clickedNotificationId) {
      try {
        const allNotifications = await getAllNotifications();
        const notificationToUpdate = allNotifications.find(notif => notif.id === clickedNotificationId);
        if (notificationToUpdate) {
          notificationToUpdate.read = true;
          await updateNotification(notificationToUpdate);
          console.log('Notification marked as read in IndexedDB:', clickedNotificationId);
        }
      } catch (e) {
        console.error('Failed to update notification read status in IndexedDB:', e);
      }
    }

    const urlToOpen = event.notification.data?.url || '/notifications';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'CLEAR_NOTIFICATIONS') {
    try {
      await clearAllNotificationsDb();
      console.log('All notifications cleared from IndexedDB by client request.');
      event.source.postMessage({ type: 'NOTIFICATIONS_CLEARED' }); // Notify client
    } catch (e) {
      console.error('Failed to clear notifications from IndexedDB:', e);
    }
  }
});