import mongoose, { Schema, model, Document, Model } from 'mongoose';

export interface IFCMSubscription {
  token: string; 
  createdAt: Date;
}

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'user' | 'admin' | 'superadmin';
  department: string;
  fcmSubscriptions: IFCMSubscription[]; 
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FCMSubscriptionSchema = new Schema<IFCMSubscription>({
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 3
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user'
    },
    department: { type: String, default: '' },
    fcmSubscriptions: [FCMSubscriptionSchema], // Changed here
    location: { type: String, default: '' }
  },
  { timestamps: true }
);

const User = (mongoose.models.User as Model<IUser>) || model<IUser>('User', UserSchema);
export default User;