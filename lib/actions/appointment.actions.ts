"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import connect from "../mongodb";
import Appointment from "../modals/appointmentSchema";
import Prescription from "../modals/prescriptionSchema";

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
  isVirtual: boolean;
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
      isVirtual: params.isVirtual ?? false,
      timeSlot: {
        startTime: startTime,
        endTime: endTime,
      },
      status: params.status
    });
    

    const savedAppointment = await newAppointment.save();

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
    

    const appointment = await Appointment.findById(appointmentId).lean();
    
    if (!appointment) {
      console.error("Appointment not found with ID:", appointmentId);
      throw new Error("Appointment not found");
    }

    
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

    // Define query: If doctorId is provided, filter by primaryPhysician.id
    const query = doctorId ? { "primaryPhysician.id": String(doctorId) } : {};

    const appointments = await Appointment.find(query).sort({ createdAt: -1 }).lean();

    // Format dates in each appointment safely
    const formattedAppointments = appointments.map(appointment => ({
      ...appointment,
      _id: appointment._id.toString(),
      timeSlot: appointment.timeSlot
        ? {
            startTime: new Date(appointment.timeSlot.startTime).toISOString(),
            endTime: new Date(appointment.timeSlot.endTime).toISOString(),
          }
        : null, // Handle missing timeSlot
      createdAt: new Date(appointment.createdAt).toISOString(),
      updatedAt: new Date(appointment.updatedAt).toISOString(),
    }));

    // Count different statuses
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

    // Handle reason and isVirtual if provided
    if (appointment.reason) updateFields.reason = appointment.reason;
    
    // Handle isVirtual and meetingLink
    if (appointment.isVirtual !== undefined) {
      updateFields.isVirtual = appointment.isVirtual;
      
      // If appointment is virtual, handle meetingLink
      if (appointment.isVirtual === true) {
        // Generate a meetingLink if not provided
        if (appointment.meetingLink) {
          updateFields.meetingLink = appointment.meetingLink;
        } 
        // else {
        //   // Generate a random meeting ID if not provided
        //   const meetingId = `med-${Math.random().toString(36).substring(2, 10)}`;
        //   updateFields.meetingLink = `https://medinexus.com/meeting/${meetingId}`;
        //   updateFields.meetingId = meetingId;
        // }
      } else {
        // If not virtual, remove meetingLink and meetingId if they exist
        updateFields.meetingLink = null;
        updateFields.meetingId = null;
      }
    }

    if (type === "cancel") {
      updateFields.status = "cancelled";
      updateFields.cancellationReason = appointment.cancellationReason || "Not provided";
    } else {
      updateFields.status = appointment.status || "scheduled";
    }
    
    const result = await Appointment.updateOne(
      { _id: appointmentId },
      { $set: updateFields }
    );

    console.log(" Result --",result)

    if (result.matchedCount === 0) {
      throw new Error("Appointment not found");
    }

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
export const formatDateTime = async (dateString: string) => {
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
    
    // Create date objects for the start and end of the selected date in UTC
    const startOfDayUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    const endOfDayUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
    
    // Query MongoDB for appointments with the doctor's ID that start on the selected date
    const bookedAppointments = await Appointment.find({
      "primaryPhysician.id": doctorId, // Using the doctor's _id directly
      "timeSlot.startTime": { $gte: startOfDayUTC, $lt: endOfDayUTC }
    }).lean(); // Convert to plain objects for serialization
    
    // Serialize the appointments for client-side use
    const serializedAppointments = bookedAppointments.map((appointment) => ({
      ...appointment,
      _id: appointment._id.toString(), // Convert MongoDB ObjectId to string
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
      // Ensure timeSlot dates are properly serialized
      timeSlot: {
        startTime: appointment.timeSlot.startTime.toISOString(),
        endTime: appointment.timeSlot.endTime.toISOString()
      }
    }));
    
    return serializedAppointments;
  } catch (error) {
    console.error("Error fetching booked appointments:", error);
    throw error;
  }
}

