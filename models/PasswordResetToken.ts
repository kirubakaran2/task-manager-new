// models/PasswordResetToken.ts
import mongoose, { Document, Schema, Model } from 'mongoose';
export interface IPasswordResetToken extends Document {
  userId: mongoose.Types.ObjectId; 
  token: string; 
  expiresAt: Date; 
  createdAt: Date; 
}

const PasswordResetTokenSchema: Schema<IPasswordResetToken> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Reference to the User model
  },
  token: {
    type: String,
    required: true,
    unique: true, // Ensure tokens are unique
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // This creates a TTL index that automatically deletes documents after expiresAt
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PasswordResetToken = (mongoose.models.PasswordResetToken as Model<IPasswordResetToken>) || mongoose.model<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema);

export default PasswordResetToken;
