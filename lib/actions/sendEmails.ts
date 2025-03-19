import { resend } from "../resend";
import AppointmentEmail from "@/emails/appointment";
import { ApiResponse } from "@/types/ApiResponse";
import React from "react";

export async function sendEmail(
  email: string,
  name: string,
  appointmentDate: string,
  reason: string,
  doctorName: string,
  type: "schedule" | "cancel",
  doctorEmail: string,
  meetingId?: string,
): Promise<ApiResponse> {
  try {
    // Send email to patient
    const patientEmailResponse = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: `Your Appointment has been ${type === "schedule" ? "Scheduled" : "Canceled"}`,
      react: React.createElement(AppointmentEmail, {
        name,
        appointmentDate,
        reason,
        doctorName,
        type,
        meetingId,
      }),
    });

   
    const doctorEmailResponse = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: doctorEmail,
      subject: `Patient Appointment ${type === "schedule" ? "Scheduled" : "Canceled"}: ${name}`,
      react: React.createElement(AppointmentEmail, {
        name: doctorName, 
        appointmentDate,
        reason,
        doctorName: `Patient: ${name}`, 
        type,
        meetingId,
        isDoctor: true, 
      }),
    });

    if (patientEmailResponse && doctorEmailResponse) {
      return {
        success: true,
        message: "Emails sent successfully to patient and doctor",
      };
    } else {
      return {
        success: false,
        message: "Failed to send one or more emails",
      };
    }
  } catch (emailError) {
    console.error("Error sending email:", emailError);
    return {
      success: false,
      message: "Failed to send email",
    };
  }
}