// File: /app/api/emergency/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";

import { Resend } from 'resend'; // For email notifications
// import twilio from 'twilio'; // For SMS notifications
import Emergency from "@/lib/modals/emergency";

// Initialize the email service
const resend = new Resend(process.env.RESEND_API_KEY);

// // Initialize Twilio
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// Helper function to get auth data from request headers
async function getAuthFromRequest(req) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return null;
    }

    // Extract user details from the User-Details header
    const userDetailsHeader = req.headers.get('User-Details');
    if (!userDetailsHeader) {
      return null;
    }

    try {
      const userDetails = JSON.parse(userDetailsHeader);
      return {
        user: {
          id: token, // Using token as the user ID
          ...userDetails
        }
      };
    } catch (e) {
      console.error("Error parsing user details:", e);
      return null;
    }
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export async function POST(req) {
  try {
    // Get authentication data from request headers
    const authResult = await getAuthFromRequest(req);
    const user = authResult?.user || null;

    // Parse the emergency data
    const emergencyData = await req.json();

    // Connect to the database
    await connectDB();

    // Add user information if available
    if (user && !emergencyData.userId) {
      emergencyData.userId = user.id;
      emergencyData.userName = user.name || user.email;
    }

    // Create a new emergency record
    const emergency = await Emergency.create({
      ...emergencyData,
      status: "pending",
      createdAt: new Date()
    });

    // Send email notification to admin
    await sendEmailAlert(emergency);

    // Send SMS notification if phone number is configured
    await sendSMSAlert(emergency);

    // Return the emergency ID for reference
    return NextResponse.json({
      success: true,
      message: "Emergency alert received",
      emergencyId: emergency._id,
      estimatedResponseTime: "10-15 minutes"
    }, { status: 200 });
  } catch (error) {
    console.error("Emergency API error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to process emergency"
    }, { status: 500 });
  }
}

// Helper function to send email alerts
async function sendEmailAlert(emergency) {
  try {
    // Get admin email from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || "admin@medinexus.com";

    // Format the location for Google Maps link
    const mapsLink = `https://www.google.com/maps?q=${emergency.location.latitude},${emergency.location.longitude}`;

    // Send the email
    await resend.emails.send({
      from: 'emergency@medinexus.com',
      to: adminEmail,
      subject: '🚨 URGENT: MediNexus Emergency Alert',
      html: `
        <h1 style="color: #e53e3e;">Emergency Alert</h1>
        <p><strong>Time:</strong> ${new Date(emergency.timestamp).toLocaleString()}</p>
        <p><strong>User:</strong> ${emergency.userName || 'Anonymous User'} (ID: ${emergency.userId || 'Not logged in'})</p>
        <h2>Location Details:</h2>
        <p>
          <strong>Coordinates:</strong> ${emergency.location.latitude}, ${emergency.location.longitude}<br/>
          <strong>Accuracy:</strong> ${emergency.location.accuracy} meters<br/>
          <a href="${mapsLink}" style="background-color: #38b2ac; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View on Google Maps</a>
        </p>
        <p><strong>Device Info:</strong> ${emergency.deviceInfo || 'Not available'}</p>
        <p>Please respond immediately. This is an automated emergency alert from the MediNexus platform.</p>
      `
    });

    console.log("Emergency email alert sent successfully");
    return true;
  } catch (error) {
    console.error("Failed to send emergency email:", error);
    return false;
  }
}

// Helper function to send SMS alerts
// async function sendSMSAlert(emergency) {
//   try {
//     // Get emergency phone from environment variables
//     const emergencyPhone = process.env.EMERGENCY_PHONE;
//     const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

//     if (!emergencyPhone || !twilioPhone) {
//       console.log("SMS alert not sent: Missing phone configuration");
//       return false;
//     }

//     // Format the location for Google Maps link
//     const mapsLink = `https://maps.google.com/?q=${emergency.location.latitude},${emergency.location.longitude}`;

//     // Prepare the SMS message
//     const message = `🚨 URGENT: MediNexus Emergency Alert
//     Time: ${new Date(emergency.timestamp).toLocaleString()}
//     User: ${emergency.userName || 'Anonymous'}
//     Location: ${mapsLink}
//     Respond immediately.`;

//     // Send the SMS
//     const result = await twilioClient.messages.create({
//       body: message,
//       from: twilioPhone,
//       to: emergencyPhone
//     });

//     console.log("Emergency SMS alert sent successfully", result.sid);
//     return true;
//   } catch (error) {
//     console.error("Failed to send emergency SMS:", error);
//     return false;
//   }
// }

// Add a GET method to check the status of an emergency
export async function GET(req) {
  try {
    // Extract emergency ID from the URL
    const url = new URL(req.url);
    const emergencyId = url.searchParams.get('id');

    if (!emergencyId) {
      return NextResponse.json({
        success: false,
        message: "Emergency ID is required"
      }, { status: 400 });
    }

    // Connect to the database
    await connectDB();

    // Find the emergency by ID
    const emergency = await Emergency.findById(emergencyId);

    if (!emergency) {
      return NextResponse.json({
        success: false,
        message: "Emergency not found"
      }, { status: 404 });
    }

    // Return the emergency status
    return NextResponse.json({
      success: true,
      emergency: {
        id: emergency._id,
        status: emergency.status,
        createdAt: emergency.createdAt,
        location: emergency.location,
        responderId: emergency.responderId || null,
        responderName: emergency.responderName || null,
        estimatedArrival: emergency.estimatedArrival || null
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Emergency status API error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to retrieve emergency status"
    }, { status: 500 });
  }
}

// Add a PATCH method to update the status of an emergency
export async function PATCH(req) {
  try {
    // Get authentication data from request headers
    const authResult = await getAuthFromRequest(req);
    if (!authResult?.user) {
      return NextResponse.json({
        success: false,
        message: "Authentication required"
      }, { status: 401 });
    }

   
    const updateData = await req.json();
    const { emergencyId, status, responderInfo, estimatedArrival } = updateData;

    if (!emergencyId || !status) {
      return NextResponse.json({
        success: false,
        message: "Emergency ID and status are required"
      }, { status: 400 });
    }

 
    await connectDB();


    const emergency = await Emergency.findByIdAndUpdate(
      emergencyId,
      {
        status,
        responderId: responderInfo?.id || authResult.user.id,
        responderName: responderInfo?.name || authResult.user.name,
        estimatedArrival: estimatedArrival || null,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!emergency) {
      return NextResponse.json({
        success: false,
        message: "Emergency not found"
      }, { status: 404 });
    }

   
    if (emergency.userId && ['assigned', 'en_route', 'arrived'].includes(status)) {
      
    }

 
    return NextResponse.json({
      success: true,
      message: `Emergency status updated to ${status}`,
      emergency: {
        id: emergency._id,
        status: emergency.status,
        responderId: emergency.responderId,
        responderName: emergency.responderName,
        estimatedArrival: emergency.estimatedArrival
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Emergency update API error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update emergency status"
    }, { status: 500 });
  }
}