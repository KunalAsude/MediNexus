"use server";

import mongoose from "mongoose";
import { formatDateTime } from "../utils";
import { revalidatePath } from "next/cache";
import connect from "../mongodb";
import AppointmentSchema from "../modals/appointmentSchema";

 // Ensure you have a MongoDB connection utility

 export const createAppointment = async (params: CreateAppointmentParams) => {
  try {
    // Connect to MongoDB
    await connect();

    // Create a new appointment instance
    const newAppointment = new AppointmentSchema({
      userId: params.userId,
      patientId: params.patientId, // Mapping patientId to the patient field in schema
      patientName: params.patientName,
      primaryPhysician: params.primaryPhysician,
      reason: params.reason,
      schedule: params.schedule,
      status: params.status,
      note: params.note || "",  // Default to empty string if note is not provided
    });

    console.log("New Appointment:", newAppointment);

    // Save the new appointment to the database
    const savedAppointment = await newAppointment.save();

    // Return the saved appointment object
    return savedAppointment.toObject();  // Convert to plain object before returning
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw new Error("Failed to create appointment");
  }
};




export const getAppointment = async (appointmentId: string) => {
  try {
    await connect();
    const appointment = await AppointmentSchema.findById(appointmentId).lean();
    if (!appointment) throw new Error("Appointment not found");
    return appointment;
  } catch (error) {
    console.error("Error fetching appointment:", error);
    throw new Error("Failed to fetch appointment");
  }
};

export const getRecentAppointmentList = async () => {
  try {
    await connect();
    const appointments = await AppointmentSchema.find()
      .sort({ createdAt: -1 })
      .lean();

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = appointments.reduce((acc, appointment) => {
      if (appointment.status === "scheduled") acc.scheduledCount += 1;
      else if (appointment.status === "pending") acc.pendingCount += 1;
      else if (appointment.status === "cancelled") acc.cancelledCount += 1;
      return acc;
    }, initialCounts);

    return {
      totalCount: appointments.length,
      ...counts,
      documents: appointments,
    };
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw new Error("Failed to fetch appointment list");
  }
};

export const updateAppointment = async ({
  appointmentId,
  userId,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    await connect();
    const updatedAppointment = await AppointmentSchema.findByIdAndUpdate(
      appointmentId,
      {
        $set: {
          primaryPhysician: appointment.primaryPhysician,
          schedule: appointment.schedule,
          status: appointment.status,
          cancellationReason: appointment.cancellationReason || "",
        },
      },
      { new: true }
    ).lean();

    if (!updatedAppointment) {
      throw new Error("Appointment not found");
    }

    // const smsMessage = `Greetings from MediNexus. ${
    //   type === "schedule"
    //     ? `Your appointment is confirmed for ${
    //         formatDateTime(appointment.schedule!).dateTime
    //       } with Dr. ${appointment.primaryPhysician}`
    //     : `We regret to inform you that your appointment for ${
    //         formatDateTime(appointment.schedule!).dateTime
    //       } is cancelled. Reason: ${appointment.cancellationReason}`
    // }`;

    // await sendSMSNotification(userId, smsMessage);

    // revalidatePath("/admin");
    return updatedAppointment;
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw new Error("Failed to update appointment");
  }
};

// export const sendSMSNotification = async (userId: string, content: string) => {
//   try {
//     console.log(`Sending SMS to user ${userId}: ${content}`);
//     // You need to implement actual SMS sending logic
//     return { success: true, message: "SMS sent" };
//   } catch (error) {
//     console.error("An error occurred while sending SMS:", error);
//     throw new Error("Failed to send SMS");
//   }
// };
