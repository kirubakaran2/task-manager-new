// lib/utils/indexedDb.ts

// These interfaces are for better TypeScript support, optional but good practice
interface NotificationData {
  id: string | number;
  title: string;
  body: string;
  timestamp: string;
  data: { [key: string]: string };
  read: boolean;
}

const DB_NAME = 'NotificationsDB';
const STORE_NAME = 'notifications';
const DB_VERSION = 1;

export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Open the database request
    const request: IDBOpenDBRequest = indexedDB.open(DB_NAME, DB_VERSION);

    // This event fires if the database needs to be created or its version updated
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Create an object store if it doesn't already exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    // This event fires if the database is successfully opened
    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    // This event fires if there's an error opening the database
    request.onerror = (event: Event) => {
      console.error('IndexedDB error opening database:', (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
}

// Function to add a new notification to the object store
export async function addNotification(notification: NotificationData): Promise<void> {
  const db = await openDb();
  // Start a readwrite transaction
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.add(notification); // Add the notification object
    request.onsuccess = () => resolve();
    request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
  });
}

// Function to update an existing notification (e.g., to mark as read)
export async function updateNotification(notification: NotificationData): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.put(notification); // put() can add or update based on keyPath
    request.onsuccess = () => resolve();
    request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
  });
}

// Function to retrieve all notifications from the object store
export async function getAllNotifications(): Promise<NotificationData[]> {
  const db = await openDb();
  const transaction = db.transaction(STORE_NAME, 'readonly'); // Readonly transaction
  const store = transaction.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.getAll(); // Get all items
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
  });
}

// Function to clear all notifications from the object store (client-side initiated)
export async function clearAllNotificationsDbClient(): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.clear(); // Clear all items
    request.onsuccess = () => resolve();
    request.onerror = (event: Event) => reject((event.target as IDBRequest).error);
  });
}