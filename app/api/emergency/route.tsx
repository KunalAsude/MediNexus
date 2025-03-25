// File: /app/api/emergency/route.js
import { NextResponse } from "next/server";
import { Resend } from 'resend'; // For email notifications
// import twilio from 'twilio'; // For SMS notifications
import Emergency from "@/lib/modals/emergency";
import connect from "@/lib/mongodb";

// Initialize the email service
const resend = new Resend(process.env.RESEND_API_KEY); // Fixed typo in API_KEY

export async function POST(req) {
  try {
    // Parse the emergency data
    const emergencyData = await req.json();
    
    // Connect to the database
    await connect();
    
    // Create a new emergency record
    const emergency = await Emergency.create({
      ...emergencyData,
      status: "pending",
      createdAt: new Date()
    });
    
    try {
      // Send email notification to admin (doesn't block the response if it fails)
      await sendEmailAlert(emergency);
    } catch (emailError) {
      console.error("Email alert failed but continuing:", emailError);
    }
    
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
      // Validate location data
      if (!isValidLocation(emergency.location)) {
        console.warn("Invalid or imprecise location data");
        emergency.location = await getAlternativeLocation(emergency);
      }
  
      // Fallback for missing location
      const mapsLink = emergency.location 
        ? `https://www.google.com/maps?q=${emergency.location.latitude},${emergency.location.longitude}`
        : 'Location unavailable';
  
      // Enhanced location accuracy information
      const locationDetails = emergency.location 
        ? `
          <p>
            <strong>Coordinates:</strong> ${emergency.location.latitude}, ${emergency.location.longitude}<br/>
            <strong>Accuracy:</strong> ${emergency.location.accuracy} meters<br/>
            <strong>Method:</strong> ${emergency.location.provider || 'Unknown'}<br/>
            <a href="${mapsLink}" style="background-color: #38b2ac; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View on Google Maps</a>
          </p>
        `
        : '<p><strong>⚠️ Location could not be determined</strong></p>';
  
      await resend.emails.send({
        from: 'noreply@medinexus.in',
        to: "medinexus.dev24@gmail.com",
        subject: '🚨 URGENT: MediNexus Emergency Alert',
        html: `
          <h1 style="color: #e53e3e;">Emergency Alert</h1>
          <p><strong>Time:</strong> ${new Date(emergency.timestamp).toLocaleString()}</p>
          <p><strong>User:</strong> ${emergency.userName || 'Anonymous User'} (ID: ${emergency.userId || 'Not logged in'})</p>
          
          <h2>Location Details:</h2>
          ${locationDetails}
  
          <p><strong>Device Info:</strong> ${emergency.deviceInfo || 'Not available'}</p>
          <p>Please respond immediately. This is an automated emergency alert from the MediNexus platform.</p>
        `
      });
  
      console.log("Emergency email alert sent successfully");
      return true;
    } catch (error) {
      console.error("Failed to send emergency email:", error);
      // Optional: Implement backup alert mechanism
      await sendBackupAlert(emergency);
      return false;
    }
  }
  
  // Location validation function
  function isValidLocation(location) {
    return location && 
           typeof location.latitude === 'number' && 
           typeof location.longitude === 'number' &&
           location.accuracy !== undefined &&
           location.accuracy <= 100; // Example precision threshold
  }
  
  // Fallback location retrieval
  async function getAlternativeLocation(emergency) {
    try {
      // Implement alternative location methods:
      // 1. IP-based geolocation
      // 2. Network-based location
      // 3. Last known good location
      return await retrieveAlternativeLocation(emergency);
    } catch (error) {
      console.warn("Could not retrieve alternative location", error);
      return null;
    }
  }
  
  // Backup alert mechanism
  async function sendBackupAlert(emergency) {
    // Implement alternative alert methods
    // SMS, secondary email, push notification, etc.
  }

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
    await connect();  // Fixed: Using the correct import name
    
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
    // Parse the update data
    const updateData = await req.json();
    const { emergencyId, status, responderInfo, estimatedArrival } = updateData;
    
    if (!emergencyId || !status) {
      return NextResponse.json({ 
        success: false, 
        message: "Emergency ID and status are required" 
      }, { status: 400 });
    }
    
    // Connect to the database
    await connect();  // Fixed: Using the correct import name
    
    // Find and update the emergency
    const emergency = await Emergency.findByIdAndUpdate(
      emergencyId,
      {
        status,
        responderId: responderInfo?.id || null,
        responderName: responderInfo?.name || null,
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
    
    // Notify the user about the status update if appropriate
    if (emergency.userId && ['assigned', 'en_route', 'arrived'].includes(status)) {
      // Implementation for notifying the user would go here
      // This could involve push notifications, SMS, or other means
    }
    
    // Return the updated emergency
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