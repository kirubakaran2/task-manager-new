// src/app/api/site/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Site from '../../../../models/Site';

// PUT: Update a department
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const { id } = params;

  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'site name is required' }, { status: 400 });
    }

    const updated = await Site.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT error (site):', err);
    return NextResponse.json({ error: 'Failed to update site' }, { status: 500 });
  }
}

// DELETE: Remove a department
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  const { id } = params;

  try {
    const deleted = await Site.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('DELETE error (Site):', err);
    return NextResponse.json({ error: 'Failed to delete Site' }, { status: 500 });
  }
}
