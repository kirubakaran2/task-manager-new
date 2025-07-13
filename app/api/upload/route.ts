import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import cloudinary from 'cloudinary';
import dbConnect from '../../../lib/db';
import Task from '../../../models/Task';
import mongoose from 'mongoose';

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const taskId = formData.get('taskId')?.toString();
    const files = formData.getAll('files');

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return NextResponse.json({ error: 'Invalid or missing taskId' }, { status: 400 });
    }

    if (!files.length) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploads: any[] = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const tempPath = path.join(os.tmpdir(), `${Date.now()}-${file.name}`);
      await fs.writeFile(tempPath, buffer);

      const uploadResult = await cloudinary.v2.uploader.upload(tempPath, {
        folder: 'task-manager/uploads',
        resource_type: 'auto',
      });

      await fs.unlink(tempPath);

      const uploadedFile = {
        fileName: uploadResult.original_filename,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        uploadedAt: new Date(),
      };

      uploads.push(uploadedFile);
    }

    // Push uploaded files to task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $push: { files: { $each: uploads } } },
      { new: true }
    );

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: updatedTask }, { status: 200 });

  } catch (error: any) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
