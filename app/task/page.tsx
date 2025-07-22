"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Head from "next/head";
import { Bell } from "lucide-react";
import { parseCookies } from "nookies";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Custom styles for better pagination visibility
const customStyles = `
  .ag-theme-alpine .ag-paging-panel {
    background-color: #f8fafc;
    border-top: 1px solid #e2e8f0;
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .ag-theme-alpine .ag-paging-button {
    background-color: #ffffff;
    border: 1px solid #d1d5db;
    color: #374151;
    padding: 6px 12px;
    border-radius: 6px;
    margin: 0 2px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .ag-theme-alpine .ag-paging-button:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }
  
  .ag-theme-alpine .ag-paging-button.ag-disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }
  
  .ag-theme-alpine .ag-paging-page-summary-panel {
    color: #6b7280;
    font-weight: 500;
  }
  
  .ag-theme-alpine .ag-paging-page-size-select {
    background-color: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 4px 8px;
    color: #374151;
  }
`;
import { 
  ClientSideRowModelModule, 
  ValidationModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  ModuleRegistry
} from 'ag-grid-community';

// Register required modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ValidationModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule
]);
import { requireAuth } from "../utils/auth";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { GridReadyEvent } from 'ag-grid-community';
export default function MasterDatabase() {
  const [taskData, setTaskData] = useState<any>({ sno: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [recentUsers, setRecentUsers] = useState<UserApiResponse[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("Task");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredAssignees, setFilteredAssignees] = useState<UserApiResponse[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [claims, setClaims] = useState<Array<{
    claimDetails: string;
    claimSentDate: string;
    claimReplyReceivedDate: string;
    claimStatus: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

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

  const filteredTasks = tasks.filter(
    (task) =>
      task.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.sender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onGridReady = useCallback((params:any) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
  }, []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 120, // Increased for better readability
    maxWidth: 300,
    flex: 1,
    suppressSizeToFit: false,
  }), []);

  const columnDefs = useMemo(() => [
    { headerName: "S.No", field: "sno", minWidth: 80, maxWidth: 120 },
    { headerName: "Sender", field: "sender", minWidth: 140 },
    { headerName: "Subject", field: "subject", minWidth: 200, flex: 2 },
    { headerName: "Location", field: "location", minWidth: 120 },
    { headerName: "Receiver", field: "receiver", minWidth: 120 },
    { headerName: "Site", field: "site", minWidth: 120 },
    { headerName: "Period From", field: "periodFrom", minWidth: 120 },
    { headerName: "Period To", field: "periodTo", minWidth: 120 },
    { headerName: "Receipt Date", field: "receiptDate", minWidth: 120 },
    { headerName: "Due Date", field: "dueDate", minWidth: 120 },
    { headerName: "Overdue Date", field: "overDueDate", minWidth: 120 },
    { headerName: "Priority", field: "priority", minWidth: 100 },
    { headerName: "Description", field: "description", minWidth: 160 },
    { headerName: "Demands", field: "demands", minWidth: 140 },
    { headerName: "Status", field: "overallStatus", minWidth: 120 },
    { headerName: "Assigned Dept", field: "assignedDept", minWidth: 140 },
    { headerName: "Remarks", field: "remarks", minWidth: 140 },
    { headerName: "Opinion & Comments", field: "opinionAndComments", minWidth: 160 },
    { headerName: "Expert Opinion", field: "expertOpinion", minWidth: 140 },
    { headerName: "Expert Opinion Date", field: "expertOpinionDate", minWidth: 140 },
    { headerName: "CEO Comments", field: "ceoComments", minWidth: 140 },
    { headerName: "CEO Comments Date", field: "ceoCommentsDate", minWidth: 140 },
    { headerName: "Final Decision", field: "finalDecision", minWidth: 160 },
    { headerName: "Official Reply Date", field: "officialReplyDate", minWidth: 140 },
    { headerName: "Discussion Details", field: "discussionDetails", minWidth: 160 },
    { headerName: "Final Decision Date", field: "finalDecisionDate", minWidth: 140 },
    { headerName: "PV Report", field: "pvReport", minWidth: 140 },
    { headerName: "Official Amount", field: "officialAmount", minWidth: 120 },
    { headerName: "Penalties Amount", field: "penaltiesAmount", minWidth: 120 },
    { headerName: "Motivation Amount", field: "motivationAmount", minWidth: 120 },
    { headerName: "Total Amount", field: "totalAmount", minWidth: 120 },
    { headerName: "CEO Approval Status", field: "ceoApprovalStatus", minWidth: 140 },
    { headerName: "CEO Approval Date", field: "ceoApprovalDate", minWidth: 140 },
    { headerName: "Invoice Details", field: "invoiceDetails", minWidth: 140 },
    { headerName: "Final Settlement", field: "finalSettlement", minWidth: 140 },
    { headerName: "NDP No", field: "ndpNo", minWidth: 120 },
    { headerName: "NDP Amount", field: "ndpAmount", minWidth: 120 },
    { headerName: "DN No", field: "dnNo", minWidth: 120 },
    { headerName: "DN Amount", field: "dnAmount", minWidth: 120 },
    { headerName: "AMR A No", field: "amrANo", minWidth: 120 },
    { headerName: "AMR B No", field: "amrBNo", minWidth: 120 },
    { headerName: "Claims Notes", field: "claimsNotes", minWidth: 140 },
    { headerName: "Litigation Case Details", field: "litigationCaseDetails", minWidth: 160 },
    { headerName: "Litigation Case Amount", field: "litigationCaseAmount", minWidth: 140 },
    { headerName: "Litigation Motivation Amount", field: "litigationMotivationAmount", minWidth: 160 },
    { headerName: "Litigation Case Status", field: "litigationCaseStatus", minWidth: 140 },
    { headerName: "Refund Request Date", field: "refundRequestDate", minWidth: 140 },
    { headerName: "Refund Approval Amount", field: "refundApprovalAmount", minWidth: 140 },
    { headerName: "Last Reminder Date", field: "lastReminderDate", minWidth: 140 },
    { headerName: "Lawyer's Opinion", field: "lawyersOpinion", minWidth: 140 },
    { headerName: "Court Case Details", field: "courtCaseDetails", minWidth: 140 },
    { headerName: "Final Judgement", field: "finalJudgementDetails", minWidth: 140 },
    { headerName: "Judgement Date", field: "judgementDate", minWidth: 140 },
    { headerName: "Lawyer's Fee", field: "lawyersFee", minWidth: 120 },
    { headerName: "Court Legal Expenses", field: "courtLegalExpenses", minWidth: 140 },
    { headerName: "Total Legal Fees", field: "totalLegalFees", minWidth: 140 },
    { headerName: "Court Case Status", field: "courtCaseStatus", minWidth: 140 },
  ], []);

  const onRowClicked = useCallback((event:any) => {
    router.push(`/tasks/${event.data._id}`);
  }, [router]);

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

  const fetchTaskFiles = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      const data = await res.json();
      if (res.ok && data.files) {
        setList(data.files);
      }
    } catch (error) {
      console.error("Error fetching task files:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch task files when taskId changes
  useEffect(() => {
    if (taskId) {
      fetchTaskFiles(taskId);
    } else {
      setList([]); // Clear list when no task is selected
    }
  }, [taskId]);

  // Auto-switch to card view on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'table') {
        setViewMode('cards');
      }
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Force card view on mobile for better experience
  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode('cards');
    }
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
          // Fetch task files after creating the task
          fetchTaskFiles(result._id);
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

    if (!file) {
      setStatus("No file selected.");
      return;
    }
    if (!taskId) {
      setStatus("Error: No task selected for upload. Please select a task first.");
      console.error("Task ID is not available for file upload in MasterDatabase.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("files", file);
    formData.append("taskId", taskId);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      console.log("Response JSON:", data);

      if (res.ok && data.success) {
        setStatus("Upload successful!");
        // Update the list with the uploaded files
        if (data.task && data.task.files) {
          setList(data.task.files);
        }
        fetchTasks();
      } else {
        setStatus("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error('Upload error:', err);
      setStatus("Upload failed due to network or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster />
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="w-52 fixed h-full z-50 md:block">
        <Navbar />
      </div>
      {!showForm ? (
        <div className="flex-1 overflow-y-auto p-4 md:ml-64 pt-16 md:pt-4">
          {/* Enhanced Header Section */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Task Management</h1>
                <p className="text-gray-600">Manage and track all your tasks efficiently</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80 pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white shadow-sm"
                  />
                  <svg
                    className="h-5 w-5 text-gray-400 absolute left-3 top-3.5"
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
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="hidden sm:inline">Add New Task</span>
                  <span className="sm:hidden">Add Task</span>
                </button>
              </div>
            </div>
          </div>

          {/* Floating Action Button for Mobile */}
          <div className="fixed bottom-6 right-6 z-50 md:hidden">
            <button
              onClick={() => {
                setShowForm(true);
                setTaskId(null);
                setFormData({
                  sno: "", sender: "", subject: "", location: "", receiver: "", site: "",
                  periodFrom: "", periodTo: "", receiptDate: "", dueDate: "", overDueDate: "",
                  priority: "", description: "", demands: "", overallStatus: "", assignedDept: "",
                  assignee: [], remarks: "", comments: [], newComment: "", opinionAndComments: "",
                  expertOpinion: "", expertOpinionDate: "", internalComments: "", internalCommentsDate: "",
                  ceoComments: "", ceoCommentsDate: "", finalDecision: "", officialReplyDate: "",
                  discussionDetails: "", finalDecisionDate: "", pvReport: "", officialAmount: "",
                  penaltiesAmount: "", motivationAmount: "", totalAmount: "", ceoApprovalStatus: "",
                  ceoApprovalDate: "", invoiceDetails: "", finalSettlement: "", ndpNo: "",
                  ndpReceivedDate: "", ndpAmount: "", ndpPaymentDueDate: "", ndpPaymentDate: "",
                  ndpPaymentStatus: "", dnNo: "", dnReceivedAmount: "", dnAmount: "", dnPaymentDueDate: "",
                  dnPaymentDate: "", dnPaymentStatus: "", amrANo: "", amrAReceivedDate: "", amrAAmount: "",
                  amrAPaymentDueDate: "", amrAPaymentDate: "", amrAPaymentStatus: "", amrBNo: "",
                  amrBReceivedDate: "", amrBAmount: "", amrBPaymentDueDate: "", amrBPaymentDate: "",
                  amrBPaymentStatus: "", claimsNotes: "", litigationCaseDetails: "", litigationCaseStartDate: "",
                  litigationCaseAmount: "", litigationCaseAmountPaymentDate: "", litigationMotivationAmount: "",
                  litigationCaseClosedDate: "", litigationCaseStatus: "", refundRequestDate: "",
                  refundApprovalReceivedDate: "", refundApprovalAmount: "", lastReminderDate: "",
                  lawyersOpinion: "", courtCaseDetails: "", finalJudgementDetails: "", judgementDate: "",
                  lawyersFee: "", courtLegalExpenses: "", totalLegalFees: "", courtCaseStatus: "",
                });
              }}
              className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.overallStatus?.toLowerCase().includes('pending')).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.overallStatus?.toLowerCase().includes('completed')).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => {
                    if (!t.dueDate) return false;
                    return new Date(t.dueDate) < new Date();
                  }).length}</p>
                </div>
              </div>
            </div>
          </div>
          {/* View Toggle */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
            <div className="flex items-center justify-center sm:justify-start">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      toast.success("Table view is optimized for desktop. Consider using card view on mobile for better experience.");
                    }
                    setViewMode('table');
                  }}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="hidden sm:inline">Table</span>
                  <span className="sm:hidden">List</span>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    viewMode === 'cards'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="hidden sm:inline">Cards</span>
                  <span className="sm:hidden">Grid</span>
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600 text-center sm:text-right">
              {viewMode === 'table' ? (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Desktop optimized
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Mobile friendly
                </span>
              )}
            </div>
          </div>

          {/* Enhanced Table Container */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Tasks Overview</h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing {filteredTasks.length} of {tasks.length} tasks
                {searchTerm && ` (filtered by "${searchTerm}")`}
              </p>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Loading tasks...</span>
                </div>
              </div>
            ) : viewMode === 'table' ? (
              <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 400px)', width: '100%' }}>
                <AgGridReact
                  theme="legacy"
                  rowData={filteredTasks}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  onGridReady={onGridReady}
                  onRowClicked={onRowClicked}
                  rowHeight={60}
                  headerHeight={50}
                  suppressRowClickSelection={true}
                  animateRows={true}
                  pagination={true}
                  paginationPageSize={20}
                  paginationPageSizeSelector={[10, 20, 50, 100]}
                  domLayout="normal"
                  suppressPaginationPanel={false}
                  paginationAutoPageSize={false}
                  suppressColumnVirtualisation={false}
                  suppressRowVirtualisation={false}
                  enableCellTextSelection={true}
                  suppressMenuHide={true}
                />
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map((task) => (
                    <div
                      key={task._id}
                      onClick={() => router.push(`/tasks/${task._id}`)}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300 group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                            {task.subject || 'No Subject'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">S.No:</span> {task.sno || 'N/A'}
                          </p>
                          {task.sender && (
                            <p className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">From:</span> {task.sender}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {task.priority && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.priority === 'High' ? 'bg-red-100 text-red-800' :
                              task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {task.priority}
                            </span>
                          )}
                          {task.overallStatus && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.overallStatus.toLowerCase().includes('completed') ? 'bg-green-100 text-green-800' :
                              task.overallStatus.toLowerCase().includes('pending') ? 'bg-yellow-100 text-yellow-800' :
                              task.overallStatus.toLowerCase().includes('overdue') ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.overallStatus}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        {task.assignedDept && (
                          <p><span className="font-medium">Department:</span> {task.assignedDept}</p>
                        )}
                        {task.location && (
                          <p><span className="font-medium">Location:</span> {task.location}</p>
                        )}
                        {task.dueDate && (
                          <p className={`${new Date(task.dueDate) < new Date() ? 'text-red-600 font-medium' : ''}`}>
                            <span className="font-medium">Due:</span> {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}
                        {task.createdAt && (
                          <p><span className="font-medium">Created:</span> {new Date(task.createdAt).toLocaleDateString()}</p>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Click to view details
                          </span>
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredTasks.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-gray-600">Try adjusting your search criteria or create a new task.</p>
                  </div>
                )}
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
                          <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                              className="border rounded px-3 py-2 text-sm w-full sm:w-auto"
                              name="file"
                            />
                            <button
                              type="submit"
                              disabled={!file || loading}
                              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700 transition flex items-center justify-center w-full sm:w-auto"
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
                          </form>
                          {/* Show warning if no taskId */}
                          {!taskId && (
                            <div className="mt-2 text-xs text-red-600 font-medium">
                              Please save the task before uploading an image.
                            </div>
                          )}
                          {status && <p className="mt-3 text-green-600 font-medium">{status}</p>}
                          <h2 className="text-xl mt-6 mb-2 font-semibold">Your Files</h2>
                          {list.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                              <p>No files uploaded yet</p>
                            </div>
                          ) : (
                            <ul className="list-none pl-0 space-y-3">
                              {list.map((f) => (
                                <li key={f._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div className="flex items-center space-x-2">
                                      <span role="img" aria-label="file" className="text-lg">
                                        📄
                                      </span>
                                      <span className="font-medium text-gray-900 break-all">
                                        {f.fileName || f.name}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 sm:text-sm">
                                      {new Date(f.uploadedAt).toLocaleDateString()} at {new Date(f.uploadedAt).toLocaleTimeString()}
                                    </div>
                                  </div>
                                  {f.url && (
                                    <div className="mt-2">
                                      <a 
                                        href={f.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                                      >
                                        View File
                                      </a>
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {renderComments()}

                      <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
                        <div className="relative flex w-full sm:w-336">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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

                        <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
                          <div className="relative flex w-full sm:w-336">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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

                      <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
                        <div className="relative flex w-full sm:w-336">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                      <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
                        <div className="relative flex w-full sm:w-336">
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                      <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
                        <div className="relative flex w-full sm:w-3/4">
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
