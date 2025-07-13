'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Download, Printer, Filter, Settings, X, Trash2, CheckSquare, Square, Search, RefreshCw, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useRouter, usePathname } from 'next/navigation';
import { requireAuth, storeLastVisitedUrl, getLastVisitedUrl } from "../utils/auth";
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Comment {
  message: string;
  createdAt?: Date;
  user?: {
    id: string;
    email: string;
    role: string;
    department: string;
    location: string;
  };
}

interface Task {
  _id: string;
  sno: string;
  sender: string;
  subject: string;
  location: string;
  receiver: string;
  site: string;
  periodFrom: Date;
  periodTo: Date;
  receiptDate: Date;
  dueDate: Date;
  overDueDate: Date;
  priority: string;
  description: string;
  demands: string;
  overallStatus: string;
  assignedDept: string;
  assignee: Array<string | { email: string }>;
  remarks: string;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;

  // Extended fields from schema
  expertOpinion?: string;
  expertOpinionDate?: Date;
  internalComments?: string;
  ceoComments?: string;
  ceoCommentsDate?: Date;
  finalDecision?: string;
  finalDecisionDate?: Date;
  pvReport?: string;
  officialAmount?: number;
  penaltiesAmount?: number;
  motivationAmount?: number;
  totalAmount?: number;
  ceoApprovalStatus?: string;
  ceoApprovalDate?: Date;

  // NDP fields
  ndpNo?: string;
  ndpReceivedDate?: Date;
  ndpAmount?: number;
  ndpPaymentDueDate?: Date;
  ndpPaymentDate?: Date;
  ndpPaymentStatus?: string;

  // DN fields
  dnNo?: string;
  dnReceivedAmount?: number;
  dnAmount?: number;
  dnPaymentDueDate?: Date;
  dnPaymentDate?: Date;
  dnPaymentStatus?: string;

  // AMR fields
  amrANo?: string;
  amrAReceivedDate?: Date;
  amrAAmount?: number;
  amrAPaymentDueDate?: Date;
  amrAPaymentDate?: Date;
  amrAPaymentStatus?: string;
  amrBNo?: string;
  amrBReceivedDate?: Date;
  amrBAmount?: number;
  amrBPaymentDueDate?: Date;
  amrBPaymentDate?: Date;
  amrBPaymentStatus?: string;

  // Claims fields
  claims?: {
    claimDetails: string;
    claimSentDate: Date;
    claimReplyReceivedDate: Date;
    claimStatus: string;
  }[];

  // Litigation fields
  litigationCase?: {
    litigationCaseDetails: string;
    litigationCaseStartDate: Date;
    litigationCaseAmount: number;
    litigationCasePaymentDate: Date;
    litigationMotivationAmount: number;
    litigationCaseClosedDate: Date;
    litigationCaseStatus: string;
  };

  // Refund request fields
  refundRequest?: {
    refundRequestDate: Date;
    refundApprovalReceivedDate: Date;
    refundApprovalAmount: number;
    lastReminderDate: Date;
  };

  // Court case fields
  courtCase?: {
    caseDetails: string;
    finalJudgementDetails: string;
    judgementDate: Date;
    lawyerFee: number;
    courtLegalExpenses: number;
    motivationAmount: number;
    totalLegalFees: number;
    courtCaseStatus: string;
  };

  lawyerOpinion?: string;
  __v: number;
}

