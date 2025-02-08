/* eslint-disable no-unused-vars */

declare type SearchParamProps = {
    params: { [key: string]: string };
    searchParams: { [key: string]: string | string[] | undefined };
  };
  
  declare type Gender = "male" | "female" | "other";
  declare type Status = "pending" | "scheduled" | "cancelled";
  
  declare interface CreateUserParams {
    name: string;
    email: string;
    phone: string;
  }
  declare interface User extends CreateUserParams {
    _id: string;
  }
  
  declare interface RegisterUserParams extends CreateUserParams {
    userId: string;
    age: string;
    gender: Gender;
    address: string;
    occupation: string;
    emergencyContactName: string;
    emergencyContactNumber: string;
    insuranceProvider: string;
    insurancePolicyNumber: string;
    allergies?: string;
    currentMedication?: string;
    familyMedicalHistory?: string;
    pastMedicalHistory?: string;
    identificationType?: string;
    identificationNumber?: string;
    identificationDocument?: FormData;
    privacyConsent: boolean;
  }
  
  type CreateAppointmentParams = {
    userId: string;
    patientId: string;
    patientName: string;
    primaryPhysician: { id: string; name: string }; // Updated to store both id and name
    reason: string;
    schedule: Date;
    status: Status;
    note?: string; // Optional note
};

  
  declare type UpdateAppointmentParams = {
    appointmentId: string;
    userId: string;
    appointment: Appointment;
    type: string;
  };