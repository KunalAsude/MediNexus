import { resend } from "../resend";
import AppointmentEmail from "@/emails/appointment";
import { ApiResponse } from "@/types/ApiResponse";
import React from "react";
import Appointment from "../modals/appointmentSchema";
import User from "../modals/userModel";
import doctorModal from "../modals/doctorModal";
import ReminderHistory from "../modals/ReminderHistory";
import ReminderEmail from "@/emails/reminder";

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


export async function sendReminderEmails(): Promise<{
  success: boolean;
  message: string;
  sentCount: number;
  failedCount: number;
  errors: any[];
}> {
  try {
  
    const now = new Date();
    
    
    const reminderWindow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
   
    const upcomingAppointments = await Appointment.find({
      status: "scheduled", 
      "timeSlot.startTime": { 
        $gt: now, 
        $lt: reminderWindow 
      }
    });
    
    console.log(`Found ${upcomingAppointments.length} upcoming appointments`);
    

    const appointmentIds = upcomingAppointments.map(appt => appt._id.toString());
    const reminderHistories = await ReminderHistory.find({
      appointmentId: { $in: appointmentIds }
    });

    const reminderMap = new Map();
    reminderHistories.forEach(history => {
      reminderMap.set(history.appointmentId, history);
    });
    
    const errors: any[] = [];
    let sentCount = 0;
    let failedCount = 0;
    
    // Process each appointment
    for (const appointment of upcomingAppointments) {
      try {
        const appointmentId = appointment._id.toString();
        const reminderHistory = reminderMap.get(appointmentId);
        
      
        if (reminderHistory && 
            (new Date(reminderHistory.lastSentAt).getTime() > now.getTime() - 60 * 60 * 1000)) {
          console.log(`Skipping reminder for appointment ${appointmentId} - reminder sent less than 1 hour ago`);
          continue;
        }
        
 
        const appointmentTime = new Date(appointment.timeSlot.startTime);
        const hoursUntil = Math.round((appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60) * 10) / 10;
       
        if (Math.abs(hoursUntil - 1) > 0.25) {
          console.log(`Skipping reminder for appointment ${appointmentId} - not at 1 hour mark (${hoursUntil} hours until)`);
          continue;
        }
        
  
        const patient = await User.findById(appointment.userId);
        const doctor = await User.findById(appointment.primaryPhysician.id);
        
        if (!patient || !patient.email || !doctor || !doctor.email) {
          console.error(`Missing email for appointment ${appointmentId}`);
          failedCount++;
          continue;
        }
        

        const patientEmailResponse = await resend.emails.send({
          from: "onboarding@resend.dev",
          to: patient.email,
          subject: `Reminder: Your Appointment with ${appointment.primaryPhysician.name} in 1 hour`,
          react: React.createElement(ReminderEmail, {
            name: appointment.patientName,
            appointmentDate: appointment.timeSlot.startTime,
            reason: appointment.reason,
            doctorName: appointment.primaryPhysician.name,
            hoursUntil: 1,
            isVirtual: appointment.isVirtual,
            meetingLink: appointment.meetingLink || "",
            isDoctor: false
          }),
        });
        
     
        const doctorEmailResponse = await resend.emails.send({
          from: "onboarding@resend.dev",
          to: doctor.email,
          subject: `Reminder: Appointment with ${appointment.patientName} in 1 hour`,
          react: React.createElement(ReminderEmail, {
            name: doctor.name || appointment.primaryPhysician.name,
            appointmentDate: appointment.timeSlot.startTime,
            reason: appointment.reason,
            doctorName: `Patient: ${appointment.patientName}`,
            hoursUntil: 1,
            isVirtual: appointment.isVirtual,
            meetingLink: appointment.meetingLink || "",
            isDoctor: true
          }),
        });
        
    
        if (reminderHistory) {
          await ReminderHistory.findByIdAndUpdate(reminderHistory._id, {
            lastSentAt: now,
            reminderCount: reminderHistory.reminderCount + 1
          });
        } else {
          await ReminderHistory.create({
            appointmentId,
            lastSentAt: now,
            reminderCount: 1
          });
        }
        
        console.log(`Sent 1-hour reminder for appointment ${appointmentId}`);
        sentCount++;
      } catch (error) {
        console.error(`Error sending reminder for appointment ${appointment._id}:`, error);
        errors.push({
          appointmentId: appointment._id,
          error: error instanceof Error ? error.message : String(error)
        });
        failedCount++;
      }
    }
    
    return {
      success: true,
      message: `Processed ${upcomingAppointments.length} appointments, sent ${sentCount} 1-hour reminders`,
      sentCount,
      failedCount,
      errors
    };
  } catch (error) {
    console.error("Error in reminder process:", error);
    return {
      success: false,
      message: "Failed to process reminders",
      sentCount: 0,
      failedCount: 0,
      errors: [error]
    };
  }
}