// models/Task.ts

import mongoose, { Document, Schema } from 'mongoose';
import Counter from './counter';
import { sendPushNotificationToUsers } from '../app/services/notificationService'; // Corrected relative path for clarity
import User, { IUser } from './User'; // <--- FIX 1: Import the User model and its interface

// ** Comment Interface **
export interface IComment {
  _id: mongoose.Types.ObjectId;
  message: string;
  createdAt: string;
  user: mongoose.Types.ObjectId | string;
}
export interface IFile {
  _id: mongoose.Types.ObjectId;
  fileName: string;
  publicId: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: mongoose.Types.ObjectId | string;
}


// ** Task Interface **
export interface ITask extends Document {
  sno: string;
  sender: string;
  subject: string;
  location: string;
  receiver: string;
  site: string;
  files: IFile[];
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
  assignee: mongoose.Types.ObjectId[];
  remarks: string;
  comments: IComment[];
  createdBy: mongoose.Types.ObjectId | string;
  expertOpinion: string;
  expertOpinionDate: string;
  internalComments: string;
  internalCommentsDate: string;
  ceoComments: string;
  ceoCommentsDate: string;
  finalDecision: string;
  officialReplyDate: string;
  discussionDetails: string;
  finalDecisionDate: string;
  pvReport: string;
  officialAmount: string;
  penaltiesAmount: string;
  totalAmount: string;
  ceoApprovalStatus: string;
  ceoApprovalDate: string;
  invoiceDetails: string;
  finalSettlement: string;
  ndpNo: string;
  ndpReceivedDate: string;
  ndpAmount: string;
  ndpPaymentDueDate: string;
  ndpPaymentDate: string;
  ndpPaymentStatus: string;
  dnNo: string;
  dnReceivedAmount: string;
  dnAmount: string;
  dnPaymentDueDate: string;
  dnPaymentDate: string;
  dnPaymentStatus: string;
  amrANo: string;
  amrAReceivedDate: string;
  amrAAmount: string;
  amrAPaymentDueDate: string;
  amrAPaymentDate: string;
  amrAPaymentStatus: string;
  amrBNo: string;
  amrBReceivedDate: string;
  amrBAmount: string;
  amrBPaymentDueDate: string;
  amrBPaymentDate: string;
  amrBPaymentStatus: string;
  claimsNotes: string;
  litigationCaseDetails: string;
  litigationCaseStartDate: string;
  litigationCaseAmount: string;
  litigationCaseAmountPaymentDate: string;
  litigationMotivationAmount: string;
  litigationCaseClosedDate: string;
  litigationCaseStatus: string;
  refundRequestDate: string;
  refundApprovalReceivedDate: string;
  refundApprovalAmount: string;
  lastReminderDate: string;
  lawyersOpinion: string;
  courtCaseDetails: string;
  finalJudgementDetails: string;
  judgementDate: string;
  lawyersFee: string;
  courtLegalExpenses: string;
  motivationAmount: string;
  totalLegalFees: string;
  courtCaseStatus: string;
  createdAt: Date;
  updatedAt: Date;
}
const FileSchema = new Schema<IFile>({
  fileName: { type: String, required: true },
  publicId: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// ** Comment Schema **
const CommentSchema = new Schema<IComment>({
  message: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { _id: true });

// ** Task Schema **
const TaskSchema = new Schema<ITask>({
  sno: { type: String, required: false, unique: true },
  sender: { type: String, default: '' },
  subject: { type: String, default: '' },
  location: { type: String, default: '' },
  receiver: { type: String, default: '' },
  site: { type: String, default: '' },
  periodFrom: { type: String, default: '' },
  periodTo: { type: String, default: '' },
  receiptDate: { type: String, default: '' },
  dueDate: { type: String, default: '' },
  overDueDate: { type: String, default: '' },
  priority: { type: String, default: '' },
  description: { type: String, default: '' },
  demands: { type: String, default: '' },
  overallStatus: { type: String, default: '' },
  assignedDept: { type: String, default: '' },
  assignee: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  remarks: { type: String, default: '' },
  comments: [CommentSchema],
  files: [FileSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expertOpinion: { type: String, default: '' },
  expertOpinionDate: { type: String, default: '' },
  internalComments: { type: String, default: '' },
  internalCommentsDate: { type: String, default: '' },
  ceoComments: { type: String, default: '' },
  ceoCommentsDate: { type: String, default: '' },
  finalDecision: { type: String, default: '' },
  officialReplyDate: { type: String, default: '' },
  discussionDetails: { type: String, default: '' },
  finalDecisionDate: { type: String, default: '' },
  pvReport: { type: String, default: '' },
  officialAmount: { type: String, default: '' },
  penaltiesAmount: { type: String, default: '' },
  totalAmount: { type: String, default: '' },
  ceoApprovalStatus: { type: String, default: '' },
  ceoApprovalDate: { type: String, default: '' },
  invoiceDetails: { type: String, default: '' },
  finalSettlement: { type: String, default: '' },
  ndpNo: { type: String, default: '' },
  ndpReceivedDate: { type: String, default: '' },
  ndpAmount: { type: String, default: '' },
  ndpPaymentDueDate: { type: String, default: '' },
  ndpPaymentDate: { type: String, default: '' },
  ndpPaymentStatus: { type: String, default: '' },
  dnNo: { type: String, default: '' },
  dnReceivedAmount: { type: String, default: '' },
  dnAmount: { type: String, default: '' },
  dnPaymentDueDate: { type: String, default: '' },
  dnPaymentDate: { type: String, default: '' },
  dnPaymentStatus: { type: String, default: '' },
  amrANo: { type: String, default: '' },
  amrAReceivedDate: { type: String, default: '' },
  amrAAmount: { type: String, default: '' },
  amrAPaymentDueDate: { type: String, default: '' },
  amrAPaymentDate: { type: String, default: '' },
  amrAPaymentStatus: { type: String, default: '' },
  amrBNo: { type: String, default: '' },
  amrBReceivedDate: { type: String, default: '' },
  amrBAmount: { type: String, default: '' },
  amrBPaymentDueDate: { type: String, default: '' },
  amrBPaymentDate: { type: String, default: '' },
  amrBPaymentStatus: { type: String, default: '' },
  claimsNotes: { type: String, default: '' },
  litigationCaseDetails: { type: String, default: '' },
  litigationCaseStartDate: { type: String, default: '' },
  litigationCaseAmount: { type: String, default: '' },
  litigationCaseAmountPaymentDate: { type: String, default: '' },
  litigationMotivationAmount: { type: String, default: '' },
  litigationCaseClosedDate: { type: String, default: '' },
  litigationCaseStatus: { type: String, default: '' },
  refundRequestDate: { type: String, default: '' },
  refundApprovalReceivedDate: { type: String, default: '' },
  refundApprovalAmount: { type: String, default: '' },
  lastReminderDate: { type: String, default: '' },
  lawyersOpinion: { type: String, default: '' },
  courtCaseDetails: { type: String, default: '' },
  finalJudgementDetails: { type: String, default: '' },
  judgementDate: { type: String, default: '' },
  lawyersFee: { type: String, default: '' },
  courtLegalExpenses: { type: String, default: '' },
  motivationAmount: { type: String, default: '' },
  totalLegalFees: { type: String, default: '' },
  courtCaseStatus: { type: String, default: '' }
}, { timestamps: true });

// ** Pre-save Hook to Auto-Increment Task Serial Number (sno) **
TaskSchema.pre<ITask>('save', async function (next) {
  if (!this.sno) {
    const counter = await Counter.findOneAndUpdate(
      { modelName: 'Task' },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
    this.sno = counter.count.toString();
  }
  next();
});
TaskSchema.post<ITask>('save', async function (doc) {
  try {
    const taskDoc = doc as ITask;

    // Fetch the user who created the task
    const createdByUser = await User.findById(taskDoc.createdBy as mongoose.Types.ObjectId);

    // Only proceed if the task was created by a 'superadmin'
    if (createdByUser && createdByUser.role === 'superadmin') {
      const targetDepartment = taskDoc.assignedDept;

      if (targetDepartment) {
        const usersInDepartment = await User.find({
          department: targetDepartment,
          _id: { $ne: createdByUser._id }
        });

        // FIX: Explicitly cast user._id to mongoose.Types.ObjectId
        const userIdsToNotify = usersInDepartment.map((user: IUser) => (user._id as mongoose.Types.ObjectId).toString());

        if (userIdsToNotify.length > 0) {
          const notificationPayload = {
            title: `New Task in ${targetDepartment}!`,
            body: `Task: ${taskDoc.subject || 'Untitled Task'} (S.No: ${taskDoc.sno}). Assigned by Super Admin.`,
            // Also ensure taskDoc._id is correctly cast here if it's still complaining
            clickUrl: `/tasks/${(taskDoc._id as mongoose.Types.ObjectId).toString()}`,
            data: {
              taskId: (taskDoc._id as mongoose.Types.ObjectId).toString(),
              department: targetDepartment,
            }
          };
          await sendPushNotificationToUsers(userIdsToNotify, notificationPayload);
        } else {
          console.log(`No users found in department ${targetDepartment} to notify.`);
        }
      } else {
        console.log('Task has no assigned department, skipping notification for department.');
      }
    } else {
      console.log('Task not created by Super Admin, skipping department notification.');
    }

    // ... (rest of your post-save hook logic) ...

  } catch (error) {
    console.error('Error in task post-save hook:', error);
  }
});

// ** Task Model Export **
const Task = mongoose.models.Task as mongoose.Model<ITask> || mongoose.model<ITask>('Task', TaskSchema);
export default Task;