"use client";

import {useEffect, MouseEvent, useState } from 'react';
import Head from "next/head";
import { Bell } from "lucide-react";
import { parseCookies } from "nookies";
import { useRouter, useParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";

import { requireAuth } from "../../utils/auth";
import Navbar from "../../components/Navbar";
import { createServerSearchParamsForServerPage } from "next/dist/server/request/search-params";

export default function MasterDatabase() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id;
  const [taskData, setTaskData] = useState<any>({ sno: "" });
  const [recentUsers, setRecentUsers] = useState<UserApiResponse[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("Task");
  const [fileId, setFileId] = useState<string | null>(null);

  const [claims, setClaims] = useState<
    Array<{
      claimDetails: string;
      claimSentDate: string;
      claimReplyReceivedDate: string;
      claimStatus: string;
    }>
  >([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [files, setFiles] = useState<any[]>([]);

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

  interface Comment {
    _id?: string;
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
    assignee: { email: string }[];
    remarks: string;
    newComment?: string;
    opinionAndComments?: string;
    createdBy?: UserData;
    expertOpinion: string;
    expertOpinionDate: string;
    internalComments: string;
    internalCommentsDate: string;
    ceoComments: string;
    ceoCommentsDate: string;
    finalDecision: string;
    officialReplyDate: string;
    comments: Comment[];
    discussionDetails?: string;
    finalDecisionDate?: string;
    pvReport?: string;
    officialAmount?: string;
    penaltiesAmount?: string;
    totalAmount?: string;
    ceoApprovalStatus?: string;
    ceoApprovalDate?: string;
    invoiceDetails?: string;
    finalSettlement?: string;
    ndpNo?: string;
    ndpReceivedDate?: string;
    ndpAmount?: string;
    ndpPaymentDueDate?: string;
    ndpPaymentDate?: string;
    ndpPaymentStatus?: string;
    dnNo?: string;
    dnReceivedAmount?: string;
    dnAmount?: string;
    dnPaymentDueDate?: string;
    dnPaymentDate?: string;
    dnPaymentStatus?: string;
    amrANo?: string;
    amrAReceivedDate?: string;
    amrAAmount?: string;
    amrAPaymentDueDate?: string;
    amrAPaymentDate?: string;
    amrAPaymentStatus?: string;
    amrBNo?: string;
    amrBReceivedDate?: string;
    amrBAmount?: string;
    amrBPaymentDueDate?: string;
    amrBPaymentDate?: string;
    amrBPaymentStatus?: string;
    claimsNotes?: string;
    litigationCaseDetails?: string;
    litigationCaseStartDate?: string;
    litigationCaseAmount?: string;
    litigationCaseAmountPaymentDate?: string;
    litigationMotivationAmount?: string;
    litigationCaseClosedDate?: string;
    litigationCaseStatus?: string;
    refundRequestDate?: string;
    refundApprovalReceivedDate?: string;
    refundApprovalAmount?: string;
    lastReminderDate?: string;
    lawyersOpinion?: string;
    courtCaseDetails?: string;
    finalJudgementDetails?: string;
    judgementDate?: string;
    lawyersFee?: string;
    courtLegalExpenses?: string;
    motivationAmount?: string;
    totalLegalFees?: string;
    courtCaseStatus?: string;
    files?: Array<{
      fileName: string;
      url: string;
      publicId: string;
      uploadedBy: string;
      uploadedAt: Date;
    }>;
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
    assignee: [],
    remarks: "",
    comments: [],
    newComment: "",
    opinionAndComments: "",
    expertOpinion: "",
    expertOpinionDate: "",
    internalComments: "",
    internalCommentsDate: "",
    ceoComments: "",
    ceoCommentsDate: "",
    finalDecision: "",
    officialReplyDate: "",
    discussionDetails: "",
    finalDecisionDate: "",
    pvReport: "",
    officialAmount: "",
    penaltiesAmount: "",
    motivationAmount: "",
    totalAmount: "",
    ceoApprovalStatus: "",
    ceoApprovalDate: "",
    invoiceDetails: "",
    finalSettlement: "",
    ndpNo: "",
    ndpReceivedDate: "",
    ndpAmount: "",
    ndpPaymentDueDate: "",
    ndpPaymentDate: "",
    ndpPaymentStatus: "",
    dnNo: "",
    dnReceivedAmount: "",
    dnAmount: "",
    dnPaymentDueDate: "",
    dnPaymentDate: "",
    dnPaymentStatus: "",
    amrANo: "",
    amrAReceivedDate: "",
    amrAAmount: "",
    amrAPaymentDueDate: "",
    amrAPaymentDate: "",
    amrAPaymentStatus: "",
    amrBNo: "",
    amrBReceivedDate: "",
    amrBAmount: "",
    amrBPaymentDueDate: "",
    amrBPaymentDate: "",
    amrBPaymentStatus: "",
    claimsNotes: "",
    litigationCaseDetails: "",
    litigationCaseStartDate: "",
    litigationCaseAmount: "",
    litigationCaseAmountPaymentDate: "",
    litigationMotivationAmount: "",
    litigationCaseClosedDate: "",
    litigationCaseStatus: "",
    refundRequestDate: "",
    refundApprovalReceivedDate: "",
    refundApprovalAmount: "",
    lastReminderDate: "",
    lawyersOpinion: "",
    courtCaseDetails: "",
    finalJudgementDetails: "",
    judgementDate: "",
    lawyersFee: "",
    courtLegalExpenses: "",
    totalLegalFees: "",
    courtCaseStatus: "",
  });

  // Add searchTerm state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  // Protect route
  useEffect(() => {
    requireAuth();
  }, []);

  interface OptionItem {
    id?: string;
    value?: string;
    name?: string;
    label?: string;
  }

  const [options, setOptions] = useState<{
    location: OptionItem[];
    receiver: OptionItem[];
    site: OptionItem[];
  }>({
    location: [],
    receiver: [],
    site: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const endpoints = {
        location: "/api/locations",
        receiver: "/api/receivers",
        site: "/api/sites",
      } as const;

      for (const key in endpoints) {
        try {
          const res = await fetch(endpoints[key as keyof typeof endpoints]);
          const data = await res.json();
          // Map to { id, name }
          const mapped = Array.isArray(data)
            ? data.map((item: any) => ({ id: item._id, name: item.name }))
            : [];
          setOptions((prev) => ({ ...prev, [key]: mapped }));
        } catch (err) {
          console.error(`Error fetching ${key}:`, err);
        }
      }
    };

    fetchData();
  }, []);

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
        assignee: currentUser.email ? [{ email: currentUser.email }] : [],
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

  // Fetch task data using taskId
  useEffect(() => {
    if (taskId) {
      const fetchTaskData = async () => {
        try {
          const res = await fetch(`/api/tasks/${taskId}`);
          const data = await res.json();
          console.log(data);

          if (res.ok) {
            setFormData(data);
            setFiles(data.files || []);
          } else {
            toast.error("Failed to fetch task data");
          }
        } catch (err) {
          console.error("Error fetching task data:", err);
          toast.error("Error fetching task data");
        }
      };

      fetchTaskData();
    }
  }, [taskId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCommentAdd = async () => {
    if (!formData.newComment?.trim()) return;

    try {
      // Send only the message to the backend
      const res = await fetch(`/api/tasks/${taskId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: formData.newComment }),
      });
      if (!res.ok) throw new Error('Failed to add comment');
      toast.success('Comment added successfully!');
      // Update comments from the returned task
      const updatedTask = await res.json();
      setFormData(prev => ({ ...prev, comments: updatedTask.comments, newComment: '' }));
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleClaimChange = (index: number, field: string, value: string) => {
    const updatedClaims = [...claims];
    updatedClaims[index] = {
      ...updatedClaims[index],
      [field]: value,
    };
    setClaims(updatedClaims);
  };

  interface TaskSubmitData extends FormData {
    createdBy?: UserData;
    files?: Array<{
    fileName: string;
    url: string;
    publicId: string;
    uploadedBy: string;
    uploadedAt: Date;
  }>;
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    if (e) {
      e.preventDefault();
    }

    try {
      const submitData: TaskSubmitData = { ...formData };

      // Log the form data before submission
      console.log("Form Data before submission:", submitData);

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
      // Combine files: from form body and newly uploaded ones
const combinedFiles = [
  ...(formData.files || []),
  ...(uploadedFiles || []),
];



const uniqueFiles = Array.from(
  new Map(combinedFiles.map((f) => [f.publicId || f.googleFileId, f])).values()
)
  .map((file) => {
    const uploadedBy = file.uploadedBy || userData?._id;
    if (!uploadedBy) return null;
    return {
      fileName: file.fileName,
      publicId: file.publicId || file.googleFileId,
      url: file.url || file.googleDriveLink,
      uploadedBy,
      uploadedAt: file.uploadedAt ? new Date(file.uploadedAt) : new Date(),
    };
  });

// Filter out any nulls to satisfy the type
submitData.files = uniqueFiles.filter((f): f is NonNullable<typeof f> => f !== null);
      let res: Response;
      let result;

      // If taskId exists, update the existing task (PUT request)
      res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        toast.success("Task updated successfully ✅");
      } else {
        throw new Error("Failed to update task");
      }

      // Parse the response body only once
      if (!result) {
        result = await res.json();
      }

      console.log("Response from server:", result);
    } catch (err) {
      console.error("Task save failed:", err);
      toast.error("Failed to save task ❌");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

const handleUpload = async (e: MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();

  if (!file || !taskId) {
    setStatus("Missing file or taskId.");
    return;
  }

  setLoading(true);
  const formData = new FormData();
  formData.append("files", file);
  formData.append("taskId", Array.isArray(taskId) ? taskId[0] : taskId);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    console.log("Response JSON:", data);

    if (res.ok && data.success) {
      setStatus("Upload successful!");
      setUploadedFiles((prev) => [
        ...prev,
        ...(Array.isArray(data.files) ? data.files : [])
      ]); // Store the uploaded file metadata
    } else {
      setStatus("Upload failed.");
    }
  } catch (err) {
    console.error('Upload error:', err);
    setStatus("Upload failed due to network or server error.");
  } finally {
    setLoading(false);
  }
};


  // Render comments with user information
  const renderComments = () => {
    if (!formData.comments?.length) return null;

    return formData.comments.map((comment, idx) => {
      // Parse or fallback
      const commentDate = comment.createdAt
        ? new Date(comment.createdAt)
        : new Date();
      const formattedDate = commentDate.toLocaleDateString();

      // Pull user name or email (or Anonymous)
      const author =
        typeof comment.user === "object"
          ? comment.user.name || comment.user.email
          : comment.user;
      return (
        <div
          key={comment._id || idx}
          className="mt-2 p-2 bg-gray-50 rounded text-black"
        >
          <div className="text-sm text-gray-600">
            {author || "Anonymous"} — {formattedDate}
          </div>
          <div className="mt-1">{comment.message}</div>
        </div>
      );
    });
  };

  const handleAddClaim = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    // Add a new empty claim to the claims array
    const newClaim = {
      claimDetails: "",
      claimSentDate: "",
      claimReplyReceivedDate: "",
      claimStatus: "Pending",
    };
    setClaims([...claims, newClaim]);
    toast.success("New claim added!");
  };

  // 1. For file list, store formatted dates in state
  const [formattedFiles, setFormattedFiles] = useState<any[]>([]);
  useEffect(() => {
    if (files && files.length > 0) {
      setFormattedFiles(
        files.map(f => ({
          ...f,
          formattedDate: typeof window !== 'undefined' ? new Date(f.uploadedAt).toLocaleDateString() : '',
          formattedTime: typeof window !== 'undefined' ? new Date(f.uploadedAt).toLocaleTimeString() : '',
        }))
      );
    } else {
      setFormattedFiles([]);
    }
  }, [files]);

  // 2. For comments, store formatted dates in state
  const [formattedComments, setFormattedComments] = useState<any[]>([]);
  useEffect(() => {
    if (formData.comments && formData.comments.length > 0) {
      setFormattedComments(
        formData.comments.map(comment => ({
          ...comment,
          formattedDate: typeof window !== 'undefined' && comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : '',
        }))
      );
    } else {
      setFormattedComments([]);
    }
  }, [formData.comments]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Toaster /> {/* Add Toaster component here */}
      {/* Sidebar */}
      <div className="w-52 fixed h-full hidden md:block">
        <Navbar />
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64 ml-0 p-2 md:p-4">
        <Head>
          <title>Task</title>
        </Head>

        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Task</h1>
          <button className="text-gray-500 hover:text-gray-600">
            <Bell className="h-6 w-6" />
          </button>
        </header>

        {/* Search and Actions */}
        <div className="bg-white p-4 flex gap-3 shadow-sm">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by subject"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            />
            <svg
              className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            onClick={() => setSearchActive(true)}
          >
            Search
          </button>
        </div>

        {/* Main Tabs Content */}
        <main className="flex-1 w-full block overflow-y-auto p-2 md:p-4 bg-gray-100">
          <div className="bg-white rounded-md w-full max-w-3xl mx-auto shadow-md border border-gray-300 p-2 md:p-6">
            {/* Fallback if no data */}
            {(!options.location.length && !options.receiver.length && !options.site.length) ? (
              <div className="text-center text-gray-500 py-10">No data available. Please add locations, receivers, or sites in the backend.</div>
            ) : (
              <div className="flex flex-col md:flex-row w-full">
                {/* Tabs Sidebar */}
                <div className="flex flex-row md:flex-col w-full md:w-12 text-center border-r border-blue-100 justify-center md:justify-start items-center md:items-stretch gap-2 md:gap-0 py-2 md:py-0">
                  { ["Task", "outcome", "invoices", "claims", "case"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 md:h-24 h-12 flex items-center justify-center transition-colors duration-200 rounded-md md:rounded-none ${activeTab === tab
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 hover:bg-blue-100 text-gray-700"
                      } md:[writing-mode:vertical-lr] md:[transform:rotate(180deg)]`}
                    >
                      <span className="font-medium text-base md:text-sm">
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </span>
                    </button>
                  )) }
                </div>
                {/* Tab Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex justify-between items-center p-4 border-b bg-white">
                    <h2 className="text-lg font-medium text-gray-800">
                      {
                        {
                          Task: "TASK",
                          outcome: "FINAL DECISION & SETTLEMENT",
                          invoices: "INVOICE & PAYMENTS DETAILS",
                          claims: "CLAIMS, LITIGATION & COURT CASES",
                          case: "COURT CASE",
                        }[activeTab]
                      }
                    </h2>
                  </div>
                  <div className="overflow-y-auto p-4">
                    {activeTab === "Task" && (
                      <div className="p-2 md:p-6 max-w-3xl mx-auto w-full bg-white border border-gray-300 rounded-lg shadow-sm overflow-x-hidden">
                        {searchActive && searchTerm && formData.subject && !formData.subject.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                          <div className="text-center text-gray-500 py-10">No task found with subject matching "{searchTerm}".</div>
                        ) : (
                          <>
                            {/* Grid 1 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 gap-y-6">
                              {["sender", "subject"].map((field, i) => (
                                <div key={i} className="min-w-0 w-full">
                                  <label className="block text-base font-semibold text-black mb-2 capitalize">
                                    {field.replace(/([A-Z])/g, " $1")}
                                  </label>
                                  <input
                                    type="text"
                                    name={field}
                                    value={(formData as any)[field]}
                                    onChange={handleChange}
                                    className="w-full min-w-0 p-3 border rounded-lg text-black text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              ))}
                            </div>
                            {/* Grid 6: Status, Dept, Assignee */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 gap-y-6 mt-4">
                              {["overallStatus", "assignedDept", "assignee"].map(
                                (field, i) => (
                                  <div key={i} className="min-w-0 w-full">
                                    <label className="block text-base font-semibold text-black mb-2 capitalize">
                                      {field.replace(/([A-Z])/g, " $1")}
                                    </label>

                                    {field === "assignee" ? (
                                      // Render dropdown or read-only input based on user role
                                      currentUser?.role === "admin" ||
                                        currentUser?.role === "superadmin" ? (
                                        <select
                                          name="assignee"
                                          value={formData.assignee[0]?.email || ""}
                                          onChange={handleChange}
                                          className="w-full min-w-0 p-3 border rounded-lg text-black text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                          <option value="">Select assignee</option>
                                          {recentUsers.map((user) => (
                                            <option key={user._id} value={user.email}>
                                              {user.email}
                                            </option>
                                          ))}
                                        </select>
                                      ) : (
                                        // Display the emails of the assignees properly
                                        <input
                                          type="text"
                                          name="assignee"
                                          value={
                                            Array.isArray(formData.assignee)
                                              ? formData.assignee
                                                .map((assignee) => assignee.email)
                                                .join(", ")
                                              : ""
                                          }
                                          readOnly
                                          className="w-full min-w-0 p-3 border rounded-lg text-black bg-gray-100 text-base"
                                        />
                                      )
                                    ) : (
                                      <input
                                        type="text"
                                        name={field}
                                        value={(formData as any)[field]}
                                        onChange={handleChange}
                                        className="w-full min-w-0 p-3 border rounded-lg text-black text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      />
                                    )}
                                  </div>
                                )
                              )}
                            </div>

                            {/* Grid 2: Selects */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 gap-y-6 mt-4">
                              {["location", "receiver", "site"].map((field, i) => (
                                <div key={i} className="min-w-0 w-full">
                                  <label className="block text-base font-semibold text-black mb-2 capitalize">
                                    {field}
                                  </label>
                                  <select
                                    name={field}
                                    onChange={handleChange}
                                    className="w-full min-w-0 p-3 border rounded-lg bg-white text-black text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={(formData as any)[field] || ""}
                                  >
                                    <option value="">Select {field}</option>
                                    {(options as any)[field].map((item: { id: string; name: string }) => (
                                      <option key={item.id} value={item.name}>
                                        {item.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>

                            {/* Grid 3: Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 gap-y-6 mt-4">
                              {["periodFrom", "periodTo", "receiptDate"].map(
                                (field, i) => (
                                  <div key={i} className="min-w-0 w-full">
                                    <label className="block text-base font-semibold text-black mb-2 capitalize">
                                      {field.replace(/([A-Z])/g, " $1")}
                                    </label>
                                    <input
                                      type="date"
                                      name={field}
                                      value={(formData as any)[field]}
                                      onChange={handleChange}
                                      className="w-full min-w-0 p-3 border rounded-lg text-black text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                  </div>
                                )
                              )}
                            </div>

                            {/* Grid 4: Dates + Priority */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 gap-y-6 mt-4">
                              {["dueDate", "overDueDate"].map((field, i) => (
                                <div key={i} className="min-w-0 w-full">
                                  <label className="block text-base font-semibold text-black mb-2 capitalize">
                                    {field.replace(/([A-Z])/g, " $1")}
                                  </label>
                                  <input
                                    type="date"
                                    name={field}
                                    value={(formData as any)[field]}
                                    onChange={handleChange}
                                    className="w-full min-w-0 p-3 border rounded-lg text-black text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              ))}
                              <div className="min-w-0 w-full">
                                <label className="block text-base font-semibold text-black mb-2">
                                  Priority
                                </label>
                                <select
                                  name="priority"
                                  value={formData.priority ?? ""}
                                  onChange={handleChange}
                                  className="w-full min-w-0 p-3 border rounded-lg text-black text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="" disabled>
                                    Select
                                  </option>
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                                </select>
                              </div>
                            </div>

                            {/* Grid 5: Description & Demands */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 gap-y-6 mt-4">
                              {["description", "demands"].map((field, i) => (
                                <div key={i} className="min-w-0 w-full">
                                  <label className="block text-base font-semibold text-black mb-2 capitalize">
                                    {field}
                                  </label>
                                  <textarea
                                    name={field}
                                    rows={4}
                                    value={(formData as any)[field]}
                                    onChange={handleChange}
                                    className="w-full min-w-0 p-3 border rounded-lg text-black text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Grid 7: Remarks & Opinion */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 gap-y-6 mt-4">
                              {["remarks", "opinionAndComments"].map((field, i) => (
                                <div key={i} className="min-w-0 w-full">
                                  <label className="block text-base font-semibold text-black mb-2 capitalize">
                                    {field.replace(/([A-Z])/g, " $1")}
                                  </label>
                                  <textarea
                                    name={field}
                                    rows={3}
                                    value={(formData as any)[field]}
                                    onChange={handleChange}
                                    className="w-full min-w-0 p-3 border rounded-lg text-black text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              ))}
                            </div>

                            {/* File Upload Section */}
                            <div className="mb-6 text-black">
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <input
                                  type="file"
                                  onChange={handleFileChange}
                                  className="border rounded px-3 py-2 text-sm w-full sm:w-auto"
                                />
                                <button
                                  disabled={!file}
                                  onClick={handleUpload}
                                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700 transition flex items-center justify-center w-full sm:w-auto"
                                >
                                  Upload
                                </button>
                              </div>

                              {status && (
                                <p className="mt-3 text-green-600 font-medium">{status}</p>
                              )}

                              <h2 className="text-xl mt-6 mb-2 font-semibold">Task Files</h2>
                              <ul className="list-none pl-0 space-y-3">
                                {formattedFiles.map((f) => {
                                  const downloadUrl = `/api/download?id=${f._id}`;
                                  return (
                                    <li key={f._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div className="flex items-center space-x-2">
                                          <span role="img" aria-label="file" className="text-lg">📄</span>
                                          <span className="font-medium text-gray-900 break-all">
                                            <a href={downloadUrl} download={f.fileName} className="text-blue-600 hover:underline">
                                              {f.fileName}
                                            </a>
                                          </span>
                                        </div>
                                        <div className="text-xs text-gray-500 sm:text-sm">
                                          {f.formattedDate} {f.formattedTime && `at ${f.formattedTime}`}
                                        </div>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
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
                                  value={formData.newComment ?? ""}
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
                              <form onSubmit={handleSubmit}>
                                <button
                                  type="submit"
                                  className="bg-blue-600 text-white px-6 py-2 rounded-md"
                                >
                                  Save
                                </button>
                              </form>
                            </div>

                            {/* Display current user info if available */}
                            {userData && (
                              <div className="mt-6 text-sm text-gray-500">
                                Commenting as: {userData.email} ({userData.role})
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    {activeTab === "outcome" && (
                      <div className="p-4 md:p-6 text-black">
                        <>
                          {/* Display the serial number */}
                          <form onSubmit={handleSubmit}>
                            {/* Expert Opinion */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Expert Opinion
                                </label>
                                <textarea
                                  name="expertOpinion"
                                  className="w-full p-2 border rounded-md"
                                  rows={4}
                                  value={formData.expertOpinion}
                                  onChange={handleChange}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Expert Opinion Date
                                </label>
                                <input
                                  name="expertOpinionDate"
                                  type="date"
                                  className="w-full p-2 border rounded-md"
                                  value={formData.expertOpinionDate}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>

                            {/* Internal Comments */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Internal Comments
                                </label>
                                <textarea
                                  name="internalComments"
                                  className="w-full p-2 border rounded-md"
                                  rows={4}
                                  value={formData.internalComments}
                                  onChange={handleChange}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Internal Comments Date
                                </label>
                                <input
                                  name="internalCommentsDate"
                                  type="date"
                                  className="w-full p-2 border rounded-md"
                                  value={formData.internalCommentsDate}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>

                            {/* CEO Comments */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  CEO Comments
                                </label>
                                <textarea
                                  name="ceoComments"
                                  className="w-full p-2 border rounded-md"
                                  rows={4}
                                  value={formData.ceoComments}
                                  onChange={handleChange}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  CEO Comments Date
                                </label>
                                <input
                                  name="ceoCommentsDate"
                                  type="date"
                                  className="w-full p-2 border rounded-md"
                                  value={formData.ceoCommentsDate}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>

                            {/* Final Decision */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Final Decision & Settlement
                                </label>
                                <textarea
                                  name="finalDecision"
                                  className="w-full p-2 border rounded-md"
                                  rows={4}
                                  value={formData.finalDecision}
                                  onChange={handleChange}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Official Reply Date
                                </label>
                                <input
                                  name="officialReplyDate"
                                  type="date"
                                  className="w-full p-2 border rounded-md"
                                  value={formData.officialReplyDate}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>

                            {/* Display existing comments */}
                            {renderComments()}

                            {/* Comment & Save Section */}
                            <div className="flex flex-col md:flex-row justify-between mt-6 gap-4">
                              <div className="relative flex w-full md:w-336">
                                <input
                                  type="text"
                                  placeholder="Add Comment"
                                  name="newComment"
                                  value={formData.newComment ?? ""}
                                  onChange={handleChange}
                                  className="w-full p-2 border rounded-l-md"
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
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-md"
                              >
                                Save
                              </button>
                            </div>
                          </form>

                          {/* Display current user info if available */}
                          {userData && (
                            <div className="mt-6 text-sm text-gray-500">
                              Commenting as: {userData.email} ({userData.role})
                            </div>
                          )}
                        </>
                      </div>
                    )}
                    {activeTab === "invoices" && (
                      <div className="p-4 md:p-6 text-black">
                        <>
                          {/* Display the serial number */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Discussion Details
                              </label>
                              <textarea
                                name="discussionDetails"
                                value={formData.discussionDetails}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Final Decision
                              </label>
                              <textarea
                                name="finalDecision"
                                value={formData.finalDecision}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Final Decision Date
                              </label>
                              <input
                                name="finalDecisionDate"
                                type="date"
                                value={formData.finalDecisionDate}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                PV Report
                              </label>
                              <textarea
                                name="pvReport"
                                value={formData.pvReport}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Official Amount
                              </label>
                              <input
                                name="officialAmount"
                                type="text"
                                value={formData.officialAmount}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Penalties Amount
                              </label>
                              <input
                                name="penaltiesAmount"
                                type="text"
                                value={formData.penaltiesAmount}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Motivation Amount
                              </label>
                              <input
                                name="motivationAmount"
                                type="text"
                                value={formData.motivationAmount}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Total Amount
                              </label>
                              <input
                                name="totalAmount"
                                type="text"
                                value={formData.totalAmount}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                CEO Approval Status
                              </label>
                              <input
                                name="ceoApprovalStatus"
                                type="text"
                                value={formData.ceoApprovalStatus}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                CEO Approval Date
                              </label>
                              <input
                                name="ceoApprovalDate"
                                type="date"
                                value={formData.ceoApprovalDate}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                              />
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">
                              Invoice & Payments Details
                            </label>
                            <textarea
                              name="invoiceDetails"
                              value={formData.invoiceDetails}
                              onChange={handleChange}
                              className="w-full p-2 border rounded-md"
                              rows={4}
                            />
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">
                              Final Decision & Settlement
                            </label>
                            <textarea
                              name="finalSettlement"
                              value={formData.finalSettlement}
                              onChange={handleChange}
                              className="w-full p-2 border rounded-md"
                              rows={4}
                            />
                          </div>

                          {/* Display existing comments */}
                          {renderComments()}

                          {/* Comment & Save Section */}
                          <div className="flex flex-col md:flex-row justify-between mt-6 gap-4">
                            <div className="relative flex w-full md:w-336">
                              <input
                                type="text"
                                placeholder="Add Comment"
                                name="newComment"
                                value={formData.newComment ?? ""}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-l-md"
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
                              onClick={handleSubmit}
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
                        </>
                      </div>
                    )}
                    {activeTab === "claims" && (
                      <div className="p-4 md:p-6 text-black">
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              ["NDP No.", "ndpNo", "text"],
                              ["NDP Received Date", "ndpReceivedDate", "date"],
                              ["NDP Amount", "ndpAmount", "text"],
                              ["NDP Payment Due Date", "ndpPaymentDueDate", "date"],
                              ["NDP Payment Date", "ndpPaymentDate", "date"],
                              ["NDP Payment Status", "ndpPaymentStatus", "text"],
                              ["DN No.", "dnNo", "text"],
                              ["DN Received Amount", "dnReceivedAmount", "text"],
                              ["DN Amount", "dnAmount", "text"],
                              ["DN Payment Due Date", "dnPaymentDueDate", "date"],
                              ["DN Payment Date", "dnPaymentDate", "date"],
                              ["DN Payment Status", "dnPaymentStatus", "text"],
                              ["AMR A No.", "amrANo", "text"],
                              ["AMR A Received Date", "amrAReceivedDate", "date"],
                              ["AMR A Amount", "amrAAmount", "text"],
                              [
                                "AMR A Payment Due Date",
                                "amrAPaymentDueDate",
                                "date",
                              ],
                              ["AMR A Payment Date", "amrAPaymentDate", "date"],
                              ["AMR A Payment Status", "amrAPaymentStatus", "text"],
                              ["AMR B No.", "amrBNo", "text"],
                              ["AMR B Received Date", "amrBReceivedDate", "date"],
                              ["AMR B Amount", "amrBAmount", "text"],
                              [
                                "AMR B Payment Due Date",
                                "amrBPaymentDueDate",
                                "date",
                              ],
                              ["AMR B Payment Date", "amrBPaymentDate", "date"],
                              ["AMR B Payment Status", "amrBPaymentStatus", "text"],
                            ].map(([label, name, type]) => (
                              <div key={name}>
                                <label className="block text-sm font-medium mb-1">
                                  {label}
                                </label>
                                <input
                                  name={name}
                                  type={type}
                                  value={String(
                                    formData[
                                    name as keyof Omit<
                                      typeof formData,
                                      "comments" | "newComment"
                                    >
                                    ] || ""
                                  )}
                                  onChange={handleChange}
                                  className="w-full p-2 border rounded-md"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Claims Section */}
                          <div className="mt-6">
                            <label className="block text-sm font-medium mb-1">
                              Claims, Litigations & Court Cases
                            </label>
                            <textarea
                              name="claimsNotes"
                              value={formData.claimsNotes}
                              onChange={handleChange}
                              className="w-full p-2 border rounded-md"
                              rows={4}
                            ></textarea>
                          </div>

                          {/* Display existing comments */}
                          {renderComments()}

                          {/* Comment & Save Section */}
                          <div className="flex flex-col md:flex-row justify-between mt-6 gap-4">
                            <div className="relative flex w-full md:w-336">
                              <input
                                type="text"
                                placeholder="Add Comment"
                                name="newComment"
                                value={formData.newComment ?? ""}
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
                              onClick={handleSubmit}
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
                        </>
                      </div>
                    )}
                    {activeTab === "case" && (
                      <div className="p-4 md:p-6 text-black">
                        <>
                          {/* Add Claim Button with Plus Icon */}
                          <div className="flex justify-end mb-4">
                            <button
                              className="bg-blue-600 text-white px-6 py-2 rounded-md flex items-center"
                              onClick={handleAddClaim}
                            >
                              <svg
                                className="w-5 h-5 mr-2"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 3a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H3a1 1 0 110-2h6V4a1 1 0 011-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Add Claim
                            </button>
                          </div>

                          {/* Claim Form Table */}
                          <div className="overflow-x-auto mb-6">
                            <table className="min-w-full table-auto bg-blue-50 border border-gray-300">
                              <thead>
                                <tr className="bg-blue-600 text-white">
                                  <th className="px-1 py-2 border border-gray-300">
                                    S.no
                                  </th>
                                  <th className="px-2 py-2 border border-gray-300">
                                    Claim Details
                                  </th>
                                  <th className="px-2 py-2 border border-gray-300">
                                    Claim Sent Date
                                  </th>
                                  <th className="px-3 py-2 border border-gray-300">
                                    Claim Reply Received Date
                                  </th>
                                  <th className="px-2 py-2 border border-gray-300">
                                    Claim Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {claims.map((claim, index) => (
                                  <tr key={index} className="bg-blue-50">
                                    <td className="px-3 py-2 border border-gray-300 text-black">
                                      {index + 1}
                                    </td>
                                    <td className="px-3 py-2 border border-gray-300">
                                      <input
                                        type="text"
                                        className="w-full p-2 border rounded-md text-black"
                                        placeholder="Claim Details"
                                        value={claim.claimDetails}
                                        onChange={(e) =>
                                          handleClaimChange(
                                            index,
                                            "claimDetails",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="px-3 py-2 border border-gray-300">
                                      <input
                                        type="date"
                                        className="w-full p-2 border rounded-md text-black"
                                        value={claim.claimSentDate}
                                        onChange={(e) =>
                                          handleClaimChange(
                                            index,
                                            "claimSentDate",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="px-3 py-2 border border-gray-300">
                                      <input
                                        type="date"
                                        className="w-full p-2 border rounded-md text-black"
                                        value={claim.claimReplyReceivedDate}
                                        onChange={(e) =>
                                          handleClaimChange(
                                            index,
                                            "claimReplyReceivedDate",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="px-3 py-2 border border-gray-300">
                                      <select
                                        className="w-full p-2 border rounded-md text-black"
                                        value={claim.claimStatus}
                                        onChange={(e) =>
                                          handleClaimChange(
                                            index,
                                            "claimStatus",
                                            e.target.value
                                          )
                                        }
                                      >
                                        <option>Pending</option>
                                        <option>Approved</option>
                                        <option>Rejected</option>
                                      </select>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Form Fields in Grid Layout Like Claims.tsx */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              [
                                "Litigation Case Details",
                                "litigationCaseDetails",
                                "text",
                              ],
                              [
                                "Litigation Case Start Date",
                                "litigationCaseStartDate",
                                "date",
                              ],
                              [
                                "Litigation Case Amount",
                                "litigationCaseAmount",
                                "number",
                              ],
                              [
                                "Litigation Case Amount Payment Date",
                                "litigationCaseAmountPaymentDate",
                                "date",
                              ],
                              [
                                "Litigation Motivation Amount",
                                "litigationMotivationAmount",
                                "number",
                              ],
                              [
                                "Litigation Case Closed Date",
                                "litigationCaseClosedDate",
                                "date",
                              ],
                              [
                                "Litigation Case Status",
                                "litigationCaseStatus",
                                "select",
                                ["Open", "Closed"],
                              ],
                              ["Refund Request Date", "refundRequestDate", "date"],
                              [
                                "Refund Approval Received Date",
                                "refundApprovalReceivedDate",
                                "date",
                              ],
                              [
                                "Refund Approval Amount",
                                "refundApprovalAmount",
                                "number",
                              ],
                              ["Last Reminder Date", "lastReminderDate", "date"],
                              ["Lawyer's Opinion", "lawyersOpinion", "text"],
                              ["Court Case Details", "courtCaseDetails", "text"],
                              [
                                "Final Judgement Details",
                                "finalJudgementDetails",
                                "text",
                              ],
                              ["Judgement Date", "judgementDate", "date"],
                              ["Lawyer's Fee", "lawyersFee", "number"],
                              [
                                "Court & Legal Expenses",
                                "courtLegalExpenses",
                                "number",
                              ],
                              ["Motivation Amount", "motivationAmount", "number"],
                              ["Total Legal Fees", "totalLegalFees", "number"],
                              [
                                "Court Case Status",
                                "courtCaseStatus",
                                "select",
                                ["Pending", "Closed", "Ongoing"],
                              ],
                            ].map(([label, name, type, options]) => (
                              <div key={name as string}>
                                <label className="block text-sm font-medium mb-1">
                                  {label}
                                </label>
                                {type === "select" ? (
                                  <select
                                    name={name as string}
                                    value={
                                      formData[
                                      name as keyof typeof formData
                                      ] as string
                                    }
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                  >
                                    {(options as string[])?.map((option) => (
                                      <option key={option}>{option}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    name={name as string}
                                    type={type as string}
                                    value={
                                      formData[
                                      name as keyof typeof formData
                                      ] as string
                                    }
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                    placeholder={label as string}
                                  />
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Display existing comments */}
                          {renderComments()}

                          {/* Comment & Save Section */}
                          <div className="flex flex-col md:flex-row justify-between mt-6 gap-4">
                            <div className="relative flex w-full md:w-3/4">
                              <input
                                type="text"
                                placeholder="Add Comment"
                                name="newComment"
                                value={formData.newComment ?? ""}
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
                              onClick={handleSubmit}
                              type="button"
                              className="bg-blue-600 text-white px-6 py-2 rounded-md"
                            >
                              Save
                            </button>
                          </div>

                          {/* Display current user info if available */}
                          {userData && (
                            <div className="mt-6 text-sm text-gray-500">
                              Logged in as: {userData.email} ({userData.role})
                            </div>
                          )}
                        </>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
