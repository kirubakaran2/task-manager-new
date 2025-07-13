import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Site from '../../../models/Site';

// Define a type for the error to be more specific
interface CustomError extends Error {
  code?: number;
}

export async function GET() {
  await connectDB();

  try {
    const site = await Site.find().sort({ name: 1 });
    return NextResponse.json(site, { status: 200 });
  } catch (err) {
    console.error('GET error (site):', err);
    return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 });
  }
}

// POST: Create a new site
export async function POST(request: NextRequest) {
  await connectDB();

  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Site name is required' }, { status: 400 });
    }

    // Check if the site already exists before trying to insert
    const existingSite = await Site.findOne({ name: name.trim() });
    if (existingSite) {
      return NextResponse.json({ error: 'Site already exists' }, { status: 409 });
    }

    const created = await Site.create({ name: name.trim() });
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error('POST error (site):', err);

    // Narrowing down the error type
    if (err instanceof Error) {
      const customError = err as CustomError;

      // Check if it's a duplicate error
      if (customError.code === 11000) {
        return NextResponse.json({ error: 'Site already exists' }, { status: 409 });
      }

      return NextResponse.json({ error: 'Failed to create site' }, { status: 500 });
    }

    // In case it's an unknown error type
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
