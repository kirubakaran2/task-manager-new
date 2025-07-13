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
interface TaskProps {
    taskId: string | null;
    setTaskId: React.Dispatch<React.SetStateAction<string | null>>;
  }

interface Comment {
  message: string;
  createdAt?: Date;
  user?: UserData;
}


const Invoice: React.FC<TaskProps> = ({ taskId, setTaskId }) => {

  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    sno: "",
    discussionDetails: "",
    finalDecision: "",
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
    comments: [] as Comment[],
    newComment: "",
  });

  const [userData, setUserData] = useState<UserData | null>(null);

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
      setIsLoading(false); // If no user data, still need to stop loading
    }
  }, []);

  // Auto-generate Serial No.
  useEffect(() => {
    const fetchSno = async () => {
      if (!userData?.id) {
        setIsLoading(false);
        return; // Exit but make sure to set loading to false
      }
      
      try {
        const res = await axios.get(`/api/tasks?userId=${userData.id}`);
        const count = res.data.length;
        const newSno = `TSK-${count + 1}`;
        console.log('Generated Serial Number:', newSno); // Debug log
        setFormData(prev => ({ ...prev, sno: newSno }));
      } catch (err) {
        console.error("Error fetching user tasks:", err);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchSno();
  }, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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
        <h3 className="font-medium mb-3">{formData.comments.length} Comments</h3>
        {formData.comments.map((comment, index) => (
          <div key={index} className="flex gap-3 mb-4 pb-4 border-b last:border-none">
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
            />
            {!formData.sno && (
              <p className="text-red-500 text-sm mt-1">
                Serial number is required
              </p>
            )}
          </div>
            <div className="h-8 w-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center">
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <p className="font-medium">
                  {comment.user ? `${comment.user.email} (${comment.user.role})` : 'Anonymous'}
                  <span className="text-xs text-gray-500 ml-2">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                  </span>
                </p>
                <button className="text-gray-400">⋯</button>
              </div>
              <p className="text-sm mt-1">{comment.message}</p>
              <button className="text-sm text-gray-500 mt-1">Reply</button>
            </div>
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
      createdBy: userData || undefined,
    };
    
    // Remove the temporary newComment field
    // delete dataToSubmit.newComment;
    
    // Debug log to see what's being sent
    console.log("Submitting data with sno:", dataToSubmit.sno);
    console.log("Full submission data:", dataToSubmit);
    
    try {
      // First try with axios
      const res = await axios.post("/api/submit", { data: dataToSubmit });
      console.log("Submission successful:", res.data);
      alert("Form submitted successfully!");
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
        alert("Form submitted successfully!");
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
            />
            {!formData.sno && (
              <p className="text-red-500 text-sm mt-1">
                Serial number is required
              </p>
            )}
          </div>

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
              disabled={isLoading}
            >
              Save
            </button>
          </div>

          {/* Debug Information */}
          <div className="mt-6 p-3 bg-gray-100 rounded text-xs">
            <p>Debug Info:</p>
            <p>SNO: {formData.sno || "Not set"}</p>
            <p>Loading: {isLoading ? "True" : "False"}</p>
            <p>User: {userData ? `${userData.email} (${userData.role})` : "Not loaded"}</p>
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
  );
};

export default Invoice;