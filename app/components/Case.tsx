'use client';
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

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
interface TaskProps {
    taskId: string | null;
    setTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  }

interface ClaimData {
  claimDetails: string;
  claimSentDate: string;
  claimReplyReceivedDate: string;
  claimStatus: string;
}

const Case: React.FC<TaskProps> = ({ taskId, setTaskId }) => {

  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [claims, setClaims] = useState<ClaimData[]>([
    {
      claimDetails: "",
      claimSentDate: "",
      claimReplyReceivedDate: "",
      claimStatus: "Pending"
    }
  ]);
  
  const [formData, setFormData] = useState({
    sno: "",
    litigationCaseDetails: "",
    litigationCaseStartDate: "",
    litigationCaseAmount: "",
    litigationCaseAmountPaymentDate: "",
    litigationMotivationAmount: "",
    litigationCaseClosedDate: "",
    litigationCaseStatus: "Open",
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
    motivationAmount: "",
    totalLegalFees: "",
    courtCaseStatus: "Pending",
    comments: [] as Comment[],
    newComment: "",
  });

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
    } else {
      setIsLoading(false);
    }
  }, []);

  // Auto-generate Serial No.
  useEffect(() => {
    const fetchSno = async () => {
      if (!userData?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await axios.get(`/api/tasks?userId=${userData.id}`);
        const count = res.data.length;
        const newSno = `TSK-${count + 1}`;
        console.log('Generated Serial Number:', newSno);
        setFormData(prev => ({ ...prev, sno: newSno }));
      } catch (err) {
        console.error("Error fetching user tasks:", err);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchSno();
  }, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClaimChange = (index: number, field: keyof ClaimData, value: string) => {
    const updatedClaims = [...claims];
    updatedClaims[index][field] = value;
    setClaims(updatedClaims);
  };

  const handleAddClaim = () => {
    setClaims([
      ...claims,
      {
        claimDetails: "",
        claimSentDate: "",
        claimReplyReceivedDate: "",
        claimStatus: "Pending"
      }
    ]);
  };

  const handleCommentAdd = () => {
    if (!formData.newComment?.trim()) return;

    const newComment: Comment = {
      message: formData.newComment,
      createdAt: new Date(),
      user: userData || undefined,
    };

    setFormData(prev => ({
      ...prev,
      comments: [...prev.comments, newComment],
      newComment: "",
    }));
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

  const handleSubmit = async () => {
    // Check if loading
    if (isLoading) {
      alert("Please wait, form is still loading data.");
      return;
    }
    
    // Check if sno is missing
    if (!formData.sno || formData.sno.trim() === "") {
      alert("Serial number (sno) is required but is missing.");
      return;
    }

    // Create a copy of the data to submit
    const dataToSubmit = {
      ...formData,
      claims: claims,
      createdBy: userData || undefined,
    };
    
    // // Remove the temporary newComment field
    // delete dataToSubmit.newComment;
    
    console.log("Submitting data with sno:", dataToSubmit.sno);
    console.log("Full submission data:", dataToSubmit);
    
    try {
      // First try with axios
      const res = await axios.post("/api/submit", { data: dataToSubmit });
      console.log("Submission successful:", res.data);
      alert("Case submitted successfully!");
    } catch (error) {
      console.error("Submit error with axios:", error);
      
      // If axios fails, try with fetch as a fallback
      try {
        const fetchRes = await fetch("/api/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: dataToSubmit }),
        });
        
        if (!fetchRes.ok) {
          throw new Error(`HTTP error! Status: ${fetchRes.status}`);
        }
        
        const result = await fetchRes.json();
        console.log("Fetch submission successful:", result);
        alert("Case submitted successfully!");
      } catch (fetchError) {
        console.error("Submit error with fetch:", fetchError);
        alert("Failed to submit the form. Please check the console for details.");
      }
    }
  };

  return (
    <div className="p-4 md:p-6 text-black">
      {isLoading ? (
        <div className="text-center py-4">Loading form data...</div>
      ) : (
        <>
          {/* Display the serial number */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Serial Number <span className="text-red-500">*</span>
            </label>
            <input
              name="sno"
              type="text"
              value={formData.sno}
              onChange={handleChange}
              className="w-full p-2 border rounded-md bg-gray-100"
              readOnly
            />
            {!formData.sno && (
              <p className="text-red-500 text-sm mt-1">
                Serial number is required
              </p>
            )}
          </div>

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
                  <th className="px-1 py-2 border border-gray-300">S.no</th>
                  <th className="px-2 py-2 border border-gray-300">
                    Claim Details
                  </th>
                  <th className="px-2 py-2 border border-gray-300">
                    Claim Sent Date
                  </th>
                  <th className="px-3 py-2 border border-gray-300">
                    Claim Reply Received Date
                  </th>
                  <th className="px-2 py-2 border border-gray-300">Claim Status</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim, index) => (
                  <tr key={index} className="bg-blue-50">
                    <td className="px-3 py-2 border border-gray-300 text-black">{index + 1}</td>
                    <td className="px-3 py-2 border border-gray-300">
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md text-black"
                        placeholder="Claim Details"
                        value={claim.claimDetails}
                        onChange={(e) => handleClaimChange(index, 'claimDetails', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <input
                        type="date"
                        className="w-full p-2 border rounded-md text-black"
                        value={claim.claimSentDate}
                        onChange={(e) => handleClaimChange(index, 'claimSentDate', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <input
                        type="date"
                        className="w-full p-2 border rounded-md text-black"
                        value={claim.claimReplyReceivedDate}
                        onChange={(e) => handleClaimChange(index, 'claimReplyReceivedDate', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2 border border-gray-300">
                      <select 
                        className="w-full p-2 border rounded-md text-black"
                        value={claim.claimStatus}
                        onChange={(e) => handleClaimChange(index, 'claimStatus', e.target.value)}
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
              ["Litigation Case Details", "litigationCaseDetails", "text"],
              ["Litigation Case Start Date", "litigationCaseStartDate", "date"],
              ["Litigation Case Amount", "litigationCaseAmount", "number"],
              ["Litigation Case Amount Payment Date", "litigationCaseAmountPaymentDate", "date"],
              ["Litigation Motivation Amount", "litigationMotivationAmount", "number"],
              ["Litigation Case Closed Date", "litigationCaseClosedDate", "date"],
              ["Litigation Case Status", "litigationCaseStatus", "select", ["Open", "Closed"]],
              ["Refund Request Date", "refundRequestDate", "date"],
              ["Refund Approval Received Date", "refundApprovalReceivedDate", "date"],
              ["Refund Approval Amount", "refundApprovalAmount", "number"],
              ["Last Reminder Date", "lastReminderDate", "date"],
              ["Lawyer's Opinion", "lawyersOpinion", "text"],
              ["Court Case Details", "courtCaseDetails", "text"],
              ["Final Judgement Details", "finalJudgementDetails", "text"],
              ["Judgement Date", "judgementDate", "date"],
              ["Lawyer's Fee", "lawyersFee", "number"],
              ["Court & Legal Expenses", "courtLegalExpenses", "number"],
              ["Motivation Amount", "motivationAmount", "number"],
              ["Total Legal Fees", "totalLegalFees", "number"],
              ["Court Case Status", "courtCaseStatus", "select", ["Pending", "Closed", "Ongoing"]],
            ].map(([label, name, type, options]) => (
              <div key={name as string}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                {type === "select" ? (
                  <select
                    name={name as string}
                    value={formData[name as keyof typeof formData] as string}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                  >
                    {(options as string[])?.map(option => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={name as string}
                    type={type as string}
                    value={formData[name as keyof typeof formData] as string}
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
              disabled={isLoading}
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
      )}
    </div>
  );
};

export default Case;