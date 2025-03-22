import { resend } from "../resend";
import AppointmentEmail from "@/emails/appointment";
import { ApiResponse } from "@/types/ApiResponse";
import React from "react";
import Appointment from "../modals/appointmentSchema";
import User from "../modals/userModel";
import doctorModal from "../modals/doctorModal";
import ReminderHistory from "../modals/ReminderHistory";
import ReminderEmail from "@/emails/reminder";
import PrescriptionEmail from "@/emails/prescription";
import { generatePrescriptionPDF, PrescriptionData } from "./prescriptionPdfGenerator";

export async function sendEmail(
  email: string,
  name: string,
  appointmentDate: string,
  reason: string,
  doctorName: string,
  type: "schedule" | "cancel",
  doctorEmail: string,
  meetingId?: string
): Promise<ApiResponse> {
  try {
    // Send email to patient
    const patientEmailResponse = await resend.emails.send({
      from: "noreply@medinexus.in",
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
      from: "noreply@medinexus.in",
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
    console.log("Starting appointment reminder process");
    const now = new Date();

    // Look for appointments in the next 2 hours (but modify the filter logic below)
    const reminderWindow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const upcomingAppointments = await Appointment.find({
      status: "scheduled",
      "timeSlot.startTime": {
        $gt: now,
        $lt: reminderWindow,
      },
    });

    console.log(
      `Found ${upcomingAppointments.length} upcoming appointments within the next 2 hours`
    );

    // Get reminder history for these appointments
    const appointmentIds = upcomingAppointments.map((appt) =>
      appt._id.toString()
    );
    const reminderHistories = await ReminderHistory.find({
      appointmentId: { $in: appointmentIds },
    });

    const reminderMap = new Map();
    reminderHistories.forEach((history) => {
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

        // Calculate hours until appointment
        const appointmentTime = new Date(appointment.timeSlot.startTime);
        const hoursUntil =
          (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        // Determine if we should send a reminder based on timing and history
        let shouldSendReminder = false;

        // 1-hour reminder (between 45-75 minutes before appointment)
        if (hoursUntil > 0.75 && hoursUntil < 1.25) {
          // Check if we've already sent a 1-hour reminder
          const oneHourReminderSent =
            reminderHistory?.reminderTypes?.includes("1hour") || false;

          if (!oneHourReminderSent) {
            shouldSendReminder = true;
            console.log(
              `Sending 1-hour reminder for appointment ${appointmentId} (${hoursUntil.toFixed(2)} hours until)`
            );
          } else {
            console.log(
              `Skipping 1-hour reminder for appointment ${appointmentId} - already sent`
            );
          }
        } else {
          console.log(
            `Appointment ${appointmentId} not in 1-hour window (${hoursUntil.toFixed(2)} hours until)`
          );
          continue;
        }

        if (!shouldSendReminder) {
          continue;
        }

        // Get user data
        const patient = await User.findById(appointment.userId);
        const doctor = await User.findById(appointment.primaryPhysician.id);

        if (!patient || !patient.email) {
          console.error(
            `Missing patient email for appointment ${appointmentId}`
          );
          failedCount++;
          errors.push({
            appointmentId,
            error: "Missing patient email",
          });
          continue;
        }

        if (!doctor || !doctor.email) {
          console.error(
            `Missing doctor email for appointment ${appointmentId}`
          );
          // Still proceed with patient email
        }

        // Send patient email
        try {
          const patientEmailResponse = await resend.emails.send({
            from: "noreply@medinexus.in",
            to: patient.email,
            subject: `Reminder: Your Appointment with ${appointment.primaryPhysician.name} in 1 hour`,
            react: React.createElement(ReminderEmail, {
              name: patient.name || appointment.patientName,
              appointmentDate: appointment.timeSlot.startTime,
              reason: appointment.reason,
              doctorName: appointment.primaryPhysician.name,
              hoursUntil: Math.round(hoursUntil * 10) / 10,
              isVirtual: appointment.isVirtual,
              meetingLink: appointment.meetingLink || "",
              isDoctor: false,
            }),
          });

          if (!patientEmailResponse.id) {
            throw new Error(
              "Failed to send patient email: " +
                JSON.stringify(patientEmailResponse)
            );
          }
        } catch (emailError) {
          console.error(
            `Error sending patient email for appointment ${appointmentId}:`,
            emailError
          );
          errors.push({
            appointmentId,
            error:
              emailError instanceof Error
                ? emailError.message
                : String(emailError),
            type: "patient_email",
          });
        }

        // Send doctor email if available
        if (doctor && doctor.email) {
          try {
            const doctorEmailResponse = await resend.emails.send({
              from: "noreply@medinexus.in",
              to: doctor.email,
              subject: `Reminder: Appointment with ${appointment.patientName} in 1 hour`,
              react: React.createElement(ReminderEmail, {
                name: doctor.name || appointment.primaryPhysician.name,
                appointmentDate: appointment.timeSlot.startTime,
                reason: appointment.reason,
                doctorName: `Patient: ${appointment.patientName}`,
                hoursUntil: Math.round(hoursUntil * 10) / 10,
                isVirtual: appointment.isVirtual,
                meetingLink: appointment.meetingLink || "",
                isDoctor: true,
              }),
            });

            if (!doctorEmailResponse.id) {
              throw new Error(
                "Failed to send doctor email: " +
                  JSON.stringify(doctorEmailResponse)
              );
            }
          } catch (emailError) {
            console.error(
              `Error sending doctor email for appointment ${appointmentId}:`,
              emailError
            );
            errors.push({
              appointmentId,
              error:
                emailError instanceof Error
                  ? emailError.message
                  : String(emailError),
              type: "doctor_email",
            });
          }
        }

        // Update reminder history
        if (reminderHistory) {
          const reminderTypes = reminderHistory.reminderTypes || [];
          if (!reminderTypes.includes("1hour")) {
            reminderTypes.push("1hour");
          }

          await ReminderHistory.findByIdAndUpdate(reminderHistory._id, {
            lastSentAt: now,
            reminderCount: reminderHistory.reminderCount + 1,
            reminderTypes,
          });
        } else {
          await ReminderHistory.create({
            appointmentId,
            lastSentAt: now,
            reminderCount: 1,
            reminderTypes: ["1hour"],
          });
        }

        console.log(
          `Successfully sent 1-hour reminder for appointment ${appointmentId}`
        );
        sentCount++;
      } catch (error) {
        console.error(
          `Error processing reminder for appointment ${appointment._id}:`,
          error
        );
        errors.push({
          appointmentId: appointment._id,
          error: error instanceof Error ? error.message : String(error),
        });
        failedCount++;
      }
    }

    return {
      success: true,
      message: `Processed ${upcomingAppointments.length} appointments, sent ${sentCount} reminders, failed ${failedCount}`,
      sentCount,
      failedCount,
      errors,
    };
  } catch (error) {
    console.error("Error in reminder process:", error);
    return {
      success: false,
      message:
        "Failed to process reminders: " +
        (error instanceof Error ? error.message : String(error)),
      sentCount: 0,
      failedCount: 0,
      errors: [error],
    };
  }
}

