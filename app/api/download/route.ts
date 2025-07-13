// app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Task from '../../../models/Task';
import mongoose from 'mongoose';
import axios from 'axios';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');

    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return NextResponse.json({ error: 'Invalid or missing file ID' }, { status: 400 });
    }

    await dbConnect();

    // Find the task containing this file ID
    const task = await Task.findOne({ 'files._id': fileId });
    if (!task) {
      return NextResponse.json({ error: 'File not found in any task' }, { status: 404 });
    }

    const file = task.files.find((f: any) => f._id.toString() === fileId);
    if (!file || !file.url) {
      return NextResponse.json({ error: 'File URL not found' }, { status: 404 });
    }

    // Fetch the file from Cloudinary
    const response = await axios.get(file.url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers['content-type'] || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.fileName || 'downloaded-file'}.${file.url.split('.').pop()}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Failed to download file', message: error.message }, { status: 500 });
  }
}
