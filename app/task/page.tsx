"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { Bell } from "lucide-react";
import { parseCookies } from "nookies";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";
import { requireAuth } from "../utils/auth";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
export default function MasterDatabase() {
  const [taskData, setTaskData] = useState<any>({ sno: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [recentUsers, setRecentUsers] = useState<UserApiResponse[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("Task");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const filteredTasks = tasks.filter(
    (task) =>
      task.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.sender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [filteredAssignees, setFilteredAssignees] = useState<UserApiResponse[]>(
    []
  );
  const [selectAll, setSelectAll] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [claims, setClaims] = useState<
    Array<{
      claimDetails: string;
      claimSentDate: string;
      claimReplyReceivedDate: string;
      claimStatus: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  type UserData = {
    _id: string;
    email: string;
    role: string;
    name?: string;
    department?: string;
    location?: string;
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
    message: string;
    createdAt?: Date;
    user?: UserData;
    userEmail?: string;
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
    assignee: string[];
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

  // Protect route
  useEffect(() => {
    requireAuth();
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
        assignee: currentUser.email ? [currentUser.email] : [],
        assignedDept: currentUser.department || "",
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

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      const data = await res.json();
      console.log(data);
      if (res.ok) {
        setTasks(data);
      } else {
        toast.error("Failed to fetch tasks");
      }
    } catch (error) {
      toast.error("Error fetching tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
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
          setOptions((prev) => ({ ...prev, [key]: data }));
        } catch (err) {
          console.error(`Error fetching ${key}:`, err);
        }
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const deptUsers = recentUsers.filter(
      (user) => user.department === formData.assignedDept
    );
    setFilteredAssignees(deptUsers);
    setFormData((prev) => ({ ...prev, assignee: [] }));
    setSelectAll(false);
  }, [formData.assignedDept]);

  const handleMultiSelect = (email: string) => {
    setFormData((prev) => {
      const currentAssignees = Array.isArray(prev.assignee)
        ? [...prev.assignee]
        : [];

      if (currentAssignees.includes(email)) {
        return {
          ...prev,
          assignee: currentAssignees.filter((e) => e !== email),
        };
      } else {
        return {
          ...prev,
          assignee: [...currentAssignees, email],
        };
      }
    });
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);

    setFormData((prev) => {
      if (!selectAll) {
        return {
          ...prev,
          assignee: filteredAssignees.map((user) => user.email),
        };
      } else {
        return {
          ...prev,
          assignee: [],
        };
      }
    });
  };

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
      userEmail: userData?.email || "",
    };

    setFormData({
      ...formData,
      comments: [...formData.comments, newComment],
      newComment: "",
    });
  };

  const handleClaimChange = (index: number, field: string, value: string) => {
    const updatedClaims = [...claims];
    updatedClaims[index] = {
      ...updatedClaims[index],
      [field]: value,
    };
    setClaims(updatedClaims);
  };

  interface TaskSubmitData {
    [key: string]: any;
    comments: Comment[];
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    if (e) {
      e.preventDefault();
    }

    try {
      const submitData: TaskSubmitData = { ...formData };

      if (typeof submitData.assignee === "string") {
        submitData.assignee = submitData.assignee
          .split(",")
          .map((email) => email.trim());
      } else if (!Array.isArray(submitData.assignee)) {
        submitData.assignee = [];
      }

      if (submitData.opinionAndComments) {
        submitData.comments.push({
          message: submitData.opinionAndComments,
          createdAt: new Date(),
          user: userData || undefined,
          userEmail: userData?.email || "",
        });
      }

      delete submitData.newComment;
      delete submitData.opinionAndComments;

      if (userData) {
        submitData.createdBy = userData;
        submitData.createdByEmail = userData.email;
      }

      let res: Response;
      let result;

      if (taskId) {
        res = await fetch(`/api/submit`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: submitData, _id: taskId }),
        });

        if (res.ok) {
          toast.success("Task updated successfully ✅");
        } else {
          throw new Error("Failed to update task");
        }
      } else {
        const formData = new FormData();
        formData.append("task", JSON.stringify(submitData));

        if (file) {
          formData.append("files", file);
        }

        res = await fetch("/api/tasks", {
          method: "POST",
          body: formData,
        });

        let result;
        try {
          result = await res.json();
        } catch (err) {
          console.error("Failed to parse response as JSON", err);
          toast.error("Server returned invalid JSON ❌");
          return;
        }

        if (!res.ok || result?.error) {
          console.error("API Error:", result?.error || "Unknown server error");
          toast.error("Task creation failed ❌");
          return;
        }

        if (result._id) {
          setTaskId(result._id);
        }

        toast.success("Task created successfully ✅");
      }

      if (!result && res.ok) {
        result = await res.json().catch((err) => {
          console.log("Unable to parse response as JSON", err);
          return null;
        });
      }

      if (result) {
        console.log("Response from server:", result);
      }
    } catch (err) {
      console.error("Task save failed:", err);
      toast.error("Failed to save task ❌");
    } finally {
      setShowForm(false);
      fetchTasks();
    }
  };

  const renderComments = () => {
    if (!formData.comments.length) return null;

    return formData.comments.map((comment, index) => {
      let displayName = "Anonymous";

      if (typeof comment.user === "object" && comment.user) {
        displayName = comment.user.name || comment.user.email || displayName;
      } else if (comment.userEmail) {
        displayName = comment.userEmail;
      }

      const dateDisplay = comment.createdAt
        ? new Date(comment.createdAt).toLocaleDateString()
        : "Unknown date";

      return (
        <div key={index} className="mt-2 p-2 bg-gray-50 rounded">
          <div className="text-sm text-black">
            {displayName} - {dateDisplay}
          </div>
          <div className="mt-1">{comment.message}</div>
        </div>
      );
    });
  };

  const handleAddClaim = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    const newClaim = {
      claimDetails: "",
      claimSentDate: "",
      claimReplyReceivedDate: "",
      claimStatus: "Pending",
    };
    setClaims([...claims, newClaim]);
    toast.success("New claim added!");
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("files", file); // ✅ must match backend's expected field

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    console.log("Response JSON:", data);

    setLoading(false);
    if (data.success) {
      setStatus("Upload successful!");
      // Update your file list if needed
    } else {
      setStatus("Upload failed.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Toaster />
      <div className="w-52 fixed h-full">
        <Navbar />
      </div>
      {!showForm ? (
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 ml-64">
          <div className="bg-white rounded-md w-full max-w-6xl mx-auto shadow-md">
            <div className="flex justify-between items-center p-4">
              <h2 className="text-lg font-medium text-black">Tasks List</h2>
              <div className="flex items-center space-x-4 w-full max-w-xl mx-auto mb-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search by subject"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                  Search
                </button>
              </div>
              <button
                onClick={() => {
                  setShowForm(true);
                  setTaskId(null);
                  setFormData({
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
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                + Add Task
              </button>
            </div>

            {loading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        S.No
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Sender
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Subject
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Location
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Receiver
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Site
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Period From
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Period To
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Receipt Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Due Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Overdue Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Priority
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Description
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Demands
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Assigned Dept
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Remarks
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Opinion & Comments
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Expert Opinion
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Expert Opinion Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        CEO Comments
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        CEO Comments Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Final Decision
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Official Reply Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Discussion Details
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Final Decision Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        PV Report
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Official Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Penalties Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Motivation Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Total Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        CEO Approval Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        CEO Approval Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Invoice Details
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Final Settlement
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        NDP No
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        NDP Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        DN No
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        DN Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        AMR A No
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        AMR B No
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Claims Notes
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Litigation Case Details
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Litigation Case Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Litigation Motivation Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Litigation Case Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Refund Request Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Refund Approval Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Last Reminder Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Lawyer’s Opinion
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Court Case Details
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Final Judgement
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Judgement Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Lawyer’s Fee
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Court Legal Expenses
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Total Legal Fees
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider border border-gray-300">
                        Court Case Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task) => (
                      <tr
                        key={task._id}
                        onClick={() => router.push(`/tasks/${task._id}`)}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.sno}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.sender}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.subject}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.location}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.receiver}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.site}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.periodFrom}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.periodTo}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.receiptDate}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.dueDate}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.overDueDate}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.priority}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.description}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.demands}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.overallStatus}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.assignedDept}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.remarks}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.opinionAndComments}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.expertOpinion}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.expertOpinionDate}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.ceoComments}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.ceoCommentsDate}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.finalDecision}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.officialReplyDate}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.discussionDetails}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.finalDecisionDate}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.pvReport}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.officialAmount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.penaltiesAmount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.motivationAmount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.totalAmount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.ceoApprovalStatus}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.ceoApprovalDate}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.invoiceDetails}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.finalSettlement}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.ndpNo}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.ndpAmount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.dnNo}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.dnAmount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.amrANo}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.amrBNo}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.claimsNotes}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.litigationCaseDetails}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.litigationCaseAmount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.litigationMotivationAmount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.litigationCaseStatus}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.refundRequestDate}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.refundApprovalAmount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.lastReminderDate}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.lawyersOpinion}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.courtCaseDetails}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.finalJudgementDetails}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.judgementDate}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.lawyersFee}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.courtLegalExpenses}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.totalLegalFees}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-black border border-gray-300">
                          {task.courtCaseStatus}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden ml-64">
          <Head>
            <title>Task</title>
          </Head>

          <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Task</h1>
            <button className="text-gray-500 hover:text-gray-600">
              <Bell className="h-6 w-6" />
            </button>
          </header>

          <div className="bg-white p-4 flex gap-3 shadow-sm">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by subject"
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
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              Search
            </button>
            <button
              onClick={() => {
                setTaskId(null);
                setTaskData({});
                setActiveTab("Task");
                toast.success("New task initialized!");
              }}
              className="..."
            >
              <span>+</span> Add Task
            </button>
          </div>

          <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
            <div className="bg-white rounded-md w-full max-w-6xl mx-auto shadow-md max-h-[80vh] overflow-hidden flex">
              <div className="flex flex-col w-12 text-center border-r border-blue-100">
                {["Task", "outcome", "invoices", "claims", "case"].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`h-24 flex justify-center transition-colors duration-200 ${activeTab === tab
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 hover:bg-blue-100 text-gray-700"
                        }`}
                      style={{
                        writingMode: "vertical-lr",
                        transform: "rotate(180deg)",
                      }}
                    >
                      <span className="font-medium">
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </span>
                    </button>
                  )
                )}
              </div>

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
                    <div className="p-4 md:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {["sender", "subject"].map((field, i) => (
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
                            />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-black mb-1">
                            Assigned Department
                          </label>
                          {currentUser?.role &&
                            ["admin", "superadmin"].includes(currentUser.role) ? (
                            <select
                              name="assignedDept"
                              value={formData.assignedDept}
                              onChange={handleChange}
                              className="w-full p-2 border rounded-md text-black"
                            >
                              <option value="">Select Department</option>
                              {[
                                ...new Set(
                                  recentUsers.map((user) => user.department)
                                ),
                              ].map((dept) => (
                                <option key={dept} value={dept}>
                                  {dept}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              name="assignedDept"
                              value={formData.assignedDept}
                              readOnly
                              className="w-full p-2 border rounded-md text-black bg-gray-100"
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-black mb-1">
                            Assignee
                          </label>
                          {currentUser?.role &&
                            ["admin", "superadmin"].includes(currentUser.role) ? (
                            <>
                              <div className="mb-1">
                                <label className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAll}
                                    className="mr-2"
                                  />
                                  Select All
                                </label>
                              </div>
                              <div className="border rounded-md p-2 max-h-40 overflow-y-auto bg-white">
                                {filteredAssignees.map((user) => (
                                  <label
                                    key={user.email}
                                    className="block text-sm text-black"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={formData.assignee.includes(
                                        user.email
                                      )}
                                      onChange={() =>
                                        handleMultiSelect(user.email)
                                      }
                                      className="mr-2"
                                    />
                                    {user.email}
                                  </label>
                                ))}
                              </div>
                            </>
                          ) : (
                            <input
                              type="text"
                              name="assignee"
                              value={formData.assignee.join(", ")}
                              readOnly
                              className="w-full p-2 border rounded-md text-black bg-gray-100"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-black mb-1">
                            Overall Status
                          </label>
                          <input
                            type="text"
                            name="overallStatus"
                            value={formData.overallStatus}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md text-black"
                          />
                        </div>
                      </div>

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
                              <option value="">Select</option>
                              {options[field as keyof typeof options].map(
                                (
                                  item: {
                                    id?: string;
                                    value?: string;
                                    name?: string;
                                    label?: string;
                                  },
                                  idx: number
                                ) => (
                                  <option
                                    key={idx}
                                    value={item.id || item.value}
                                  >
                                    {item.name || item.label}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {["periodFrom", "periodTo", "receiptDate"].map(
                          (field, i) => (
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
                          )
                        )}
                      </div>

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
                        <div className="mb-6 text-black">
                          <form onSubmit={handleUpload}>
                            <div className="flex items-center space-x-3">
                              <input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                className="border rounded px-3 py-1 text-sm"
                                name="file"
                              />
                              <button
                                type="submit"
                                disabled={!file || loading}
                                className="px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700 transition flex items-center"
                              >
                                {loading ? (
                                  <>
                                    <svg
                                      className="animate-spin h-4 w-4 mr-2 text-white"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                      />
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                                      />
                                    </svg>
                                    Uploading...
                                  </>
                                ) : (
                                  "Upload"
                                )}
                              </button>
                            </div>
                          </form>

                          {status && <p className="mt-3 text-green-600 font-medium">{status}</p>}

                          <h2 className="text-xl mt-6 mb-2 font-semibold">Your Files</h2>
                          <ul className="list-none pl-0 space-y-2">
                            {list.map((f) => (
                              <li key={f._id} className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                                <span role="img" aria-label="file">
                                  📄 {f.name}
                                </span>
                                <span className="text-sm text-gray-600">
                                  (uploaded at {new Date(f.uploadedAt).toLocaleString()})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {renderComments()}

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
                        <form onSubmit={handleSubmit}>
                          <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md"
                          >
                            Save
                          </button>
                        </form>
                      </div>
                      {userData && (
                        <div className="mt-6 text-sm text-gray-500">
                          Commenting as: {userData.email} ({userData.role})
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === "outcome" && (
                    <div className="p-4 md:p-6 text-black">
                      <form onSubmit={handleSubmit}>
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

                        {renderComments()}

                        <div className="flex flex-col md:flex-row justify-between mt-6 gap-4">
                          <div className="relative flex w-full md:w-336">
                            <input
                              type="text"
                              placeholder="Add Comment"
                              name="newComment"
                              value={formData.newComment}
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

                      {userData && (
                        <div className="mt-6 text-sm text-gray-500">
                          Commenting as: {userData.email} ({userData.role})
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === "invoices" && (
                    <div className="p-4 md:p-6 text-black">
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

                      {renderComments()}

                      <div className="flex flex-col md:flex-row justify-between mt-6 gap-4">
                        <div className="relative flex w-full md:w-336">
                          <input
                            type="text"
                            placeholder="Add Comment"
                            name="newComment"
                            value={formData.newComment}
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

                      <div className="mt-6 p-3 bg-gray-100 rounded text-xs">
                        <p>Debug Info:</p>
                        <p>
                          User:{" "}
                          {userData
                            ? `${userData.email} (${userData.role})`
                            : "Not loaded"}
                        </p>
                      </div>

                      {userData && (
                        <div className="mt-6 text-sm text-gray-500">
                          Commenting as: {userData.email} ({userData.role})
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === "claims" && (
                    <div className="p-4 md:p-6 text-black">
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

                      {renderComments()}

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
                          onClick={handleSubmit}
                          type="button"
                          className="bg-blue-600 text-white px-6 py-2 rounded-md"
                        >
                          Save
                        </button>
                      </div>

                      <div className="mt-6 p-3 bg-gray-100 rounded text-xs">
                        <p>Debug Info:</p>
                        <p>
                          User:{" "}
                          {userData
                            ? `${userData.email} (${userData.role})`
                            : "Not loaded"}
                        </p>
                      </div>

                      {userData && (
                        <div className="mt-6 text-sm text-gray-500">
                          Commenting as: {userData.email} ({userData.role})
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === "case" && (
                    <div className="p-4 md:p-6 text-black">
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

                      {renderComments()}

                      <div className="flex flex-col md:flex-row justify-between mt-6 gap-4">
                        <div className="relative flex w-full md:w-3/4">
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
                          onClick={handleSubmit}
                          type="button"
                          className="bg-blue-600 text-white px-6 py-2 rounded-md"
                        >
                          Save
                        </button>
                      </div>

                      {userData && (
                        <div className="mt-6 text-sm text-gray-500">
                          Logged in as: {userData.email} ({userData.role})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
