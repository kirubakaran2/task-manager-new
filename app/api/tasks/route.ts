// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../lib/db';
import Task from '../../../models/Task';
import fs from 'fs';
import fsPromises from 'fs/promises';
import os from 'os';
import path from 'path';
import mongoose from 'mongoose';
import User from '../../../models/User';
import cloudinary from 'cloudinary';
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  exp: number;
}

export async function GET(request: Request) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const userDataCookie = cookieStore.get('user_data');
    if (!userDataCookie) {
      return NextResponse.json({ error: 'Unauthorized: Missing user data' }, { status: 401 });
    }

    const user = JSON.parse(userDataCookie.value);
    let query = {};

    if (['superadmin', 'admin'].includes(user.role)) {
      query = {};
    } else {
      const userId = new mongoose.Types.ObjectId(user.id);
      query = {
        $or: [
          { createdBy: userId },
          { assignedDept: user.department },
          { assignee: userId }
        ]
      };
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name department')
      .sort({ createdAt: -1 });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let user: JwtPayload;
  try {
    user = jwt.verify(token.value, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const contentType = req.headers.get('content-type') || '';
  let taskData: any = {};
  const uploadedFiles: any[] = [];

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const taskJson = formData.get('task');
    if (typeof taskJson === 'string') {
      taskData = JSON.parse(taskJson);
    }

    const files = formData.getAll('files');
    for (const file of files) {
      if (!(file instanceof File)) continue;

      const arr = await file.arrayBuffer();
      const buffer = Buffer.from(arr);
      const tmpPath = path.join(os.tmpdir(), `${Date.now()}-${file.name}`);
      await fsPromises.writeFile(tmpPath, buffer);

      try {
        const result = await cloudinary.v2.uploader.upload(tmpPath, {
          folder: `task-manager/users/${user.id}`,
          resource_type: 'auto',
        });

        uploadedFiles.push({
          fileName: result.original_filename,
          publicId: result.public_id,
          url: result.secure_url,
          uploadedBy: user.id,
          uploadedAt: new Date(),
        });
      } catch (err: any) {
        console.error('Cloudinary upload failed:', err);
        return NextResponse.json({ error: 'Cloudinary upload failed', message: err.message }, { status: 500 });
      } finally {
        await fsPromises.unlink(tmpPath);
      }
    }
  } else {
    taskData = await req.json();
  }

  // Normalize createdBy to ObjectId
  taskData.createdBy = new mongoose.Types.ObjectId(user.id);

  // Normalize comments.user to ObjectId
  if (Array.isArray(taskData.comments)) {
    taskData.comments = taskData.comments.map((comment: any) => ({
      ...comment,
      user: new mongoose.Types.ObjectId(
        typeof comment.user === 'object' ? comment.user.id : comment.user
      ),
    }));
  }

  taskData.files = uploadedFiles;

  if (taskData.assignee && Array.isArray(taskData.assignee)) {
    const assigneeIds = await Promise.all(
      taskData.assignee.map(async (email: string) => {
        const userDoc = await User.findOne({ email });
        if (!userDoc) {
          throw new Error(`Assignee with email ${email} not found`);
        }
        return userDoc._id;
      })
    );
    taskData.assignee = assigneeIds;
  }

  try {
    const newTask = new Task(taskData);
    await newTask.save(); 
    return NextResponse.json(newTask, { status: 201 });
  } catch (err: any) {
    console.error('Error creating task:', err);
    return NextResponse.json({ error: 'Failed to create task', message: err.message }, { status: 500 });
  }
}