const TaskReport: React.FC = () => {
  const [rowData, setRowData] = useState<Task[]>([]);
  const [allData, setAllData] = useState<Task[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'sno', 'sender', 'subject', 'location', 'receiver', 'site', 'periodFrom', 'periodTo', 'receiptDate', 'dueDate',
    'overDueDate', 'priority', 'description', 'demands', 'overallStatus', 'assignedDept', 'assignee', 'remarks',
    'comments', 'newComment', 'opinionAndComments', 'expertOpinion', 'expertOpinionDate', 'internalComments',
    'internalCommentsDate', 'ceoComments', 'ceoCommentsDate', 'finalDecision', 'officialReplyDate', 'discussionDetails',
    'finalDecisionDate', 'pvReport', 'officialAmount', 'penaltiesAmount', 'motivationAmount', 'totalAmount',
    'ceoApprovalStatus', 'ceoApprovalDate', 'invoiceDetails', 'finalSettlement', 'ndpNo', 'ndpReceivedDate',
    'ndpAmount', 'ndpPaymentDueDate', 'ndpPaymentDate', 'ndpPaymentStatus', 'dnNo', 'dnReceivedAmount', 'dnAmount',
    'dnPaymentDueDate', 'dnPaymentDate', 'dnPaymentStatus', 'amrANo', 'amrAReceivedDate', 'amrAAmount',
    'amrAPaymentDueDate', 'amrAPaymentDate', 'amrAPaymentStatus', 'amrBNo', 'amrBReceivedDate', 'amrBAmount',
    'amrBPaymentDueDate', 'amrBPaymentDate', 'amrBPaymentStatus', 'claimsNotes', 'litigationCaseDetails',
    'litigationCaseStartDate', 'litigationCaseAmount', 'litigationCaseAmountPaymentDate', 'litigationMotivationAmount',
    'litigationCaseClosedDate', 'litigationCaseStatus', 'refundRequestDate', 'refundApprovalReceivedDate',
    'refundApprovalAmount', 'lastReminderDate', 'lawyersOpinion', 'courtCaseDetails', 'finalJudgementDetails',
    'judgementDate', 'lawyersFee', 'courtLegalExpenses', 'totalLegalFees', 'courtCaseStatus'
  ]);
  const [showColumnSelector, setShowColumnSelector] = useState<boolean>(false);

  // Filter state
  interface Filters {
    priority: string[];
    status: string[];
    department: string[];
    dueDateFrom: string;
    dueDateTo: string;
    searchTerm: string;
  }

  const [filters, setFilters] = useState<Filters>({
    priority: [],
    status: [],
    department: [],
    dueDateFrom: '',
    dueDateTo: '',
    searchTerm: ''
  });

  // Function to format dates in the grid
  const formatDate = (date: Date | undefined | string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };
