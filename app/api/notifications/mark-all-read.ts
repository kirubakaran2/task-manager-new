import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../lib/db';
import Notification from '../../../models/notification';

const JWT_SECRET = process.env.JWT_SECRET!; // Must be defined in your env

interface JwtPayload {
  email: string;
  exp: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const token = req.cookies['auth_token'];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token' });
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }

  try {
    await dbConnect();
    await Notification.updateMany(
      { recipient: decoded.email, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
