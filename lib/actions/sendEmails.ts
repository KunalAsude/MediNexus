import { resend } from "../resend";
import AppointmentEmail from "@/emails/appointment";
import { ApiResponse } from "@/types/ApiResponse";
import React from "react"; // Required for createElement

export async function sendEmail(
  email: string,
  name: string,
  appointmentDate: string,
  reason: string,
  doctorName: string,
  type: "schedule" | "cancel"
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", 
      to: email,
      subject: `Your Appointment has been ${type === "schedule" ? "Scheduled" : "Canceled"}`,
      react: React.createElement(AppointmentEmail, {
        name,
        appointmentDate,
        reason,
        doctorName,
        type,
      }),
    });

    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (emailError) {
    console.error("Error sending email:", emailError);
    return {
      success: false,
      message: "Failed to send email",
    };
  }
}
