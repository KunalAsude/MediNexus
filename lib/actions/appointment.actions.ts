"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import connect from "../mongodb";
import Appointment from "../modals/appointmentSchema";

export const createAppointment = async (params: CreateAppointmentParams) => {
  try {
    await connect();

    const newAppointment = new Appointment({
      userId: params.userId,
      patientId: params.patientId,
      patientName: params.patientName,
      primaryPhysician: {
        id: params.primaryPhysician.id,
        name: params.primaryPhysician.name,
      },
      reason: params.reason,
      schedule: new Date(params.schedule),
      status: params.status,
      note: params.note || "",
    });

    const savedAppointment = await newAppointment.save();

    
    return {
      ...savedAppointment.toObject(), 
      _id: savedAppointment._id.toString(), 
      schedule: savedAppointment.schedule.toISOString(),
      createdAt: savedAppointment.createdAt.toISOString(),
      updatedAt: savedAppointment.updatedAt.toISOString(),
    };
  } catch (error) {
    throw new Error("Failed to create appointment");
  }
};


export const getAppointment = async (appointmentId: string) => {
  try {
    await connect();
    const appointment = await Appointment.findById(appointmentId).lean();
    if (!appointment) throw new Error("Appointment not found");
    return appointment;
  } catch (error) {
    throw new Error("Failed to fetch appointment");
  }
};

export const getRecentAppointmentList = async (doctorId = null) => {
  try {
    await connect();

    // Define query: If doctorId is provided, filter by doctor
    const query = doctorId ? { "primaryPhysician.id": doctorId } : {};

    const appointments = await Appointment.find(query).sort({ createdAt: -1 }).lean();

    const counts = appointments.reduce(
      (acc, appointment) => {
        if (appointment.status === "scheduled") acc.scheduledCount += 1;
        else if (appointment.status === "pending") acc.pendingCount += 1;
        else if (appointment.status === "cancelled") acc.cancelledCount += 1;
        return acc;
      },
      { scheduledCount: 0, pendingCount: 0, cancelledCount: 0 }
    );

    return { totalCount: appointments.length, ...counts, documents: appointments };
  } catch (error) {
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
    if (!appointmentId) throw new Error("Missing appointment ID");

    const updateFields: Record<string, any> = {
      primaryPhysician: appointment.primaryPhysician
        ? JSON.parse(JSON.stringify(appointment.primaryPhysician))
        : null,
      schedule: appointment.schedule ? new Date(appointment.schedule) : null,
    };

    if (type === "cancel") {
      updateFields.status = "cancelled";
      updateFields.cancellationReason = appointment.cancellationReason || "Not provided";
    } else {
      updateFields.status = appointment.status || "scheduled";
      updateFields.$unset = { cancellationReason: 1 };
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedAppointment) throw new Error("Appointment not found");

   
    return {
      ...updatedAppointment.toObject(),
      _id: updatedAppointment._id.toString(), 
      schedule: updatedAppointment.schedule.toISOString(),
      createdAt: updatedAppointment.createdAt.toISOString(),
      updatedAt: updatedAppointment.updatedAt.toISOString(),
    };
  } catch (error) {
    throw new Error("Failed to update appointment");
  }
};

