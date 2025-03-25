// pages/api/reminders.ts
import { sendReminderEmails } from '@/lib/actions/sendEmails';
import { NextResponse } from 'next/server';

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: Request) {
  try {
    // Add CORS headers to the response
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Validate API key
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return NextResponse.json(
        { success: false, message: 'Missing Authorization header' },
        { status: 401, headers }
      );
    }

    // Remove 'Bearer ' prefix if present
    const token = authHeader.replace('Bearer ', '');
    
    if (!process.env.REMINDER_API_TOKEN) {
      console.error('REMINDER_API_TOKEN not configured');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500, headers }
      );
    }

    if (token !== process.env.REMINDER_API_TOKEN) {
      console.error('Invalid API token');
      return NextResponse.json(
        { success: false, message: 'Invalid API token' },
        { status: 401, headers }
      );
    }
    
    // Process reminders
    const result = await sendReminderEmails();
    
    // Log results
    console.log(`Reminder processing complete: ${result.message}`);
    
    return NextResponse.json(result, { headers });
  } catch (error) {
    console.error('Error in reminder API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Server error processing reminders',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500, headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }}
    );
  }
}