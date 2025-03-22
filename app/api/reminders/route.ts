// pages/api/reminders.ts
import { sendReminderEmails } from '@/lib/actions/sendEmails';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  // Validate API key
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== process.env.REMINDER_API_TOKEN) {
    console.error('Invalid or missing API token');
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  try {
    // Process reminders
    const result = await sendReminderEmails();
    
    // Log results
    console.log(`Reminder processing complete: ${result.message}`);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in reminder API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error processing reminders',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}