import connect from "@/lib/mongodb";
import { sendEmail } from "@/lib/actions/sendEmails";

export async function POST(request: Request) {
  await connect();
  
  try {
    const { name, email, appointmentDate, reason, doctorName, type, meetingId, doctorEmail } = await request.json();
    console.log("Received data:", { name, email, appointmentDate, reason, doctorName, type, meetingId, doctorEmail });
    
    // Validate required fields
    if (!name || !email || !appointmentDate || !reason || !doctorName || !type) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required fields",
        }),
        { status: 400 }
      );
    }
    
   
    const emailResponse = await sendEmail(
      email, 
      name, 
      appointmentDate, 
      reason, 
      doctorName, 
      type, 
      doctorEmail || "", 
      meetingId         
    );
    
    if (!emailResponse.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to send email",
        }),
        { status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in sending email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
}