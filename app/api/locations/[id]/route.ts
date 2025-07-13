// src/app/api/locations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Location from '../../../../models/Location';

// PUT (update a location)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const { id } = params;

  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const updated = await Location.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE (delete a location)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const { id } = params;

  try {
    const deleted = await Location.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('DELETE error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
