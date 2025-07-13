import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';

// ✅ GET a single user by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await User.findById(params.id).lean();
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Exclude password from the response
    const { password, ...safeUser } = user;
    return NextResponse.json(safeUser); // Returns name, email, etc.
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Failed to fetch user' }, { status: 500 });
  }
}

// ✅ UPDATE a user by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { email, role, department, location } = body;

    await connectDB();

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Build update payload
    const updateData: Record<string, any> = {};
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (location !== undefined) updateData.location = location;
    if (body.password) updateData.password = body.password;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!updatedUser) {
      return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
    }

    const { password: _, ...userData } = updatedUser;
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
  }
}

// ✅ DELETE a user by ID
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectDB();

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
  }
}
