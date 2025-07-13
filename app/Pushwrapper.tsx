'use client';

import { useEffect, useState, createContext, useContext } from "react";
import { Toaster } from 'react-hot-toast';
import { subscribeToPush } from "./utils/subscribeToPush";

interface UserDataFromCookie {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  department: string;
  location: string;
}

export const UserContext = createContext<UserDataFromCookie | null>(null);

interface PushwrapperProps {
  children: React.ReactNode;
}

export default function Pushwrapper({ children }: PushwrapperProps) {
  const [user, setUser] = useState<UserDataFromCookie | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const userCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user='));

    if (userCookie) {
      try {
        const decoded = decodeURIComponent(userCookie.split('=')[1]);
        const parsedUser: UserDataFromCookie = JSON.parse(decoded);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user cookie:", e);
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (isClient && user?.email && user?.id && 'serviceWorker' in navigator) {
      console.log("Attempting to subscribe to push notifications for user:", user.email, "ID:", user.id);
      subscribeToPush(user.id, user.email).catch(error => {
        console.error("Error subscribing to push notifications:", error);
      });
    } else if (isClient && !user) {
      console.log("Skipping push subscription: User not logged in.");
    }
  }, [user, isClient]);

  return (
    <UserContext.Provider value={user}>
      {children}
      <Toaster />
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const user = useContext(UserContext);
  if (user === undefined) {
    console.warn("useUser must be used within a Pushwrapper.");
  }
  return user;
};
