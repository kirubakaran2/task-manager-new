import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Clipboard, MessageSquare, X } from 'lucide-react';

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

interface NotificationPopupProps {
  notifications: Notification[];
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ notifications, onClose }) => {
  // Function to get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return <Clipboard size={16} className="text-blue-500" />;
      case 'comment_added':
        return <MessageSquare size={16} className="text-green-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  // Function to format time
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <h3 className="font-medium">Notifications</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={16} />
        </button>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-4 px-4 text-center text-gray-500">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <Link 
              href={`/tasks/${notification.taskId}`}
              key={notification._id}
              className={`block px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                !notification.isRead ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    Task #{notification.taskSno}: {notification.taskSubject}
                  </div>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
      
      <div className="px-4 py-2 border-t border-gray-200">
        <Link href="/notifications" className="text-sm text-blue-600 hover:text-blue-800">
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationPopup;