"use client"
import React, { useState } from 'react';
import Link from "next/link";
import { Pie, PieChart, Cell, ResponsiveContainer, Label, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import {
  ChevronDown,
  User,
  FileText,
  Bell,
  ChevronRight,
  Menu,
  X,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  Download,
  Eye,
  Plus,
} from "lucide-react";
import useSWR from "swr";
import { fetchDashboardData } from "../../lib/api";
// Remove Navbar import
import Navbar from '../components/Navbar';

// Types
interface DashboardData {
  totalTasks: number;
  highPriority: number;
  pendingCases: number;
  overdueCases: number;
  closedCases: number;
  departmentTasks: Array<{ _id: string; count: number }>;
  taskDetails: Array<{ _id: string; count: number }>;
  receiverDetails: Array<{ _id: string; count: number }>;
  courtCaseStatus: Array<{ _id: string; count: number }>;
  claimsStatus: Array<{ _id: string; count: number }>;
  litigationCaseStatus: Array<{ _id: string; count: number }>;
  documentStatus?: Array<{ _id: string; count: number }>;
  dnStatus?: Array<{ _id: string; count: number }>;
  ndpStatus?: Array<{ _id: string; count: number }>;
  amrStatus?: Array<{ _id: string; count: number }>;
}

type DocumentCardProps = {
  title: string;
  count: number;
  gradient: string;
  icon: React.ReactNode;
};

type SummaryCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  gradient: string;
  trend: "up" | "down" | "same";
  change: string;
};

type CardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  hasDropdown?: boolean;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  span?: string;
};

type EnhancedDonutChartProps = {
  data: Array<{ value: number; color: string; name: string }>;
};

type ReceiverCardProps = {
  receiver: {
    name: string;
    totalCases: number;
    highPriority: number;
    categories: string[];
  };
};

