import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '../../../../lib/db';
import Task from '../../../../models/Task';
import { cookies } from 'next/headers';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import os from 'os';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// GET /api/tasks/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id: taskId } = params;

  try {
    const task = await Task.findById(taskId)
      .populate('createdBy', 'email name')
      .populate('assignee', 'email name')
      .populate('comments.user', 'email name');

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ message: 'Error fetching task', error }, { status: 500 });
  }
}

// PUT /api/tasks/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id: taskId } = params;
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user_data');
  if (!userCookie) return NextResponse.json({ error: 'Unauthorized. No user cookie.' }, { status: 401 });

  let userData;
  try {
    userData = JSON.parse(userCookie.value);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid user cookie data', message: (err as Error).message }, { status: 400 });
  }

  if (!userData.id) return NextResponse.json({ error: 'Unauthorized. User ID missing.' }, { status: 401 });

  const contentType = req.headers.get('content-type') || '';
  let updateData: any = {};
  let uploadedFiles: any[] = [];

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const taskJson = formData.get('task');
    if (typeof taskJson === 'string') {
      updateData = JSON.parse(taskJson);
    }

    const files = formData.getAll('files');

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const tmpPath = path.join(os.tmpdir(), `${Date.now()}-${file.name}`);
      await fsPromises.writeFile(tmpPath, buffer);

      try {
        const result = await cloudinary.v2.uploader.upload(tmpPath, {
          folder: `task-manager/users/${userData.id}`,
          resource_type: 'auto',
        });

        uploadedFiles.push({
          fileName: result.original_filename,
          googleFileId: result.public_id, // use this field for cloudinary public_id
          googleDriveLink: result.secure_url, // keep the field name same for consistency
          uploadedBy: userData.id,
          uploadedAt: new Date(),
        });
      } catch (err) {
        console.error('Cloudinary upload failed:', err);
        return NextResponse.json({ error: 'Cloudinary upload failed', message: (err as Error).message }, { status: 500 });
      } finally {
        await fsPromises.unlink(tmpPath);
      }
    }
  } else {
    updateData = await req.json();
  }

  // Normalize nested fields
  if (Array.isArray(updateData.comments)) {
    updateData.comments = updateData.comments.map((c: any) => ({
      ...c,
      createdAt: c.createdAt?.toString(),
      user: typeof c.user === 'object' ? (c.user.id || c.user._id || c.user).toString() : c.user.toString()
    }));
  }

  if (updateData.createdBy && typeof updateData.createdBy === 'object') {
    updateData.createdBy = (updateData.createdBy.id || updateData.createdBy._id || updateData.createdBy).toString();
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    if (uploadedFiles.length > 0) {
      task.files.push(...uploadedFiles);
    }

    Object.assign(task, updateData);
    await task.save();

    return NextResponse.json(task);
  } catch (err) {
    console.error('Error updating task:', err);
    return NextResponse.json({ error: 'Failed to update task', message: (err as Error).message }, { status: 500 });
  }
}
// DELETE /api/tasks/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id: taskId } = params;

  try {
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    // You might want to add logic here to delete associated files from Cloudinary
    // This would involve iterating through deletedTask.files and calling cloudinary.v2.uploader.destroy()

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ message: 'Error deleting task', error }, { status: 500 });
  }
}