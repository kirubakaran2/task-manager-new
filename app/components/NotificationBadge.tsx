'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import NotificationPopup from './NotificationPopup';
import { requireAuth } from '../utils/auth';  // Import your requireAuth function
import { requestNotificationPermission, onMessageListener } from '@lib/firebase';

interface Notification {
  _id: string;
  taskId: string;
  taskSno: string;
  taskSubject: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationBadge: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Use effect to require authentication before fetching notifications
  useEffect(() => {
    // Ensure user is authenticated
    const userId = requireAuth();

    // Request permission for push notifications after user is authenticated
    requestNotificationPermission(userId);

    // Listen for new notifications in real-time
    const unsubscribe = onMessageListener();

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Set up polling for new notifications (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle clicks outside the popup to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/mark-as-read');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);

    // Mark notifications as read when opening popup
    if (!isOpen && unreadCount > 0) {
      markAsRead();
    }
  };

  const markAsRead = async () => {
    try {
      // Get IDs of unread notifications
      const unreadIds = notifications
        .filter(notification => !notification.isRead)
        .map(notification => notification._id);

      if (unreadIds.length === 0) return;

      const response = await fetch('/api/notifications/mark-as-read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds: unreadIds }),
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            unreadIds.includes(notification._id) 
              ? { ...notification, isRead: true } 
              : notification
          )
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return (
    <div className="relative">
      <Bell
        size={20}
        className="text-gray-600 cursor-pointer hover:text-blue-600"
        onClick={toggleNotifications}
      />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}

      {isOpen && (
        <div ref={popupRef}>
          <NotificationPopup 
            notifications={notifications} 
            onClose={() => setIsOpen(false)} 
          />
        </div>
      )}
    </div>
  );
};

export default NotificationBadge;
