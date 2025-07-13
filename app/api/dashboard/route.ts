import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Task from '../../../models/Task';
import { parse } from 'cookie';

// GET /api/dashboard
export async function GET(req: NextRequest) {
  await dbConnect();

  const now = new Date().toISOString();

  // Retrieve user data from cookies
  const cookies = req.headers.get('cookie');
  let userData;

  if (cookies) {
    const parsedCookies = parse(cookies);
    const userDataString = parsedCookies.user_data;

    if (userDataString) {
      try {
        userData = JSON.parse(userDataString);
      } catch (err) {
        return NextResponse.json({ error: 'Invalid user data in cookie' }, { status: 400 });
      }
    }
  }

  if (!userData) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, role, department } = userData;

  let matchStage = {};

  if (role === 'user') {
    matchStage = {
      $or: [
        { assignee: id },
        { assignedDept: department }
      ]
    };
  }

  const [totals] = await Task.aggregate([
    { $match: matchStage },
    {
      $facet: {
        totalTasks: [{ $count: 'count' }],
        highPriority: [{ $match: { priority: 'High' } }, { $count: 'count' }],
        pendingCases: [{ $match: { overallStatus: 'Pending' } }, { $count: 'count' }],
        overdueCases: [{ $match: { dueDate: { $lt: now }, overallStatus: { $ne: 'Closed' } } }, { $count: 'count' }],
        closedCases: [{ $match: { overallStatus: 'Closed' } }, { $count: 'count' }],
        departmentTasks: [{ $group: { _id: '$assignedDept', count: { $sum: 1 } } }],
        taskDetails: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
        receiverDetails: [{ $group: { _id: '$receiver', count: { $sum: 1 } } }],
        courtCaseStatus: [
          { $group: { _id: '$courtCaseStatus', count: { $sum: 1 } } }
        ],        
        litigationCaseStatus: [
          { $match: { category: 'Litigation' } },
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ],
        claimsStatus: [
          { $match: { category: 'Claims' } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        documentStatus: [
          { $group: { _id: '$documentType', count: { $sum: 1 } } }
        ],
        ndpStatus: [
          { $group: { _id: '$ndpNo', count: { $sum: 1 } } }
        ],
        dnStatus: [
          { $group: { _id: '$dnNo', count: { $sum: 1 } } }
        ],
        amrStatus: [
          { $group: { _id: '$amrANo', count: { $sum: 1 } } }
        ]
      }
    },
    {
      $project: {
        totalTasks: { $ifNull: [{ $arrayElemAt: ['$totalTasks.count', 0] }, 0] },
        highPriority: { $ifNull: [{ $arrayElemAt: ['$highPriority.count', 0] }, 0] },
        pendingCases: { $ifNull: [{ $arrayElemAt: ['$pendingCases.count', 0] }, 0] },
        overdueCases: { $ifNull: [{ $arrayElemAt: ['$overdueCases.count', 0] }, 0] },
        closedCases: { $ifNull: [{ $arrayElemAt: ['$closedCases.count', 0] }, 0] },
        courtCaseStatus: 1,
        departmentTasks: 1,
        taskDetails: 1,
        receiverDetails: 1,
        litigationCaseStatus: 1,
        claimsStatus: 1,
        documentStatus: 1,
        ndpStatus: 1,
        dnStatus: 1,
        amrStatus: 1
      }
    }
  ]);

  const dashboardData = {
    totalTasks: totals.totalTasks,
    highPriority: totals.highPriority,
    pendingCases: totals.pendingCases,
    overdueCases: totals.overdueCases,
    closedCases: totals.closedCases,
    departmentTasks: totals.departmentTasks || [],
    courtCaseStatus: totals.courtCaseStatus || [],
    taskDetails: totals.taskDetails || [],
    receiverDetails: totals.receiverDetails || [],
    litigationCaseStatus: totals.litigationCaseStatus || [],
    claimsStatus: totals.claimsStatus || [],
    documentStatus: totals.documentStatus || [],
    ndpStatus: totals.ndpStatus || [],
    dnStatus: totals.dnStatus || [],
    amrStatus: totals.amrStatus || []
  };

  return NextResponse.json(dashboardData);
}
