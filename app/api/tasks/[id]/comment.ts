import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../lib/db';
import Task from '../../../../models/Task';
import cookie from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const {
    query: { id },
    method,
  } = req;

  if (method === 'PUT') {
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    return handlePutRequest(req, res, id);
  }

  if (method !== 'POST') {
    return res.setHeader('Allow', ['POST', 'PUT']).status(405).end(`Method ${method} Not Allowed`);
  }

  try {
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const userData = cookies.user_data ? JSON.parse(cookies.user_data) : null;

    if (!userData || !userData.id) {
      return res.status(401).json({ error: 'Unauthorized. User data not found in cookies.' });
    }

    const { message } = req.body;

    const comment = {
      message,
      createdAt: new Date(),
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        location: userData.location,
      },
    };

    const task = await Task.findByIdAndUpdate(
      id,
      { $push: { comments: comment } },
      { new: true }
    );

    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment', details: error });
  }
}

async function handlePutRequest(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const userData = cookies.user_data ? JSON.parse(cookies.user_data) : null;

    if (!userData || !userData.id) {
      return res.status(401).json({ error: 'Unauthorized. User data not found in cookies.' });
    }

    const updatedData = req.body;

    const task = await Task.findByIdAndUpdate(id, updatedData, { new: true });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task', details: error });
  }
}
