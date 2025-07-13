// src/app/api/Receiver/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Receiver from '../../../../models/Receiver';

// PUT: Update a receiver
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const { id } = params;

  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Receiver name is required' }, { status: 400 });
    }

    const updated = await Receiver.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT error (receiver):', err);
    return NextResponse.json({ error: 'Failed to update receiver' }, { status: 500 });
  }
}

// DELETE: Remove a receiver
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const { id } = params;

  try {
    const deleted = await Receiver.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('DELETE error (receiver):', err);
    return NextResponse.json({ error: 'Failed to delete receiver' }, { status: 500 });
  }
}
