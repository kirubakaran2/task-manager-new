import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  taskSno: string;
  taskSubject: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    taskSno: { type: String, required: true },
    taskSubject: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    type: { type: String, required: true }
  },
  { timestamps: true }
);

// Export model (handle potential duplicate model error)
const Notification = mongoose.models.Notification as mongoose.Model<INotification> || 
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;