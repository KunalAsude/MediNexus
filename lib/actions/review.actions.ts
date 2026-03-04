"use server";

import connect from "../mongodb";
import Review from "../modals/reviewSchema";

export interface SubmitReviewParams {
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  rating: number;
  description: string;
}

export const submitReview = async (params: SubmitReviewParams) => {
  try {
    await connect();

    // Check if a review already exists for this appointment
    const existing = await Review.findOne({ appointmentId: params.appointmentId });
    if (existing) {
      return { success: false, message: "You have already submitted a review for this appointment." };
    }

    const review = await Review.create(params);
    return { success: true, data: JSON.parse(JSON.stringify(review)) };
  } catch (error: unknown) {
    console.error("Error submitting review:", error);
    const msg = error instanceof Error ? error.message : "Failed to submit review";
    return { success: false, message: msg };
  }
};

export const getReviewsByDoctor = async (doctorId: string) => {
  try {
    await connect();
    const reviews = await Review.find({ doctorId }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(reviews));
  } catch (error: unknown) {
    console.error("Error fetching reviews:", error);
    return [];
  }
};

export const getReviewByAppointment = async (appointmentId: string) => {
  try {
    await connect();
    const review = await Review.findOne({ appointmentId }).lean();
    return review ? JSON.parse(JSON.stringify(review)) : null;
  } catch (error: unknown) {
    console.error("Error fetching review:", error);
    return null;
  }
};

export const getReviewsExistenceForAppointments = async (appointmentIds: string[]) => {
  try {
    await connect();
    const reviews = await Review.find({ appointmentId: { $in: appointmentIds } }).select("appointmentId").lean();
    const existsMap: Record<string, boolean> = {};
    (reviews as unknown as { appointmentId: string }[]).forEach((r) => {
      existsMap[r.appointmentId] = true;
    });
    return existsMap;
  } catch (error: unknown) {
    console.error("Error checking reviews:", error);
    return {};
  }
};
