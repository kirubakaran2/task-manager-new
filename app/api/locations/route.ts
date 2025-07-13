// src/app/api/locations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Location from '../../../models/Location';

// GET all locations
export async function GET() {
  await connectDB();

  try {
    const locations = await Location.find().sort({ name: 1 });
    return NextResponse.json(locations);
  } catch (err: unknown) {
    console.error('GET error:', err);

    if (err instanceof Error) {
      return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
    }
    
    // If the error is not an instance of Error, it's handled here
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}

// POST new location
export async function POST(request: NextRequest) {
  await connectDB();

  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newLocation = await Location.create({ name: name.trim() });
    return NextResponse.json(newLocation, { status: 201 });
  } catch (err: unknown) {
    console.error('POST error:', err);

    if (err instanceof Error) {
      if ((err as any).code === 11000) {
        return NextResponse.json({ error: 'Location already exists' }, { status: 409 });
      }
      // Handle other error codes or general error message
      return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
    }

    // If the error is not an instance of Error, handle it here
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}
