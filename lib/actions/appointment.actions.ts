"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import connect from "../mongodb";
import Appointment from "../modals/appointmentSchema";

export interface CreateAppointmentParams {
  userId: string;
  patientId: string;
  patientName: string;
  primaryPhysician: {
    id: string;
    name: string;
    image?: string;
  };
  reason: string;
  timeSlot: {
    startTime: Date;
    endTime: Date;
  };
  status: "pending" | "scheduled" | "cancelled";
  note?: string;
  cancellationReason?: string;
}

export interface UpdateAppointmentParams {
  appointmentId: string;
  userId: string;
  appointment: Partial<CreateAppointmentParams>;
  type: "cancel" | "schedule";
}

export const createAppointment = async (params: CreateAppointmentParams) => {
  try {
    await connect();

    // Ensure dates are properly converted to Date objects
    const startTime = new Date(params.timeSlot.startTime);
    const endTime = new Date(params.timeSlot.endTime);

    // Validate dates
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new Error("Invalid date format for timeSlot");
    }

    const newAppointment = new Appointment({
      userId: params.userId,
      patientId: params.patientId,
      patientName: params.patientName,
      primaryPhysician: {
        id: params.primaryPhysician.id,
        name: params.primaryPhysician.name,
        image: params.primaryPhysician.image || "",
      },
      reason: params.reason,
      timeSlot: {
        startTime: startTime,
        endTime: endTime,
      },
      status: params.status,
      note: params.note || "",
    });

    console.log("Attempting to save appointment:", JSON.stringify(newAppointment, null, 2));
    const savedAppointment = await newAppointment.save();
    console.log("Appointment saved successfully with ID:", savedAppointment);

    // Convert MongoDB document to a plain object and format dates
    return {
      ...savedAppointment.toObject(),
      _id: savedAppointment._id.toString(),
      timeSlot: {
        startTime: savedAppointment.timeSlot.startTime.toISOString(),
        endTime: savedAppointment.timeSlot.endTime.toISOString(),
      },
      createdAt: savedAppointment.createdAt.toISOString(),
      updatedAt: savedAppointment.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw new Error(`Failed to create appointment: ${error.message}`);
  }
};

export const getAppointment = async (appointmentId: string) => {
  try {
    await connect();
    
    if (!appointmentId) {
      console.error("No appointment ID provided");
      throw new Error("Appointment ID is required");
    }
    
    console.log("Fetching appointment with ID:", appointmentId);
    const appointment = await Appointment.findById(appointmentId).lean();
    
    if (!appointment) {
      console.error("Appointment not found with ID:", appointmentId);
      throw new Error("Appointment not found");
    }
    
    console.log("Appointment found:", appointment?._id);
    
    // Format dates in the response
    return {
      ...appointment,
      _id: appointment?._id.toString(),
      timeSlot: {
        startTime: new Date(appointment?.timeSlot.startTime).toISOString(),
        endTime: new Date(appointment?.timeSlot.endTime).toISOString(),
      },
      createdAt: new Date(appointment?.createdAt).toISOString(),
      updatedAt: new Date(appointment?.updatedAt).toISOString(),
    };
  } catch (error) {
    console.error("Error fetching appointment:", error);
    throw new Error(`Failed to fetch appointment: ${error.message}`);
  }
};

