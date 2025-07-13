// src/app/api/departments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Department from '../../../../models/Departments';

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  await connectDB();
  const { id } = context.params;

  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 });
    }

    const updated = await Department.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT error (department):', err);
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  await connectDB();
  const { id } = context.params;

  try {
    const deleted = await Department.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('DELETE error (department):', err);
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}
