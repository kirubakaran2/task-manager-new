import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Department from '../../../models/Departments';

// Define a type for the error to be more specific
interface CustomError extends Error {
  code?: number;
}

export async function GET() {
  await connectDB();

  try {
    const departments = await Department.find().sort({ name: 1 });
    return NextResponse.json(departments, { status: 200 });
  } catch (err) {
    console.error('GET error (departments):', err);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

// POST: Create a new department
export async function POST(request: NextRequest) {
  await connectDB();

  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 });
    }

    // Check if the department already exists before trying to insert
    const existingDepartment = await Department.findOne({ name: name.trim() });
    if (existingDepartment) {
      return NextResponse.json({ error: 'Department already exists' }, { status: 409 });
    }

    const created = await Department.create({ name: name.trim() });
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error('POST error (department):', err);

    // Narrowing down the error type
    if (err instanceof Error) {
      const customError = err as CustomError;

      // Check if it's a duplicate error
      if (customError.code === 11000) {
        return NextResponse.json({ error: 'Department already exists' }, { status: 409 });
      }

      return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
    }

    // In case it's an unknown error type
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