const handleDeleteTask = useCallback(async (id: string) => {
  if (!window.confirm(`Are you sure you want to delete task ${id}?`)) {
    return;
  }

  setIsDeleting(true);

  try {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    setRowData(prev => prev.filter(task => task._id !== id));
    setAllData(prev => prev.filter(task => task._id !== id));

    // Navigate with full reload
    window.location.href = '/task-report';
  } catch (e: any) {
    setError(e.message);
    alert(`Error deleting task: ${e.message}`);
  } finally {
    setIsDeleting(false);
  }
}, []);

  const ActionCellRenderer = useCallback((params: ICellRendererParams<Task>) => {
    const taskId = params.data?._id;
    if (!taskId) return null;

    return (
      <div className="flex items-center justify-center h-full">
        <button
          onClick={() => handleDeleteTask(taskId)}
          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
          title="Delete Task"
        >
          <Trash2 size={18} />
        </button>
      </div>
    );
  }, [handleDeleteTask]);
  const formatAmount = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(amount);
  };

  // Comprehensive column definitions
  const allColumnDefs = useMemo<ColDef<Task>[]>(() => [
    // Basic Task Information
    {
      headerName: 'S.No',
      field: 'sno',
      filter: 'agTextColumnFilter',
      sortable: true,
      width: 100,
      pinned: 'left',
    },
    {
      headerName: 'Sender',
      field: 'sender',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Subject',
      field: 'subject',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Location',
      field: 'location',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Receiver',
      field: 'receiver',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Site',
      field: 'site',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Period From',
      field: 'periodFrom',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'Period To',
      field: 'periodTo',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'Receipt Date',
      field: 'receiptDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'Due Date',
      field: 'dueDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'Overdue Date',
      field: 'overDueDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'Priority',
      field: 'priority',
      filter: 'agTextColumnFilter',
      sortable: true,
      width: 100,
      cellStyle: (params) => {
        if (params.value === 'High') {
          return { color: 'white', backgroundColor: '#e53e3e', fontWeight: 'bold', borderRadius: '4px', padding: '2px 8px' };
        }
        if (params.value === 'Medium') {
          return { color: 'white', backgroundColor: '#ed8936', fontWeight: 'normal', borderRadius: '4px', padding: '2px 8px' };
        }
        return { color: 'white', backgroundColor: '#38a169', fontWeight: 'normal', borderRadius: '4px', padding: '2px 8px' };
      },
      cellRenderer: (params: ICellRendererParams) => {
        return <div className="text-center">₹{params.value}</div>;
      }
    },
    {
      headerName: 'Description',
      field: 'description',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Demands',
      field: 'demands',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Status',
      field: 'overallStatus',
      filter: 'agTextColumnFilter',
      sortable: true,
      cellStyle: (params) => {
        switch (params.value) {
          case 'Completed':
            return { color: 'white', backgroundColor: '#38a169', borderRadius: '4px', padding: '2px 8px' };
          case 'In Progress':
            return { color: 'white', backgroundColor: '#3182ce', borderRadius: '4px', padding: '2px 8px' };
          case 'Pending':
            return { color: 'white', backgroundColor: '#ed8936', borderRadius: '4px', padding: '2px 8px' };
          default:
            return { color: 'white', backgroundColor: '#718096', borderRadius: '4px', padding: '2px 8px' };
        }
      },
      cellRenderer: (params: { value: string }) => {
        return <div className="text-center">{params.value}</div>;
      }
    },
    {
      headerName: 'Department',
      field: 'assignedDept' as keyof Task,
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Assignee',
      field: 'assignee' as keyof Task,
      filter: 'agTextColumnFilter',
      sortable: true,
      valueGetter: (params) => {
        // If assignee is an array, map over it to get emails or string values
        const assigneeArray = params.data?.assignee;
        if (Array.isArray(assigneeArray)) {
          const values = assigneeArray.map((assignee) =>
            typeof assignee === 'string' ? assignee : assignee.email
          );
          return values.join(', '); // Return as comma-separated string
        }
        return '';
      }
    },
    {
      headerName: 'Remarks',
      field: 'remarks' as keyof Task,
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Created',
      field: 'createdAt' as keyof Task,
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params: { value: Date }) => formatDate(params.value),
    },
    {
      headerName: 'Updated',
      field: 'updatedAt' as keyof Task,
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params: { value: Date }) => formatDate(params.value),
    },
    // Expert Opinion Section
    {
      headerName: 'Expert Opinion',
      field: 'expertOpinion',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Expert Opinion Date',
      field: 'expertOpinionDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'Internal Comments',
      field: 'internalComments',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'CEO Comments',
      field: 'ceoComments',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'CEO Comments Date',
      field: 'ceoCommentsDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'Final Decision',
      field: 'finalDecision',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Final Decision Date',
      field: 'finalDecisionDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },

    // Financial Information
    {
      headerName: 'Official Amount',
      field: 'officialAmount',
      filter: 'agNumberColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatAmount(params.value),
    },
    {
      headerName: 'Penalties Amount',
      field: 'penaltiesAmount',
      filter: 'agNumberColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatAmount(params.value),
    },
    {
      headerName: 'Motivation Amount',
      field: 'motivationAmount',
      filter: 'agNumberColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatAmount(params.value),
    },
    {
      headerName: 'Total Amount',
      field: 'totalAmount',
      filter: 'agNumberColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatAmount(params.value),
    },
    {
      headerName: 'CEO Approval Status',
      field: 'ceoApprovalStatus',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'CEO Approval Date',
      field: 'ceoApprovalDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },

    // NDP Information
    {
      headerName: 'NDP Number',
      field: 'ndpNo',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'NDP Received Date',
      field: 'ndpReceivedDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'NDP Amount',
      field: 'ndpAmount',
      filter: 'agNumberColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatAmount(params.value),
    },
    {
      headerName: 'NDP Payment Due',
      field: 'ndpPaymentDueDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'NDP Payment Date',
      field: 'ndpPaymentDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'NDP Payment Status',
      field: 'ndpPaymentStatus',
      filter: 'agTextColumnFilter',
      sortable: true,
    },

    // DN Information
    {
      headerName: 'DN Number',
      field: 'dnNo',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'DN Received Amount',
      field: 'dnReceivedAmount',
      filter: 'agNumberColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatAmount(params.value),
    },
    {
      headerName: 'DN Amount',
      field: 'dnAmount',
      filter: 'agNumberColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatAmount(params.value),
    },
    {
      headerName: 'DN Payment Due',
      field: 'dnPaymentDueDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'DN Payment Date',
      field: 'dnPaymentDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'DN Payment Status',
      field: 'dnPaymentStatus',
      filter: 'agTextColumnFilter',
      sortable: true,
    },

    // AMR A Information
    {
      headerName: 'AMR A Number',
      field: 'amrANo',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'AMR A Received Date',
      field: 'amrAReceivedDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'AMR A Amount',
      field: 'amrAAmount',
      filter: 'agNumberColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatAmount(params.value),
    },
    {
      headerName: 'AMR A Payment Due',
      field: 'amrAPaymentDueDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'AMR A Payment Date',
      field: 'amrAPaymentDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'AMR A Payment Status',
      field: 'amrAPaymentStatus',
      filter: 'agTextColumnFilter',
      sortable: true,
    },

    // AMR B Information
    {
      headerName: 'AMR B Number',
      field: 'amrBNo',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'AMR B Received Date',
      field: 'amrBReceivedDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'AMR B Amount',
      field: 'amrBAmount',
      filter: 'agNumberColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatAmount(params.value),
    },
    {
      headerName: 'AMR B Payment Due',
      field: 'amrBPaymentDueDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'AMR B Payment Date',
      field: 'amrBPaymentDate',
      filter: 'agDateColumnFilter',
      sortable: true,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      headerName: 'AMR B Payment Status',
      field: 'amrBPaymentStatus',
      filter: 'agTextColumnFilter',
      sortable: true,
    },

    // Lawyer Opinion
    {
      headerName: 'Lawyer Opinion',
      field: 'lawyerOpinion',
      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Actions',
      field: '_id',
      cellRenderer: ActionCellRenderer,
      minWidth: 90,
      maxWidth: 120,
      filter: false,
      sortable: false,
      resizable: false,
      pinned: 'right',
    },
  ], []);

  // Get visible column definitions
  const columnDefs = useMemo(() => {
    return allColumnDefs.filter(col => visibleColumns.includes(col.field as string) || col.field === '_id');
  }, [allColumnDefs, visibleColumns]);

  // Default column properties
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 120,
    resizable: true,
    filter: true,
    sortable: true,
  }), []);

  // Calculate unique values for filter options
  const priorityOptions = useMemo(() => {
    const priorities = [...new Set(allData.map(task => task.priority))];
    return priorities.filter(Boolean);
  }, [allData]);

  const statusOptions = useMemo(() => {
    const statuses = [...new Set(allData.map(task => task.overallStatus))];
    return statuses.filter(Boolean);
  }, [allData]);

  const departmentOptions = useMemo(() => {
    const departments = [...new Set(allData.map(task => task.assignedDept))];
    return departments.filter(Boolean);
  }, [allData]);

  useEffect(() => {
    requireAuth();
  }, []);

  // Fetch task data
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch tasks');
        }

        setAllData(data);
        setRowData(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Grid API reference
  const [gridApi, setGridApi] = useState<any>(null);
  const [gridColumnApi, setGridColumnApi] = useState<any>(null);

  // On Grid Ready - store API references
  const onGridReady = (params: any) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);
    params.api.sizeColumnsToFit();
  };

  // Export functions
  const handleExportCSV = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `Task_Report_${new Date().toISOString().split('T')[0]}.csv`,
      });
    }
  }, [gridApi]);

  const handleExportExcel = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsExcel({
        fileName: `Task_Report_${new Date().toISOString().split('T')[0]}.xlsx`,
      });
    }
  }, [gridApi]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Toggle filter panel
  const toggleFilterPanel = useCallback(() => {
    setShowFilterPanel(prev => !prev);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const handleToggleFilter = useCallback((filterType: keyof Pick<Filters, 'priority' | 'status' | 'department'>, value: string) => {
    setFilters(prev => {
      const currentFilters = [...prev[filterType]];
      const valueIndex = currentFilters.indexOf(value);

      if (valueIndex === -1) {
        currentFilters.push(value);
      } else {
        currentFilters.splice(valueIndex, 1);
      }

      return {
        ...prev,
        [filterType]: currentFilters
      };
    });
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    const filtered = allData.filter(task => {
      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(task.overallStatus)) {
        return false;
      }

      // Department filter
      if (filters.department.length > 0 && !filters.department.includes(task.assignedDept)) {
        return false;
      }

      // Due date range filter
      if (filters.dueDateFrom && filters.dueDateTo) {
        const dueDate = new Date(task.dueDate);
        const fromDate = new Date(filters.dueDateFrom);
        const toDate = new Date(filters.dueDateTo);

        if (dueDate < fromDate || dueDate > toDate) {
          return false;
        }
      }

      // Search term filter (across multiple fields)
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const searchFields = [
          task.sno,
          task.sender,
          task.subject,
          task.receiver,
          task.assignee,
          task.assignedDept,
          task.description,
          task.demands,
        ];

        // Check if any field contains the search term
        const matchesSearch = searchFields.some(field => {
          if (!field) return false;
          if (Array.isArray(field)) {
            return field.some(item =>
              typeof item === 'string'
                ? item.toLowerCase().includes(searchTerm)
                : item.email.toLowerCase().includes(searchTerm)
            );
          }
          return field.toString().toLowerCase().includes(searchTerm);
        });

        if (!matchesSearch) {
          return false;
        }
      }

      // All filters passed
      return true;
    });

    setRowData(filtered);
    setIsFiltered(true);
    setShowFilterPanel(false);
  }, [allData, filters]);

  const resetFilters = useCallback(() => {
    setFilters({
      priority: [],
      status: [],
      department: [],
      dueDateFrom: '',
      dueDateTo: '',
      searchTerm: ''
    });
    setRowData(allData);
    setIsFiltered(false);
  }, [allData]);

  // Toggle column selector
  const toggleColumnSelector = useCallback(() => {
    setShowColumnSelector(prev => !prev);
  }, []);

  // Handle column visibility toggle
  const handleColumnToggle = useCallback((field: string) => {
    setVisibleColumns(prev => {
      const isVisible = prev.includes(field);
      if (isVisible) {
        return prev.filter(col => col !== field);
      } else {
        return [...prev, field];
      }
    });
  }, []);

  // URL navigation handling
  const router = useRouter();
  const pathname = usePathname();

  // Function to handle row click for navigating to detail view
  const handleRowClick = useCallback((event: any) => {
    if (isDeleting) {
    return; // Prevent navigation if deletion is in progress
  }
    const taskId = event.data._id;
    router.push(`/tasks/${taskId}`);
  }, [router]);

  // Refresh data
  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch tasks');
      }

      setAllData(data);
      setRowData(data);
      setIsFiltered(false);
      setFilters({
        priority: [],
        status: [],
        department: [],
        dueDateFrom: '',
        dueDateTo: '',
        searchTerm: ''
      });
      setLoading(false);
    } catch (err: any) {
      console.error('Error refreshing tasks:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6 pl-0 md:pl-60">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">ß
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Task Report</h1>
            <div className="flex space-x-2">
              <button
                onClick={refreshData}
                className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </button>
              <button
                onClick={toggleFilterPanel}
                className={`flex items-center px-3 py-2 ${isFiltered ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'} rounded hover:bg-blue-700 hover:text-white`}
              >
                <Filter size={16} className="mr-2 text-black" />
                Filters {isFiltered && `(${rowData.length}/${allData.length})`}
              </button>
              <button
                onClick={toggleColumnSelector}
                className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                <Settings size={16} className="mr-2" />
                Columns
              </button>
              <div className="flex space-x-1">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100"
                  title="Export as CSV"
                >
                  <Download size={16} className="mr-2" />
                  CSV
                </button>
                <button
                  onClick={handleExportExcel}
                  className="flex items-center px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100"
                  title="Export as Excel"
                >
                  <Download size={16} className="mr-2" />
                  Excel
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center px-3 py-2 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                  title="Print"
                >
                  <Printer size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center mb-4 relative">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={18} />
              <input
                type="text"
                placeholder="Search tasks by any field..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
          </div>
          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="bg-gray-50 p-4 mb-4 rounded-lg border border-gray-200 text-black">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Filters</h3>
                <button onClick={toggleFilterPanel} className="text-black hover:text-gray-700">
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <div className="space-y-1">
                    {priorityOptions.map((priority) => (
                      <div key={priority} className="flex items-center">
                        <button
                          type="button"
                          className="flex items-center"
                          onClick={() => handleToggleFilter('priority', priority)}
                        >
                          {filters.priority.includes(priority) ? (
                            <CheckSquare size={18} className="text-blue-600 mr-2" />
                          ) : (
                            <Square size={18} className="text-gray-400 mr-2" />
                          )}
                          <span>{priority}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="space-y-1">
                    {statusOptions.map((status) => (
                      <div key={status} className="flex items-center">
                        <button
                          type="button"
                          className="flex items-center"
                          onClick={() => handleToggleFilter('status', status)}
                        >
                          {filters.status.includes(status) ? (
                            <CheckSquare size={18} className="text-blue-600 mr-2" />
                          ) : (
                            <Square size={18} className="text-gray-400 mr-2" />
                          )}
                          <span>{status}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <div className="space-y-1">
                    {departmentOptions.map((dept) => (
                      <div key={dept} className="flex items-center">
                        <button
                          type="button"
                          className="flex items-center"
                          onClick={() => handleToggleFilter('department', dept)}
                        >
                          {filters.department.includes(dept) ? (
                            <CheckSquare size={18} className="text-blue-600 mr-2" />
                          ) : (
                            <Square size={18} className="text-gray-400 mr-2" />
                          )}
                          <span>{dept}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Due Date Range Filter */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date Range</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Calendar size={18} className="text-gray-400 mr-2" />
                      <input
                        type="date"
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.dueDateFrom}
                        onChange={(e) => handleFilterChange('dueDateFrom', e.target.value)}
                      />
                    </div>
                    <span className="text-gray-500">to</span>
                    <div className="flex items-center">
                      <Calendar size={18} className="text-gray-400 mr-2" />
                      <input
                        type="date"
                        className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filters.dueDateTo}
                        onChange={(e) => handleFilterChange('dueDateTo', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Column Selector */}
          {showColumnSelector && (
            <div className="bg-gray-50 p-4 mb-4 rounded-lg border border-gray-200 text-black">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Column Visibility</h3>
                <button onClick={toggleColumnSelector} className="text-black hover:text-gray-700">
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {allColumnDefs.filter(col => col.field !== '_id').map((col) => (
                  <div key={col.field} className="flex items-center">
                    <button
                      type="button"
                      className="flex items-center"
                      onClick={() => handleColumnToggle(col.field as string)}
                    >
                      {visibleColumns.includes(col.field as string) ? (
                        <CheckSquare size={18} className="text-blue-600 mr-2" />
                      ) : (
                        <Square size={18} className="text-gray-400 mr-2" />
                      )}
                      <span>{col.headerName}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Summary */}
          {isFiltered && (
            <div className="flex items-center mb-4 text-sm text-black">
              <span>Showing {rowData.length} of {allData.length} tasks</span>
              {isFiltered && (
                <button
                  onClick={resetFilters}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            /* AG Grid Component */
<div className="ag-theme-alpine" style={{ height: 'calc(100vh - 300px)', width: '100%' }}>
              <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                animateRows={true}
                rowSelection="single"
                onRowClicked={handleRowClick}
                pagination={true}
                paginationPageSize={20}
                suppressRowClickSelection={false}
                suppressHorizontalScroll={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskReport;

