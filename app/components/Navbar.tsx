'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getCookie, removeCookie } from '../utils/cookies'; 
import {
  LayoutDashboard,
  Database,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  Settings,
  ChevronDown,
  CirclePlus,
  ChevronUp,
} from "lucide-react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('user'); // default to user
  const pathname = usePathname();

  useEffect(() => {
    const userCookie = getCookie('user_data');
    if (userCookie) {
      const user = JSON.parse(userCookie);
      if (user && user.email) {
        const name = user.email.split('@')[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        setUserEmail(user.email);
        setUserRole(user.role || 'user');
      }
    }
  }, []);

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/Dashboard" },
    { icon: <Database size={20} />, label: "Task", href: "/task" },
    { icon: <FileText size={20} />, label: "Task Report", href: "/task-report" },
  ];

  const settingsItems = [
    { icon: <Users size={20} />, label: "Add Users", href: "/assignee" },
    { icon: <CirclePlus size={20} />, label: "Add-ons", href: "/add-ons" },
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        removeCookie('user', { path: '/' });
        removeCookie('auth_token', { path: '/' });
        removeCookie('user_data', { path: '/' });
        window.location.href = "/login";
      } else {
        console.error('Server-side logout failed.');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white z-30 flex items-center px-4 border-b">
        <button
          className="menu-button p-2 rounded-md text-gray-600 hover:bg-gray-100"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`sidebar fixed top-0 left-0 h-full bg-white border-r z-40 transition-transform duration-300 ease-in-out
                    w-64 md:w-64 md:translate-x-0 md:z-10
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close button for mobile */}
        <div className="md:hidden flex items-center justify-between p-4 border-b">
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 flex items-center border-b">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
          <div className="ml-3 overflow-hidden">
            <p className="font-medium text-gray-800">{userName || "John Doe"}</p>
            <p className="text-sm text-gray-500 truncate">{userEmail || "johndoe@gmail.com"}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-2">
          <ul>
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <li key={index}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600
                                ${isActive ? "bg-blue-600 text-white" : ""}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}

            {/* Settings - only show if NOT a "user" */}
            {userRole !== 'user' && (
              <li>
                <button
                  className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:outline-none"
                  onClick={() => setSettingsOpen(!settingsOpen)}
                >
                  <span className="mr-3"><Settings size={20} /></span>
                  <span className="flex-1 text-left font-medium">Settings</span>
                  {settingsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {settingsOpen && (
                  <ul className="ml-10">
                    {settingsItems.map((subItem, subIndex) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <li key={subIndex}>
                          <Link
                            href={subItem.href}
                            className={`flex items-center px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded
                              ${isSubActive ? "bg-blue-100 text-blue-700" : ""}`}
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="mr-2">{subItem.icon}</span>
                            <span>{subItem.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            )}
          </ul>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 w-full border-t p-4">
          <button
            className="flex items-center w-full text-gray-700 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
