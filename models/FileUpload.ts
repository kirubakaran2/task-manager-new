// models/FileUpload.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IFileUpload extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  publicId: string;       // Cloudinary public ID
  url: string;            // Secure URL for the file
  uploadedAt: Date;
}

const FileUploadSchema = new Schema<IFileUpload>({
  userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileName:   { type: String, required: true },
  publicId:   { type: String, required: true },   // from Cloudinary
  url:        { type: String, required: true },   // from Cloudinary
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.models.FileUpload ||
  mongoose.model<IFileUpload>('FileUpload', FileUploadSchema);
