import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/db';
import User from '../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    const { userId, token } = req.body;
    
    if (!userId || !token) {
      return res.status(400).json({ success: false, message: 'User ID and token are required' });
    }
    
    // Check if token already exists for this user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if this token already exists
    const tokenExists = user.fcmTokens.some(t => t.token === token);
    
    if (!tokenExists) {
      // Add new token
      user.fcmTokens.push({ token, createdAt: new Date() });
      await user.save();
    }
    
    return res.status(200).json({ success: true, message: 'Token registered successfully' });
  } catch (error) {
    console.error('Error registering token:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}