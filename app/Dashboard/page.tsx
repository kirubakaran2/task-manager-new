// pages/dashboard.js
"use client";
import { useState, useEffect } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Label } from "recharts";
import { ChevronDown, User, FileText, Bell, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";
import { getCookie } from "../utils/cookies";
import { requireAuth } from "../utils/auth";
import { fetchDashboardData } from "../../lib/api";
import useSWR from "swr";
import Link from "next/link";
import TotalCasesByReceiver from "../components/Receiver";
type DashboardData = {
  totalTasks: number;
  highPriority: number;
  pendingCases: number;
  overdueCases: number;
  closedCases: number;
  departmentTasks: Array<{ _id: string; count: number }>;
  taskDetails: Array<{ _id: string; count: number }>;
  receiverDetails: Array<{ _id: string; count: number }>;
  litigationCaseStatus: Array<{ _id: string; count: number }>;
  claimsStatus: Array<{ _id: string; count: number }>;
  documentStatus: Array<{ _id: string; count: number }>;
  dnStatus: Array<{ _id: string; count: number }>;
  ndpStatus: Array<{ _id: string; count: number }>;
  amrStatus: Array<{ _id: string; count: number }>;
  courtCaseStatus: Array<{ _id: string; count: number }>;
};

interface LitigationStatus {
  _id: string;
  count: number;
}

// Data models
interface CaseCount {
  value: number;
  color: string;
  name: string;
}

interface ReceiverCase {
  name: string;
  totalCases: number;
  highPriority: number;
  categories: string[];
}

export default function Dashboard() {
  const user = JSON.parse(getCookie("user") || "{}");
  const role = user ? user.role : "Guest";
  const [activeFilter, setActiveFilter] = useState("This Week");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const { data: swrData, error, isLoading } = useSWR("/api/dashboard", fetchDashboardData);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchDashboardData();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    requireAuth();
  }, []);

  // Use SWR data if available, otherwise use state data
  const dashboardData = swrData || data;

  if (loading || isLoading) return <p>Loading...</p>;
  if (!dashboardData) return <p>Error loading dashboard data.</p>;

  // Map API data to component data
  const statusData: CaseCount[] = dashboardData.courtCaseStatus.map((item: { _id: string; count: number }) => {
    const colorMap: Record<string, string> = {
      Pending: "#FFB74D",
      Ongoing: "#2196F3",
      // Rejected: "#F44336",
      Closed: "#4CAF50"
    };
  
    return {
      value: item.count,
      color: colorMap[item._id] || "#9E9E9E",  // Default color for unknown statuses
      name: item._id
    };
  });
  
  interface TaskDetail {
    _id: string;
    count: number;
  }

  interface PriorityCaseCount extends CaseCount {
    value: number;
    color: string;
    name: string;
  }

  const priorityData: PriorityCaseCount[] = dashboardData.taskDetails.map((task: TaskDetail) => ({
    value: task.count,
    color: task._id === "High" ? "#EF4444" : task._id === "Medium" ? "#F59E0B" : task._id === "low" ? "#10B981" : "#9E9E9E",
    name: task._id,
  }));

  const deptColorMap: { [key: string]: string } = {
    Legal: "#3B82F6",      // Blue
    Taxation: "#10B981",   // Green
    Mining: "#EF4444",     // Red
    HR: "#F59E0B",         // Amber
    Compliance: "#8B5CF6", // Violet
    Admin: "#FBBF24",
  };
  
  interface DepartmentTask {
    _id: string;
    count: number;
  }

  interface DepartmentCaseCount extends CaseCount {
    name: string;
    value: number;
    color: string;
  }

  const deptData: DepartmentCaseCount[] = dashboardData.departmentTasks.map((dept: DepartmentTask) => ({
    value: dept.count,
    color: deptColorMap[dept._id] || "#9CA3AF", // Default to gray if not found
    name: dept._id,
  }));

  interface ClaimStatus {
    _id: string;
    count: number;
  }

  interface CaseCount {
    value: number;
    color: string;
    name: string;
  }

  const claimsData: CaseCount[] = dashboardData.claimsStatus.map((claim: ClaimStatus) => ({
      value: claim.count,
      color: claim._id === "Accepted" ? "#3B82F6" : claim._id === "Rejected" ? "#EF4444" : claim._id === "Pending" ? "#F59E0B" : "#10B981",
      name: claim._id,
  }));

  // Create receivers data properly with high priority counts for each receiver
  interface ReceiverDetail {
    _id: string;
    count: number;
  }

  interface ReceiverCase {
    name: string;
    totalCases: number;
    highPriority: number;
    categories: string[];
  }

  const receivers: ReceiverCase[] = dashboardData.receiverDetails.map((receiver: ReceiverDetail) => {
    // Calculate high priority cases for this specific receiver (mocked for now)
    const highPriorityForReceiver: number = Math.floor(receiver.count * 0.3); // 30% of cases are high priority for demo

    return {
      name: receiver._id,
      totalCases: receiver.count,
      highPriority: highPriorityForReceiver,
      categories: ['Legal', 'Taxation'], // Sample categories, in a real app this would come from API
    };
  });

  // Function to safely get document counts
  const getDocumentCount = (dataArray: Array<{ _id: string; count: number }> | undefined, id: string = "") => {
    if (!dataArray || !Array.isArray(dataArray)) return 0;
    const found = dataArray.find(item => item._id === id);
    return found ? found.count : 0;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Import the Navbar component */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pt-14 md:pt-0 md:ml-64">
        <header className="bg-white p-4 sticky top-0 z-10 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-xs text-gray-500">Overview of your cases and tasks</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Link href="/notifications">
                  <Bell size={20} className="text-gray-600 cursor-pointer hover:text-blue-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </Link>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm font-medium text-black">{role}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <SummaryCard icon="📊" label="Total Tasks" value={dashboardData.totalTasks} bgColor="bg-blue-100" textColor="text-blue-600" trend="up" />
            <SummaryCard icon="🔔" label="High Priority" value={dashboardData.highPriority} bgColor="bg-red-100" textColor="text-red-600" trend="up" />
            <SummaryCard icon="⏱️" label="Pending Cases" value={dashboardData.pendingCases} bgColor="bg-amber-100" textColor="text-amber-600" trend="same" />
            <SummaryCard icon="⚠️" label="Overdue Cases" value={dashboardData.overdueCases} bgColor="bg-green-100" textColor="text-green-600" trend="down" />
            <SummaryCard icon="✅" label="Closed Cases" value={dashboardData.closedCases} bgColor="bg-purple-100" textColor="text-purple-600" trend="up" />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            <Card title="Total Cases by Receiver">
              <div className="h-48 sm:h-60 md:h-72">
                {/* Replaced with custom chart since TotalCasesByReceiver component is missing */}
                <TotalCasesByReceiver />
              </div>
            </Card>

            <Card title="Court Case Status" hasDropdown activeFilter={activeFilter} onFilterChange={setActiveFilter}>
              <div className="h-48 sm:h-60 md:h-72">
                <DonutChart data={statusData} />
              </div>
            </Card>

            <Card title="Cases by Priority" hasDropdown activeFilter={activeFilter} onFilterChange={setActiveFilter}>
              <div className="h-48 sm:h-60 md:h-72">
                <DonutChart data={priorityData} />
              </div>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            <Card title="Dept Assignment" hasDropdown activeFilter={activeFilter} onFilterChange={setActiveFilter}>
              <div className="h-48 sm:h-60 md:h-72">
                <DonutChart data={deptData} />
              </div>
            </Card>

            <Card title="Litigation Case Status">
              <div className="flex flex-col gap-4 py-4">
                {dashboardData.litigationCaseStatus.map((status: LitigationStatus, idx: number) => (
                  <PriorityBar 
                  key={idx}
                  label={status._id} 
                  value={status.count} 
                  total={dashboardData.totalTasks} 
                  color={status._id === "High" ? "bg-red-500" : status._id === "Medium" ? "bg-amber-500" : "bg-green-500"} 
                  />
                ))}
              </div>
            </Card>

            <Card title="Claims Status" hasDropdown activeFilter={activeFilter} onFilterChange={setActiveFilter}>
              <div className="h-48 sm:h-60 md:h-72">
                <DonutChart data={claimsData} />
              </div>
            </Card>
          </div>

          {/* Receiver Details */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Receiver Details</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                View all <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {receivers.map((receiver, index) => (
                <ReceiverItem key={index} receiver={receiver} />
              ))}
            </div>
          </div>

          {/* Documents Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <DocumentCard
              title="NDP Documents"
              count={getDocumentCount(dashboardData.ndpStatus)}
              color="bg-blue-100"
              iconColor="text-blue-600"
            />
            <DocumentCard
              title="DN Documents"
              count={getDocumentCount(dashboardData.dnStatus)}
              color="bg-purple-100"
              iconColor="text-purple-600"
            />
            <DocumentCard
              title="AMR & Documents"
              count={getDocumentCount(dashboardData.amrStatus)}
              color="bg-pink-100"
              iconColor="text-pink-600"
            />
            <DocumentCard
              title="Overdue Documents"
              count={getDocumentCount(dashboardData.documentStatus, "Overdue")}
              color="bg-red-100"
              iconColor="text-red-600"
            />
          </div>
        </main>
      </div>
    </div>
  );
}

// Component for summary cards at the top
interface SummaryCardProps {
  icon: string;
  label: string;
  value: number;
  bgColor: string;
  textColor: string;
  trend?: "up" | "down" | "same";
}

function SummaryCard({ icon, label, value, bgColor, textColor, trend = "same" }: SummaryCardProps) {
  const trendIcons = {
    up: "↑",
    down: "↓",
    same: "→",
  };

  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    same: "text-gray-500",
  };

  return (
    <div className={`${bgColor} p-4 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className={`${textColor} text-2xl font-bold`}>{value}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className={`${textColor} text-2xl`}>{icon}</div>
          {trend !== "same" && (
            <span className={`text-xs ${trendColors[trend]}`}>
              {trendIcons[trend]} 12%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Card component with optional dropdown
interface CardProps {
  title: string;
  children: React.ReactNode;
  hasDropdown?: boolean;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

function Card({ title, children, hasDropdown = false, activeFilter = "This Week", onFilterChange }: CardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const filters = ["Today", "This Week", "This Month", "This Year"];

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md text-black">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-gray-800">{title}</h2>
        {hasDropdown && (
          <div className="relative">
            <button 
              className="text-xs bg-gray-100 rounded px-2 py-1 flex items-center hover:bg-gray-200 transition text-gray-700"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{activeFilter}</span>
              <ChevronDown size={14} className="ml-1" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                      activeFilter === filter ? "bg-gray-100 font-medium" : ""
                    }`}
                    onClick={() => {
                      onFilterChange && onFilterChange(filter);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

// Enhanced Donut chart component with numbers
interface DonutChartProps {
  data: CaseCount[];
}

function DonutChart({ data }: DonutChartProps) {
  // Safety check for empty data
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-500">No data available</div>;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            dataKey="value"
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
              const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
              const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
              const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);
              return (
                <text x={x} y={y} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" className="text-xs font-medium" fill="#4B5563">
                  {`${data[index].value} (${(percent * 100).toFixed(0)}%)`}
                </text>
              );
            }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <Label
              content={(props: any) => {
                if (!props.viewBox) return null;
                const { cx, cy } = props.viewBox;
                return (
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" className="text-lg font-bold" fill="#111827">
                    {total}
                  </text>
                );
              }}
              position="center"
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute bottom-2 left-0 right-0 flex flex-wrap justify-center gap-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center text-xs">
            <div className="w-3 h-3 mr-1 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-gray-600">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Enhanced Priority bar component
interface PriorityBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

function PriorityBar({ label, value, total, color }: PriorityBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <div className="text-sm text-gray-700">{label}</div>
        <div className="text-xs text-gray-500">
          <span className="font-medium text-gray-700">{value}</span>/{total} cases
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className={`${color} h-2 rounded-full relative group transition-all duration-300`} style={{ width: `${percentage}%` }}>
          <span className="absolute -top-6 right-0 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white px-1 py-0.5 rounded">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    </div>
  );
}

// Enhanced Receiver item component
interface ReceiverItemProps {
  receiver: ReceiverCase;
}

function ReceiverItem({ receiver }: ReceiverItemProps) {
  return (
    <div className="py-3 px-2 flex items-center justify-between hover:bg-gray-50 transition-colors">
      <div className="flex items-center">
        <div className="bg-blue-100 p-2 rounded-full mr-3">
          <User size={16} className="text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-800">{receiver.name}</p>
          <p className="text-xs text-gray-500">
            {receiver.totalCases} total cases • {receiver.highPriority} high priority
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex flex-wrap justify-end gap-1 max-w-[120px]">
          {receiver.categories.map((category, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {category}
            </span>
          ))}
        </div>
        <ChevronRight size={16} className="ml-2 text-gray-400" />
      </div>
    </div>
  );
}

// Enhanced Document card component
interface DocumentCardProps {
  title: string;
  count: number;
  color: string;
  iconColor?: string;
}

function DocumentCard({ title, count, color, iconColor = "text-gray-600" }: DocumentCardProps) {
  return (
    <div className={`${color} p-4 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-700 text-sm font-medium">{title}</p>
          <p className="text-2xl text-gray-800 font-bold">{count}</p>
        </div>
        <FileText size={24} className={iconColor} />
      </div>
    </div>
  );
}