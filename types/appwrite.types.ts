import { Models } from "node-appwrite";

export interface Patient extends Models.Document {
  userId: string;
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: Gender;
  address: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  primaryPhysician: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  allergies: string | undefined;
  currentMedication: string | undefined;
  familyMedicalHistory: string | undefined;
  pastMedicalHistory: string | undefined;
  identificationType: string | undefined;
  identificationNumber: string | undefined;
  identificationDocument: FormData | undefined;
  privacyConsent: boolean;
}

export interface Appointment extends Models.Document {
  patient: Patient;
  schedule: Date;
  status: Status;
  primaryPhysician: string;
  reason: string;
  note: string;
  userId: string;
  cancellationReason: string | null;
}
export interface Doctor {
  _id: string;
  name: string;
  status: 'active' | 'inactive';
  availableSlots: string[];
}

export interface Appointment {
  _id: string;
  patientName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'pending' | 'cancelled';
}

export interface AppointmentStats {
  documents: Appointment[];
  scheduledCount: number;
  pendingCount: number;
  cancelledCount: number;
}

export interface UpdateAvailabilityResponse {
  success: boolean;
  message: string;
}