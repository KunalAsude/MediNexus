import mongoose, { Schema, Document } from "mongoose";

export interface IRegisteredPatient extends Document {
  userId: string;
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: string;
  address: string;
  occupation?: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  primaryPhysician?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  allergies?: string;
  currentMedication?: string;
  familyMedicalHistory?: string;
  pastMedicalHistory?: string;
  identificationType: string;
  identificationNumber: string;
  identificationDocumentUrl?: string;
  treatmentConsent: boolean;
  disclosureConsent: boolean;
  privacyConsent: boolean;
}

const RegisteredPatientSchema = new Schema<IRegisteredPatient>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    birthDate: { type: Date, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    occupation: { type: String },
    emergencyContactName: { type: String, required: true },
    emergencyContactNumber: { type: String, required: true },
    primaryPhysician: { type: String },
    insuranceProvider: { type: String },
    insurancePolicyNumber: { type: String },
    allergies: { type: String },
    currentMedication: { type: String },
    familyMedicalHistory: { type: String },
    pastMedicalHistory: { type: String },
    identificationType: { type: String, required: true },
    identificationNumber: { type: String, required: true },
    identificationDocumentUrl: { type: String },
    treatmentConsent: { type: Boolean, required: true },
    disclosureConsent: { type: Boolean, required: true },
    privacyConsent: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.RegisteredPatient ||
  mongoose.model<IRegisteredPatient>("RegisteredPatient", RegisteredPatientSchema);