// Improved isTimeSlotBooked function for the client component
export async function isTimeSlotBooked(
  slot: { startTime: Date; endTime: Date },
  bookedAppointments: any[],
  currentAppointmentId?: string
) {
  if (!bookedAppointments || bookedAppointments.length === 0) return false;
  
  // Create normalized time values for comparison (in minutes since midnight)
  const slotStartMinutes = slot.startTime.getHours() * 60 + slot.startTime.getMinutes();
  const slotEndMinutes = slot.endTime.getHours() * 60 + slot.endTime.getMinutes();
  
  return bookedAppointments.some(appt => {
    // Skip the current appointment being edited
    if (currentAppointmentId && appt._id === currentAppointmentId) return false;
    
    // Parse the appointment times
    const apptStartTime = new Date(appt.timeSlot.startTime);
    const apptEndTime = new Date(appt.timeSlot.endTime);
    
    // Convert to minutes since midnight for easy comparison
    const apptStartMinutes = apptStartTime.getHours() * 60 + apptStartTime.getMinutes();
    const apptEndMinutes = apptEndTime.getHours() * 60 + apptEndTime.getMinutes();
    
    // Check for any overlap
    return (
      (slotStartMinutes >= apptStartMinutes && slotStartMinutes < apptEndMinutes) || 
      (slotEndMinutes > apptStartMinutes && slotEndMinutes <= apptEndMinutes) ||
      (slotStartMinutes <= apptStartMinutes && slotEndMinutes >= apptEndMinutes) 
    );
  });
}

export const getUserAppointments = async (userId: string) => {
  try {
    await connect();
    
    if (!userId) {
      console.error("No user ID provided");
      throw new Error("User ID is required");
    }

    const appointments = await Appointment.find({ userId }).sort({ 'timeSlot.startTime': -1 }).lean();
    
    if (!appointments || appointments.length === 0) {
      return { 
        totalCount: 0, 
        scheduledCount: 0, 
        pendingCount: 0, 
        cancelledCount: 0, 
        documents: [] 
      };
    }

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

    // Count different statuses
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
    console.error("Error fetching user appointments:", error);
    throw new Error(`Failed to fetch user appointments: ${error.message}`);
  }
};


export async function cancelAppointment(appointmentId: string, reason: string) {
  try {
 
    await connect();
    
 
    if (!appointmentId) {
      throw new Error("Appointment ID is required");
    }
    

    const result = await Appointment.updateOne(
      { _id: appointmentId },
      { 
        $set: {
          status: "cancelled",
          cancellationReason: reason || "Not provided"
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      throw new Error("Appointment not found");
    }
    
    if (result.modifiedCount === 0) {
      throw new Error("Failed to cancel appointment");
    }
    
    return { success: true, message: "Appointment cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    throw new Error(`Failed to cancel appointment: ${error.message}`);
  }
}

export async function setPatientPrescription(prescriptionData) {
  try {
    // Connect to MongoDB
    await connect();
    
    // Validate the data before saving
    if (!prescriptionData.patientId || !prescriptionData.patientName || !prescriptionData.doctorId) {
      throw new Error("Missing required prescription fields");
    }
    
    // Create and save the prescription
    const newPrescription = new Prescription(prescriptionData);
    const savedPrescription = await newPrescription.save();

    // Return a proper response
    return {
      ok: true,
      message: "Prescription saved successfully",
      data: savedPrescription.toJSON(),
    };
  } catch (error) {
    console.error("Server action error:", error);
    
    // Return a structured error response
    return {
      ok: false,
      message: "Failed to save prescription",
      error: error.message,
    };
  }
}


export const getPrescription = async (prescriptionId) => {
  try {
    await connect(); 

    const prescription = await Prescription.findById(prescriptionId).lean();
    console.log(prescription)
    if (!prescription) {
      console.log("No prescription found for this ID");
      return { success: false, message: "No prescription found" };
    }

    return { success: true, data: prescription };

  } catch (error) {
    console.error("Error fetching prescription:", error);
    return { success: false, message: "Failed to fetch prescription", error: error.message };
  }
};

export const getPrescriptionByAppointmentId = async (appointmentId: string) => {
  try {
    await connect(); 

    const prescription = await Prescription.findOne({ appointmentId }).lean();
    console.log(prescription);
    
    if (!prescription) {
      console.log("No prescription found for this appointment ID");
      return { success: false, message: "No prescription found" };
    }

    return { success: true, data: prescription };

  } catch (error) {
    console.error("Error fetching prescription by appointment ID:", error);
    return { success: false, message: "Failed to fetch prescription", error: error.message };
  }
};
