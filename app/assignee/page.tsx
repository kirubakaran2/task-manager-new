"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { formatDistanceToNow } from "date-fns";
import toast, { Toaster } from "react-hot-toast";

interface User {
  id: string;
  email: string;
  addedTime: string;
  role: string;
  department: string;
  location?: string;
}
interface ApiErrorResponse {
  message: string;
}

interface Item {
  id: string;
  name: string;
  type: "department" | "location";
}

interface ApiResponse {
  _id: string;
  name: string;
}

interface UserApiResponse {
  _id: string;
  email: string;
  role: string;
  department: string;
  location?: string;
  createdAt: string;
}
function isApiErrorResponse(data: any): data is ApiErrorResponse {
  return typeof data === 'object' && data !== null && 'message' in data;
}
export default function UserManagement() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Item[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
const [currentUserId, setCurrentUserId] = useState<string>("");
const [currentUserEmail, setCurrentUserEmail] = useState("");


useEffect(() => {
  const userCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("user_data="));
  if (userCookie) {
    const user = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
    setCurrentUserRole(user?.role || "");
    setCurrentUserId(user?._id || ""); // assuming `_id` is available in cookie
  }
}, []);
useEffect(() => {
  const userCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('user_data='));
  if (userCookie) {
    const user = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
    setCurrentUserRole(user?.role || "");
    setCurrentUserEmail(user?.email || "");
  }
}, []);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [deptRes, locRes] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/locations"),
        ]);
        const [deptData, locData] = await Promise.all([
          deptRes.json() as Promise<ApiResponse[]>,
          locRes.json() as Promise<ApiResponse[]>,
        ]);

        setDepartments(
          deptData.map((item) => ({
            id: item._id,
            name: item.name,
            type: "department",
          }))
        );
        setLocations(
          locData.map((item) => ({
            id: item._id,
            name: item.name,
            type: "location",
          }))
        );
      } catch {
        toast.error("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch recent users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

useEffect(() => {
  const userCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('user_data='));
  if (userCookie) {
    const user = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
    setCurrentUserRole(user?.role || "");
  }
}, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users");
      // Check if the response is OK before trying to parse as JSON
      if (res.ok) {
        const data = await res.json() as UserApiResponse[]; // Expect an array of users
        const formattedUsers = data.map((user) => ({
          id: user._id,
          email: user.email,
          role: user.role,
          department: user.department,
          location: user.location,
          addedTime: formatDistanceToNow(new Date(user.createdAt), {
            addSuffix: true,
          }),
        }));
        setRecentUsers(formattedUsers);
      } else {
        // If the response is not OK, it might be an error object with a message
        const errorData = await res.json();
        toast.error("Failed to fetch users: " + (errorData.message || "Unknown error"));
      }
    } catch (error) {
      // Catch network errors or issues with JSON parsing
      console.error("Error fetching recent users:", error);
      toast.error("Error fetching recent users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast.error("Email and password are required");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, department, location: selectedLocation }),
      });

      const data = await res.json() as UserApiResponse;
      if (res.ok) {
        const newUser: User = {
          id: data._id,
          email: data.email,
          role: data.role,
          department: data.department,
          location: data.location,
          addedTime: "Just now",
        };

        setRecentUsers([newUser, ...recentUsers]);
        toast.success("User added successfully!");
        // Clear form
        setEmail("");
        setPassword("");
        setRole("user");
        setDepartment("");
        setSelectedLocation("");
      } else {
        toast.error("Something went wrong");
      }
    } catch {
      toast.error("Error adding user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editingUser.email,
          role: editingUser.role,
          department: editingUser.department,
          location: editingUser.location,
        }),
      });

      const data = await res.json() as UserApiResponse;
      if (res.ok) {
        setRecentUsers(
          recentUsers.map((user) =>
            user.id === editingUser.id
              ? { ...editingUser, addedTime: "Just updated" }
              : user
          )
        );
        toast.success("User updated successfully!");
        setShowEditModal(false);
      } else {
        toast.error("Something went wrong"); 
      }
    } catch {
      toast.error("Error updating user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRecentUsers(recentUsers.filter((user) => user.id !== userId));
        toast.success("User deleted successfully!");
      } else {
        const data = await res.json() as { message: string };
        toast.error(data.message || "Failed to delete user");
      }
    } catch {
      toast.error("Error deleting user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 md:ml-64">
      <Toaster position="top-right" />
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Add User Form */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold mb-6 text-gray-800">
                Add New User
              </h1>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
  value={role}
  onChange={(e) => setRole(e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
>
  <option value="">Select Role</option>
  <option value="user">User</option>
  {/* Only show admin/superadmin if NOT an 'admin' user */}
  {currentUserRole !== "admin" && (
    <>
      <option value="admin">Admin</option>
      <option value="superadmin">Superadmin</option>
    </>
  )}
</select>

                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value="">Select Location</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.name}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Adding User..." : "Add User"}
                </button>
              </form>
            </div>
          </div>

          {/* Recently Added Users */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Recent Users
                </h2>
                <span className="text-sm text-gray-500">
                  {recentUsers.length} users
                </span>
              </div>

              {isLoading && !recentUsers.length ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : recentUsers.length > 0 ? (
                <div className="space-y-3">
{recentUsers.map((user) => {
  const isCurrentUser = user.id === currentUserId;

  return (
    <div
      key={user.id}
      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-gray-800">{user.email}</p>
          <p className="text-xs text-gray-500">{user.addedTime}</p>
        </div>
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
          {user.role}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
          {user.department}
        </span>
        {user.location && (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            {user.location}
          </span>
        )}
      </div>

      {/* Conditionally render buttons */}
      <div className="mt-3 flex justify-end space-x-2">
  {user.email !== currentUserEmail && (
    <>
      <button
        onClick={() => handleEditUser(user)}
        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
      >
        Edit
      </button>
      <button
        onClick={() => handleDeleteUser(user.id)}
        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
      >
        Delete
      </button>
    </>
  )}
</div>

    </div>
  );
})}

                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No users found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm text-black">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
  value={editingUser.role}
  onChange={(e) =>
    setEditingUser({ ...editingUser, role: e.target.value })
  }
  className="w-full px-3 py-2 border border-gray-300 rounded-md"
>
  <option value="">Select Role</option>
  <option value="user">User</option>
  {currentUserRole === "superadmin" && (
    <>
      <option value="admin">Admin</option>
      <option value="superadmin">Superadmin</option>
    </>
  )}
</select>

                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    value={editingUser.location || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        location: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={editingUser.department || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      department: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
