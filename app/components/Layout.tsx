'use client';
import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, User, LogOut, Home, Clipboard, Settings } from 'lucide-react';
import NotificationBadge from './NotificationBadge';
import { requireAuth } from '../utils/auth'; // Adjust import path for your project

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // If user is not logged in, requireAuth will handle the redirect
  useEffect(() => {
    requireAuth(); // This will handle redirect if user is not authenticated
  }, []);

  return (
    <>
      <Head>
        <title>Task Management System</title>
        <meta name="description" content="Task Management System" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-30 w-64 transform bg-blue-800 transition-all duration-300 md:static md:translate-x-0`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-center h-16 bg-blue-900">
              <h1 className="text-xl font-bold text-white">Task Manager</h1>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-4">
              <Link
                href="/Dashboard"
                className={`flex items-center rounded-md px-4 py-2 ${
                  pathname === '/dashboard'
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-700'
                }`}
              >
                <Home className="w-5 h-5 mr-3" />
                Dashboard
              </Link>

              <Link
                href="/tasks"
                className={`flex items-center rounded-md px-4 py-2 ${
                  pathname?.startsWith('/tasks')
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-700'
                }`}
              >
                <Clipboard className="w-5 h-5 mr-3" />
                Tasks
              </Link>

              <Link
                href="/settings"
                className={`flex items-center rounded-md px-4 py-2 ${
                  pathname === '/settings'
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-700'
                }`}
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </nav>

            <div className="border-t border-blue-700 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <User size={18} />
                </div>
                <div className="ml-3">
                  {/* Display user info here */}
                  <p className="text-sm font-medium text-white">User Name</p>
                  <p className="text-xs text-blue-200">user@example.com</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="mt-4 flex w-full items-center rounded-md px-4 py-2 text-sm text-blue-100 hover:bg-blue-700"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top navigation */}
          <header className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-gray-500 focus:outline-none md:hidden"
                >
                  <Menu size={24} />
                </button>

                <div className="flex items-center space-x-4">
                  {/* Notification icon with badge */}
                  <NotificationBadge />
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto bg-gray-100">
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

export default Layout;
