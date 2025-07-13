import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Task from '../../../models/Task';
import User from '../../../models/User';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { data } = await req.json();
    console.log("Original submission data:", JSON.stringify(data, null, 2));

    // Create a copy of the data to modify
    const processedData = { ...data };

    // Normalize createdBy to just the ID and save email
    if (processedData.createdBy && typeof processedData.createdBy === 'object') {
      if (processedData.createdBy.email) {
        processedData.createdByEmail = processedData.createdBy.email;
      }
      if (processedData.createdBy.id) {
        processedData.createdBy = processedData.createdBy.id;
      }
    }

    // Process comments to ensure emails are saved
    if (Array.isArray(processedData.comments)) {
      // Define interfaces
      interface CommentUser {
        id?: string;
        email?: string;
      }

      interface Comment {
        user?: CommentUser | string;
        userEmail?: string;
        [key: string]: any; // For other possible comment properties
      }

      processedData.comments = processedData.comments.map((comment: Comment) => {
        const processedComment: Comment = { ...comment };

        if (processedComment.user && typeof processedComment.user === 'object') {
          if ((processedComment.user as CommentUser).email) {
        processedComment.userEmail = (processedComment.user as CommentUser).email;
          }
          if ((processedComment.user as CommentUser).id) {
        processedComment.user = (processedComment.user as CommentUser).id;
          }
        }

        console.log("Processed comment:", JSON.stringify(processedComment, null, 2));
        return processedComment;
      });
    }

    // ✅ Convert assignee emails to ObjectIds
    if (Array.isArray(processedData.assignee)) {
      const users = await User.find({ email: { $in: processedData.assignee } });
      const emailToIdMap = Object.fromEntries(users.map(user => [user.email, user._id]));

      interface EmailToIdMap {
        [email: string]: string;
      }
      
      processedData.assignee = processedData.assignee
        .map((email: string) => emailToIdMap[email as keyof EmailToIdMap])
        .filter(Boolean) as string[];
    }

    console.log("Data to save:", JSON.stringify(processedData, null, 2));

    const newTask = new Task(processedData);
    const savedTask = await newTask.save();

    console.log("Saved task:", JSON.stringify(savedTask, null, 2));

    return NextResponse.json(savedTask, { status: 201 });
  } catch (error) {
    console.error('Error submitting data:', error);
    return NextResponse.json({ message: 'Error submitting data', error }, { status: 500 });
  }
}

// PUT request to update an existing task
export async function PUT(req: NextRequest) {
  await dbConnect();

  try {
    const { data, _id } = await req.json();
    console.log("Update data received:", JSON.stringify(data, null, 2));

    if (!_id) {
      return NextResponse.json({ message: 'Task _id is required for update' }, { status: 400 });
    }
    
    // Create a copy of the data to modify
    const processedData = { ...data };

    // Normalize createdBy to just the ID and add email
    if (processedData.createdBy && typeof processedData.createdBy === 'object') {
      // Save email at top level
      if (processedData.createdBy.email) {
        processedData.createdByEmail = processedData.createdBy.email;
      }
      
      // Convert to ID
      if (processedData.createdBy.id) {
        processedData.createdBy = processedData.createdBy.id;
      }
    }

    // Process comments to ensure emails are saved
    if (Array.isArray(processedData.comments)) {
      // Define interfaces
      interface CommentUser {
        id?: string;
        email?: string;
      }

      interface Comment {
        user?: CommentUser | string;
        userEmail?: string;
        [key: string]: any; // For other possible comment properties
      }

      processedData.comments = processedData.comments.map((comment: Comment) => {
        const processedComment: Comment = { ...comment };
        
        // Extract email from user object if present
        if (processedComment.user && typeof processedComment.user === 'object') {
          // Save email directly in the comment
          if ((processedComment.user as CommentUser).email) {
        processedComment.userEmail = (processedComment.user as CommentUser).email;
          }
          
          // Convert user to ID
          if ((processedComment.user as CommentUser).id) {
        processedComment.user = (processedComment.user as CommentUser).id;
          }
        }
        
        console.log("Processed comment for update:", JSON.stringify(processedComment, null, 2));
        return processedComment;
      });
    }

    console.log("Data to update:", JSON.stringify(processedData, null, 2));
    
    const updatedTask = await Task.findByIdAndUpdate(_id, processedData, { new: true });
    console.log("Updated task:", JSON.stringify(updatedTask, null, 2));
    
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ message: 'Error updating task', error }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const _id = searchParams.get('_id');
    const userId = searchParams.get('userId');
    const department = searchParams.get('department');

    // If a specific task by _id is requested
    if (_id) {
      const task = await Task.findById(_id)
        .populate('createdBy', 'email name')  // Populate 'createdBy' with 'email' and 'name'
        .populate('assignee', 'email name')  // Populate 'assignee' with 'email' and 'name'
        .populate('comments.user', 'email name');  // Populate 'comments.user' with 'email' and 'name'

      if (!task) return NextResponse.json({ message: 'Task not found' }, { status: 404 });
      return NextResponse.json(task);
    }

    // If tasks by 'userId' are requested
    if (userId) {
      const tasks = await Task.find({ 'createdBy': userId })
        .populate('createdBy', 'email name')  // Populate 'createdBy' with 'email' and 'name'
        .populate('assignee', 'email name')  // Populate 'assignee' with 'email' and 'name'
        .populate('comments.user', 'email name');  // Populate 'comments.user' with 'email' and 'name'
      
      return NextResponse.json(tasks);
    }

    // If tasks by 'department' are requested
    if (department) {
      const tasks = await Task.find({ assignedDept: department })
        .populate('createdBy', 'email name')  // Populate 'createdBy' with 'email' and 'name'
        .populate('assignee', 'email name')  // Populate 'assignee' with 'email' and 'name'
        .populate('comments.user', 'email name');  // Populate 'comments.user' with 'email' and 'name'
      
      return NextResponse.json(tasks);
    }

    // Default: get all tasks
    const allTasks = await Task.find()
      .populate('createdBy', 'email name')  // Populate 'createdBy' with 'email' and 'name'
      .populate('assignee', 'email name')  // Populate 'assignee' with 'email' and 'name'
      .populate('comments.user', 'email name');  // Populate 'comments.user' with 'email' and 'name'

    return NextResponse.json(allTasks);

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ message: 'Error fetching data', error }, { status: 500 });
  }
}