export const getRecentAppointmentList = async (doctorId = null) => {
  try {
    await connect();

    // Define query: If doctorId is provided, filter by doctor
    const query = doctorId ? { "primaryPhysician.id": doctorId } : {};

    const appointments = await Appointment.find(query).sort({ createdAt: -1 }).lean();
    console.log(`Found ${appointments.length} appointments`);

    // Format dates in each appointment
    const formattedAppointments = appointments.map(appointment => ({
      ...appointment,
      _id: appointment._id.toString(),
      timeSlot: {
        startTime: new Date(appointment.timeSlot.startTime).toISOString(),
        endTime: new Date(appointment.timeSlot.endTime).toISOString(),
      },
      createdAt: new Date(appointment.createdAt).toISOString(),
      updatedAt: new Date(appointment.updatedAt).toISOString(),
    }));

    const counts = formattedAppointments.reduce(
      (acc, appointment) => {
        if (appointment.status === "scheduled") acc.scheduledCount += 1;
        else if (appointment.status === "pending") acc.pendingCount += 1;
        else if (appointment.status === "cancelled") acc.cancelledCount += 1;
        return acc;
      },
      { scheduledCount: 0, pendingCount: 0, cancelledCount: 0 }
    );

    return { 
      totalCount: formattedAppointments.length, 
      ...counts, 
      documents: formattedAppointments 
    };
  } catch (error) {
    console.error("Error fetching appointment list:", error);
    throw new Error(`Failed to fetch appointment list: ${error.message}`);
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
    if (!appointmentId) throw new Error("Missing appointment ID");

    console.log(`Updating appointment ${appointmentId} with type ${type}`);

    const updateFields: Record<string, any> = {};
    
    // Handle primaryPhysician update if provided
    if (appointment.primaryPhysician) {
      updateFields.primaryPhysician = JSON.parse(JSON.stringify(appointment.primaryPhysician));
    }

    // Handle timeSlot update if provided
    if (appointment.timeSlot) {
      const startTime = new Date(appointment.timeSlot.startTime);
      const endTime = new Date(appointment.timeSlot.endTime);
      
      // Validate dates
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new Error("Invalid date format for timeSlot");
      }
      
      updateFields.timeSlot = {
        startTime: startTime,
        endTime: endTime,
      };
    }

    // Handle reason and note if provided
    if (appointment.reason) updateFields.reason = appointment.reason;
    if (appointment.note !== undefined) updateFields.note = appointment.note;

    if (type === "cancel") {
      updateFields.status = "cancelled";
      updateFields.cancellationReason = appointment.cancellationReason || "Not provided";
    } else {
      updateFields.status = appointment.status || "scheduled";
    }

    console.log("Update fields:", JSON.stringify(updateFields, null, 2));

    // Use updateOne instead of findByIdAndUpdate for more reliable updates
    const result = await Appointment.updateOne(
      { _id: appointmentId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      throw new Error("Appointment not found");
    }

    console.log("Update result:", result);

    // Fetch the updated document
    const updatedAppointment = await Appointment.findById(appointmentId);
    if (!updatedAppointment) {
      throw new Error("Failed to retrieve updated appointment");
    }

    // Format dates in the response
    return {
      ...updatedAppointment.toObject(),
      _id: updatedAppointment._id.toString(),
      timeSlot: {
        startTime: updatedAppointment.timeSlot.startTime.toISOString(),
        endTime: updatedAppointment.timeSlot.endTime.toISOString(),
      },
      createdAt: updatedAppointment.createdAt.toISOString(),
      updatedAt: updatedAppointment.updatedAt.toISOString(),
    };
  } catch (error) {

    throw new Error(`Failed to update appointment: ${error.message}`);
  }
};

// Helper function to format date for display
export const formatDateTime =async (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    time: date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }),
    dateTime: `${date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })} at ${date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })}`
  };
};

export async function getBookedAppointments(doctorId: string, date: Date) {
  try {
    await connect();

    const startOfDayUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    const endOfDayUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

    console.log("Start UTC:", startOfDayUTC);
    console.log("End UTC:", endOfDayUTC);

    // Query MongoDB
    const bookedAppointments = await Appointment.find({
      "primaryPhysician.id": doctorId,
      "timeSlot.startTime": { $gte: startOfDayUTC, $lt: endOfDayUTC }
    }).lean(); // Converts to plain objects

    // Convert MongoDB _id objects to strings
    const serializedAppointments = bookedAppointments.map((appointment) => ({
      ...appointment,
      _id: appointment._id.toString(), // Ensure _id is a string
      createdAt: appointment.createdAt.toISOString(), // Convert dates to strings
      updatedAt: appointment.updatedAt.toISOString(),
    }));
    return serializedAppointments;
  } catch (error) {
    console.error("Error fetching booked appointments:", error);
    throw error;
  }
}


