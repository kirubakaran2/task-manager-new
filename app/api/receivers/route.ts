import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Department from '../../../models/Receiver';
import Receiver from '../../../models/Receiver';

// Define a type for the error to be more specific
interface CustomError extends Error {
  code?: number;
}

export async function GET() {
  await connectDB();

  try {
    const receiver = await Receiver.find().sort({ name: 1 });
    return NextResponse.json(receiver, { status: 200 });
  } catch (err) {
    console.error('GET error (receiver):', err);
    return NextResponse.json({ error: 'Failed to fetch receiver' }, { status: 500 });
  }
}

// POST: Create a new receiver
export async function POST(request: NextRequest) {
  await connectDB();

  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'receiver name is required' }, { status: 400 });
    }

    // Check if the receiver already exists before trying to insert
    const existingReceiver = await Receiver.findOne({ name: name.trim() });
    if (existingReceiver) {
      return NextResponse.json({ error: 'Receiver already exists' }, { status: 409 });
    }

    const created = await Receiver.create({ name: name.trim() });
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error('POST error (receiver):', err);

    // Narrowing down the error type
    if (err instanceof Error) {
      const customError = err as CustomError;

      // Check if it's a duplicate error
      if (customError.code === 11000) {
        return NextResponse.json({ error: 'Receiver already exists' }, { status: 409 });
      }

      return NextResponse.json({ error: 'Failed to create receiver' }, { status: 500 });
    }

    // In case it's an unknown error type
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
