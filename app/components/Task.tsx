// Updated Task.tsx component with user comment tracking
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { parseCookies } from "nookies";
import toast, { Toaster } from "react-hot-toast";
import { Users } from "lucide-react";

interface TaskProps {
  taskId: string | null;
  setTaskId: React.Dispatch<React.SetStateAction<string | null>>;
}
type UserData = {
  _id: string;
  email: string;
  role: string;
  name?: string;
  department?: string;
};
interface UserApiResponse {
  _id: string;
  email: string;
  role: string;
  department: string;
  location?: string;
  createdAt: string;
}
const Task: React.FC<TaskProps> = ({ taskId, setTaskId }) => {
  interface UserData {
    id: string;
    email: string;
    role: string;
    department: string;
    location: string;
  }

  interface Comment {
    message: string;
    createdAt?: Date;
    user?: UserData;
  }

  interface FormData {
    sno: string;
    sender: string;
    subject: string;
    location: string;
    receiver: string;
    site: string;
    periodFrom: string;
    periodTo: string;
    receiptDate: string;
    dueDate: string;
    overDueDate: string;
    priority: string;
    description: string;
    demands: string;
    overallStatus: string;
    assignedDept: string;
    assignee: string;
    remarks: string;
    comments: Comment[];
    newComment?: string;
    opinionAndComments?: string;
    createdBy?: UserData;
  }

  const [formData, setFormData] = useState<FormData>({
    sno: "",
    sender: "",
    subject: "",
    location: "",
    receiver: "",
    site: "",
    periodFrom: "",
    periodTo: "",
    receiptDate: "",
    dueDate: "",
    overDueDate: "",
    priority: "",
    description: "",
    demands: "",
    overallStatus: "",
    assignedDept: "",
    assignee: "",
    remarks: "",
    comments: [] as Comment[],
    newComment: "",
    opinionAndComments: "",
  });
  const [recentUsers, setRecentUsers] = useState<UserApiResponse[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  useEffect(() => {
    const cookies = parseCookies();
    const rawUserData = cookies.user_data;

    if (rawUserData) {
      try {
        const user: UserData = JSON.parse(rawUserData);
        setCurrentUser(user);
      } catch (err) {
        console.error("Failed to parse user_data cookie:", err);
      }
    }
  }, []);
  useEffect(() => {
    if (currentUser?.role === "admin" || currentUser?.role === "superadmin") {
      fetchUsers();
    } else if (currentUser?.role === "user") {
      setFormData((prev) => ({
        ...prev,
        assignee: currentUser.email || "",
      }));
    }
  }, [currentUser]);
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = (await res.json()) as UserApiResponse[];

      if (res.ok) {
        setRecentUsers(data);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch {
      toast.error("Error fetching recent users");
    }
  };

  // Load user data from cookies
  useEffect(() => {
    const userDataCookie = Cookies.get("user_data");
    if (userDataCookie) {
      try {
        const parsedUserData = JSON.parse(userDataCookie);
        setUserData(parsedUserData);
      } catch (e) {
        console.error("Failed to parse user data from cookie:", e);
      }
    }
  }, []);

  // Auto-generate Serial No.
  useEffect(() => {
    const fetchSno = async () => {
      if (!userData?.id) return; // Wait for user to load
      try {
        const res = await axios.get(`/api/tasks?userId=${userData.id}`);
        const count = res.data.length;
        setFormData((prev) => ({ ...prev, sno: `TSK-${count + 1}` }));
      } catch (err) {
        console.error("Error fetching user tasks:", err);
      }
    };

    fetchSno();
  }, [userData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCommentAdd = () => {
    if (!formData.newComment?.trim()) return;

    const newComment: Comment = {
      message: formData.newComment,
      createdAt: new Date(),
      user: userData || undefined,
    };

    setFormData((prev) => ({
      ...prev,
      comments: [...prev.comments, newComment],
      newComment: "",
    }));
  };

  interface TaskSubmitData extends FormData {
    createdBy?: UserData;
  }

  const handleSubmit = async (data: FormData): Promise<void> => {
    try {
      const submitData: TaskSubmitData = { ...data };

      // If there are additional comments (e.g., from opinionAndComments field)
      if (submitData.opinionAndComments) {
        submitData.comments.push({
          message: submitData.opinionAndComments,
          createdAt: new Date(),
          user: userData || undefined,
        });
      }

      // Clean up unnecessary fields
      delete submitData.newComment;
      delete submitData.opinionAndComments;

      // Attach user data if available
      if (userData) {
        submitData.createdBy = userData;
      }

      let res: Response;
      if (taskId) {
        // If taskId exists, update the existing task (PUT request)
        res = await fetch(`/api/tasks/${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        });
        if (res.ok) {
          alert("Task updated successfully ✅");
        } else {
          throw new Error("Failed to update task");
        }
      } else {
        // If no taskId, create a new task (POST request)
        res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        });
        const result = await res.json();
        setTaskId(result._id); // Save the newly created task ID (or sno if you prefer)
        alert("Task created successfully ✅");
      }

      const result = await res.json();
      console.log(result);
    } catch (err) {
      console.error("Task save failed:", err);
      alert("Failed to save task ❌");
    }
  };

  // Render comments with user information
  const renderComments = () => {
    if (!formData.comments.length) return null;

    return (
      <div className="mt-6 border rounded-md p-4">
        <h3 className="font-medium mb-3">Comments</h3>
        {formData.comments.map((comment, index) => (
          <div key={index} className="border-b pb-2 mb-2 last:border-none">
            <div className="flex justify-between">
              <p className="font-medium">
                {comment.user
                  ? `${comment.user.email} (${comment.user.role})`
                  : "Anonymous"}
              </p>
              <span className="text-sm text-gray-500">
                {comment.createdAt
                  ? new Date(comment.createdAt).toLocaleString()
                  : ""}
              </span>
            </div>
            <p className="mt-1">{comment.message}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6">
      {/* Grid 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["sno", "sender", "subject"].map((field, i) => (
          <div key={i}>
            <label className="block text-sm font-medium text-black mb-1 capitalize">
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              type="text"
              name={field}
              value={(formData as any)[field]}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-black"
              readOnly={field === "sno"}
            />
          </div>
        ))}
      </div>

      {/* Grid 2: Selects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {["location", "receiver", "site"].map((field, i) => (
          <div key={i}>
            <label className="block text-sm font-medium text-black mb-1 capitalize">
              {field}
            </label>
            <select
              name={field}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-white text-black"
            >
              <option>Select</option>
            </select>
          </div>
        ))}
      </div>

      {/* Grid 3: Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {["periodFrom", "periodTo", "receiptDate"].map((field, i) => (
          <div key={i}>
            <label className="block text-sm font-medium text-black mb-1 capitalize">
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              type="date"
              name={field}
              value={(formData as any)[field]}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-black"
            />
          </div>
        ))}
      </div>

      {/* Grid 4: Dates + Priority */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {["dueDate", "overDueDate"].map((field, i) => (
          <div key={i}>
            <label className="block text-sm font-medium text-black mb-1 capitalize">
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              type="date"
              name={field}
              value={(formData as any)[field]}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-black"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Priority
          </label>
          <select
            name="priority"
            onChange={handleChange}
            className="w-full p-2 border rounded-md text-black"
          >
            <option disabled selected>
              Select
            </option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      {/* Grid 5: Description & Demands */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {["description", "demands"].map((field, i) => (
          <div key={i}>
            <label className="block text-sm font-medium text-black mb-1 capitalize">
              {field}
            </label>
            <textarea
              name={field}
              rows={4}
              value={(formData as any)[field]}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-black"
            />
          </div>
        ))}
      </div>

      {/* Grid 6: Status, Dept, Assignee */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {["overallStatus", "assignedDept", "assignee"].map((field, i) => (
          <div key={i}>
            <label className="block text-sm font-medium text-black mb-1 capitalize">
              {field.replace(/([A-Z])/g, " $1")}
            </label>

            {field === "assignee" ? (
              // Render dropdown or read-only input based on user role
              currentUser?.role === "admin" ||
              currentUser?.role === "superadmin" ? (
                <select
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md text-black"
                >
                  <option value="">Select assignee</option>
                  {recentUsers.map((user) => (
                    <option key={user._id} value={user.email}>
                      {user.email}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="assignee"
                  value={formData.assignee}
                  readOnly
                  className="w-full p-2 border rounded-md text-black bg-gray-100"
                />
              )
            ) : (
              <input
                type="text"
                name={field}
                value={(formData as any)[field]}
                onChange={handleChange}
                className="w-full p-2 border rounded-md text-black"
              />
            )}
          </div>
        ))}
      </div>

      {/* Grid 7: Remarks & Opinion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {["remarks", "opinionAndComments"].map((field, i) => (
          <div key={i}>
            <label className="block text-sm font-medium text-black mb-1 capitalize">
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <textarea
              name={field}
              rows={3}
              value={(formData as any)[field]}
              onChange={handleChange}
              className="w-full p-2 border rounded-md text-black"
            />
          </div>
        ))}
      </div>

      {/* Display existing comments */}
      {renderComments()}

      {/* Comment & Save */}
      <div className="flex flex-col md:flex-row justify-between mt-6 gap-4">
        <div className="relative flex w-full md:w-336">
          <input
            type="text"
            placeholder="Add Comment"
            name="newComment"
            value={formData.newComment}
            onChange={handleChange}
            className="w-full p-2 border rounded-l-md text-black"
          />
          <button
            onClick={handleCommentAdd}
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md whitespace-nowrap"
          >
            Comment
          </button>
        </div>
        <button
          onClick={() => handleSubmit(formData)}
          type="button"
          className="bg-blue-600 text-white px-6 py-2 rounded-md"
        >
          Save
        </button>
      </div>

      {/* Display current user info if available */}
      {userData && (
        <div className="mt-6 text-sm text-gray-500">
          Commenting as: {userData.email} ({userData.role})
        </div>
      )}
    </div>
  );
};

export default Task;