export default function Dashboard() {
  const [activeFilter, setActiveFilter] = useState("This Week");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch real-time backend data
  const { data: dashboardData, error, isLoading } = useSWR<DashboardData>("/api/dashboard", fetchDashboardData);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error || !dashboardData) return <div className="p-8 text-center text-red-500">Error loading dashboard data.</div>;

  // Map API data to component data
  const statusData = dashboardData.courtCaseStatus.map((item) => {
    const colorMap: Record<string, string> = {
      Pending: "#F59E0B",
      Ongoing: "#3B82F6",
      Closed: "#10B981"
    };

    return {
      value: item.count,
      color: colorMap[item._id] || "#9E9E9E",
      name: item._id
    };
  });

  const priorityData = dashboardData.taskDetails.map((task) => ({
    value: task.count,
    color: task._id === "High" ? "#EF4444" : task._id === "Medium" ? "#F59E0B" : "#10B981",
    name: task._id,
  }));

  const deptColorMap: Record<string, string> = {
    Legal: "#3B82F6",
    Taxation: "#10B981",
    Mining: "#EF4444",
    HR: "#F59E0B",
    Compliance: "#8B5CF6",
  };

  const deptData = dashboardData.departmentTasks.map((dept) => ({
    value: dept.count,
    color: deptColorMap[dept._id] || "#9CA3AF",
    name: dept._id,
  }));

  const claimsData = dashboardData.claimsStatus.map((claim) => ({
    value: claim.count,
    color: claim._id === "Accepted" ? "#10B981" : claim._id === "Rejected" ? "#EF4444" : "#F59E0B",
    name: claim._id,
  }));

  const receivers = dashboardData.receiverDetails.map((receiver) => ({
    name: receiver._id,
    totalCases: receiver.count,
    highPriority: Math.floor(receiver.count * 0.3),
    categories: ['Legal', 'Taxation'],
  }));

  // Calculate trendData from real data (example: use departmentTasks as monthly trend)
  // You may want to replace this with a real time series if your backend provides it
  const trendData = dashboardData.departmentTasks.map((dept, idx) => ({
    month: dept._id || `Dept ${idx + 1}`,
    cases: dept.count,
    completed: Math.floor(dept.count * 0.7), // Example: 70% completed
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-52 fixed h-full z-50">
        <Navbar />
      </div>
      <div className="container mx-auto px-4 py-6 pl-0 md:pl-60">
        {/* Enhanced Header */}
        <header className="mt-10 sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">Welcome back, here's what's happening</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search cases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 bg-gray-100 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>
                <div className="relative">
                <Link href="/notifications">
                  <Bell size={20} className="text-gray-600 cursor-pointer hover:text-blue-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </Link>
              </div>
                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <User size={20} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-8">
          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <SummaryCard
              icon={<Activity className="w-6 h-6" />}
              label="Total Tasks"
              value={dashboardData.totalTasks}
              gradient="from-blue-500 to-blue-600"
              trend="up"
              change="+12%"
            />
            <SummaryCard
              icon={<AlertTriangle className="w-6 h-6" />}
              label="High Priority"
              value={dashboardData.highPriority}
              gradient="from-red-500 to-red-600"
              trend="up"
              change="+8%"
            />
            <SummaryCard
              icon={<Clock className="w-6 h-6" />}
              label="Pending Cases"
              value={dashboardData.pendingCases}
              gradient="from-amber-500 to-amber-600"
              trend="same"
              change="0%"
            />
            <SummaryCard
              icon={<TrendingDown className="w-6 h-6" />}
              label="Overdue Cases"
              value={dashboardData.overdueCases}
              gradient="from-orange-500 to-orange-600"
              trend="down"
              change="-5%"
            />
            <SummaryCard
              icon={<CheckCircle className="w-6 h-6" />}
              label="Closed Cases"
              value={dashboardData.closedCases}
              gradient="from-green-500 to-green-600"
              trend="up"
              change="+15%"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Cases Trend Chart */}
            <Card title="Cases Trend" span="xl:col-span-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cases"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 0, r: 6 }}
                      activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 0, r: 6 }}
                      activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Priority Distribution */}
            <Card title="Cases by Priority" hasDropdown activeFilter={activeFilter} onFilterChange={setActiveFilter}>
              <div className="h-80">
                <EnhancedDonutChart data={priorityData} />
              </div>
            </Card>

            {/* Court Case Status */}
            <Card title="Court Case Status" hasDropdown activeFilter={activeFilter} onFilterChange={setActiveFilter}>
              <div className="h-80">
                <EnhancedDonutChart data={statusData} />
              </div>
            </Card>

            {/* Department Assignment */}
            <Card title="Department Assignment">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {deptData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Claims Status */}
            <Card title="Claims Status" hasDropdown activeFilter={activeFilter} onFilterChange={setActiveFilter}>
              <div className="h-80">
                <EnhancedDonutChart data={claimsData} />
              </div>
            </Card>
          </div>

          {/* Enhanced Receiver Details */}
          <Card title="Team Performance" subtitle="Individual case load and priority distribution">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {receivers.map((receiver, index) => (
                <ReceiverCard key={index} receiver={receiver} />
              ))}
            </div>
          </Card>

          {/* Documents Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DocumentCard
              title="NDP Documents"
              count={156}
              gradient="from-blue-500 to-blue-600"
              icon={<FileText className="w-6 h-6" />}
            />
            <DocumentCard
              title="DN Documents"
              count={89}
              gradient="from-purple-500 to-purple-600"
              icon={<FileText className="w-6 h-6" />}
            />
            <DocumentCard
              title="AMR Documents"
              count={234}
              gradient="from-pink-500 to-pink-600"
              icon={<FileText className="w-6 h-6" />}
            />
            <DocumentCard
              title="Overdue Documents"
              count={23}
              gradient="from-red-500 to-red-600"
              icon={<AlertTriangle className="w-6 h-6" />}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

// Enhanced Summary Card Component
function SummaryCard({ icon, label, value, gradient, trend, change }: SummaryCardProps) {
  const trendIcons = {
    up: <TrendingUp size={16} />,
    down: <TrendingDown size={16} />,
    same: <Minus size={16} />,
  };

  const trendColors = {
    up: "text-green-600 bg-green-50",
    down: "text-red-600 bg-red-50",
    same: "text-gray-600 bg-gray-50",
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${trendColors[trend]}`}>
          {trendIcons[trend]}
          <span>{change}</span>
        </div>
      </div>

      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

// Enhanced Card Component
function Card({ title, subtitle, children, hasDropdown = false, activeFilter, onFilterChange, span = "" }: CardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const filters = ["Today", "This Week", "This Month", "This Year"];

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 ${span}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>

        <div className="flex items-center space-x-2">
          {hasDropdown && (
            <div className="relative">
              <button
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{activeFilter}</span>
                <ChevronDown size={16} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-200/50 z-20 overflow-hidden">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      className={`block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${activeFilter === filter ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
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

          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <MoreVertical size={16} className="text-gray-400" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

// Enhanced Donut Chart
function EnhancedDonutChart({ data }: EnhancedDonutChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-500">No data available</div>;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-full flex items-center justify-center">
      <div className="relative">
        <ResponsiveContainer width={280} height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              dataKey="value"
              startAngle={90}
              endAngle={450}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <Label
                content={(props) => {
                  if (!props.viewBox || typeof (props.viewBox as any).cx !== 'number' || typeof (props.viewBox as any).cy !== 'number') return null;
                  const { cx, cy } = props.viewBox as { cx: number; cy: number };
                  return (
                    <g>
                      <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="central" className="text-2xl font-bold" fill="#111827">
                        {total.toLocaleString()}
                      </text>
                      <text x={cx} y={cy + 15} textAnchor="middle" dominantBaseline="central" className="text-sm" fill="#6b7280">
                        Total Cases
                      </text>
                    </g>
                  );
                }}
                position="center"
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute -bottom-6 left-0 right-0 flex flex-wrap justify-center gap-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-gray-600 font-medium">{item.name}</span>
              <span className="text-xs text-gray-400">({item.value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Enhanced Receiver Card
function ReceiverCard({ receiver }: ReceiverCardProps) {
  const completionRate = Math.round((receiver.totalCases / (receiver.totalCases + receiver.highPriority)) * 100);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-lg transition-all duration-300 border border-gray-200/50">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
          <User size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{receiver.name}</h3>
          <p className="text-xs text-gray-500">Case Handler</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Cases</span>
          <span className="font-bold text-gray-900">{receiver.totalCases}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">High Priority</span>
          <span className="font-bold text-red-600">{receiver.highPriority}</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 text-center">{completionRate}% completion rate</p>
      </div>
    </div>
  );
}

// Enhanced Document Card
function DocumentCard({ title, count, gradient, icon }: DocumentCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
          <Eye size={16} className="text-gray-400" />
        </button>
      </div>

      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{count.toLocaleString()}</p>
      </div>
    </div>
  );
}
