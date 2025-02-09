"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { SelectItem } from "@/components/ui/select";
import CustomFormField from "../customFormField";
import SubmitButton from "../SubmitButton";
import { useEffect, useState } from "react";
import { getAppointmentSchema } from "@/lib/Validation";
import { useRouter } from "next/navigation";
import { createAppointment, updateAppointment } from "@/lib/actions/appointment.actions";
import { getDoctorsByHospital, getUser } from "@/lib/actions/patient.actions";
import { toast } from "sonner";
import { Appointment } from "@/types/appwrite.types";
import { useSelector } from "react-redux";

export enum FormFieldTypes {
  INPUT = "input",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  DATE_PICKER = "datePicker",
  CHECKBOX = "checkbox",
  SELECT = "select",
  SKELETON = "skeleton",
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  image: string;
}

export interface PrimaryPhysician {
  id: string;
  name: string;
}

export interface AppointmentFormData {
  primaryPhysician: string;
  schedule: Date;
  reason: string;
  note?: string;
  cancellationReason?: string;
}

export interface AppointmentData {
  userId: string;
  patientId: string;
  patientName: string;
  primaryPhysician: PrimaryPhysician;
  schedule: Date;
  reason: string;
  note?: string;
  status: 'pending' | 'scheduled' | 'cancelled';
  cancellationReason?: string;
}

interface AppointmentFormProps {
  userId: string;
  patientId: string;
  patientName: string;
  type: "create" | "cancel" | "schedule";
  appointment?: Appointment;
  setOpen?: (open: boolean) => void;
}

const AppointmentForm = ({
  userId,
  patientId,
  patientName,
  type,
  appointment,
  setOpen,
}: AppointmentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const router = useRouter();
  const hospitalId = useSelector((state: any) => state.hospital.selectedHospitalId);

  const AppointmentFormValidation = getAppointmentSchema(type);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      primaryPhysician: appointment?.primaryPhysician ?
        JSON.stringify(appointment.primaryPhysician) : "",
      schedule: appointment ? new Date(appointment.schedule) : new Date(),
      reason: appointment?.reason || "",
      note: appointment?.note || "",
      cancellationReason: appointment?.cancellationReason || "",
    },
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const fetchedDoctors = await getDoctorsByHospital(hospitalId);
        setDoctors(fetchedDoctors);
      } catch (error) {
        toast.error("Failed to fetch doctors");
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, [hospitalId]);

  const onSubmit = async (values: AppointmentFormData) => {
    setIsLoading(true);

    try {
      const status = type === "schedule" ? "scheduled" :
        type === "cancel" ? "cancelled" : "pending";

      if (type === "create") {
        const selectedDoctor = JSON.parse(values.primaryPhysician);

        const appointmentData: AppointmentData = {
          userId,
          patientId,
          patientName,
          primaryPhysician: {
            id: selectedDoctor.id,
            name: selectedDoctor.name,
          },
          schedule: values.schedule,
          reason: values.reason,
          note: values.note,
          status,
        };

        const newAppointment = await createAppointment(appointmentData);
        if (newAppointment) {
          form.reset();
          router.push(`/patients/${userId}/new-appointment/success?appointmentId=${newAppointment._id}`);
          toast.success("Appointment created successfully");
        }
      } else if (appointment && (type === "cancel" || type === "schedule")) {
        const appointmentToUpdate = {
          userId,
          appointmentId: appointment._id,
          appointment: {
            primaryPhysician: type !== "cancel" ?
              JSON.parse(values.primaryPhysician) :
              appointment.primaryPhysician,
            reason: values.reason || appointment.reason,
            schedule: values.schedule,
            status,
            note: values.note || appointment.note,
            ...(type === "cancel" && {
              cancellationReason: values.cancellationReason
            }),
          },
          type,
        };

        const updatedAppointment = await updateAppointment(appointmentToUpdate);
        console.log("Updated Appointment:", updatedAppointment);
        if (updatedAppointment) {
          setOpen?.(false);
          form.reset();
          toast.success(`Appointment ${type}d successfully`);
          
          
          try {
            const user =await getUser(updatedAppointment?.userId);
            console.log("User:", user.email);
            const response = await fetch("/api/email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user?.email,  // Assuming this is in your updated data
                name: updatedAppointment?.patientName,
                appointmentDate: updatedAppointment?.schedule,
                reason: updatedAppointment?.reason,
                doctorName: updatedAppointment?.primaryPhysician?.name,
                type, 
              }),
            });

            const data = await response.json();
            if (data.success) {
              toast.success("Email sent successfully");
            } else {
              toast.error("Failed to send email");
            }
          } catch (error) {
            console.error("Error sending email:", error);
            toast.error("Error sending email");
          }
        }

      }
    } catch (error) {
      toast.error(`Failed to ${type} appointment`);
      console.error("Error handling appointment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonLabel = type === 'create' ? 'Book Appointment' :
    type === 'cancel' ? 'Cancel Appointment' :
      'Schedule Appointment';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        {type === "create" && (
          <section className="mb-12 space-y-4">
            <h1 className="text-xl font-bold">New Appointment</h1>
            <p className="text-dark-700">Schedule Your New Appointment With Us</p>
          </section>
        )}

        {type !== "cancel" && (
          <>
            <CustomFormField
              fieldType={FormFieldTypes.SELECT}
              control={form.control}
              name="primaryPhysician"
              label="Doctor"
              placeholder="Select a physician"
            >
              {doctors.map((doctor) => (
                <SelectItem
                  key={doctor._id}
                  value={JSON.stringify({ id: doctor._id, name: doctor.name })}
                >
                  <div className="flex cursor-pointer items-center gap-2">
                    <p>{doctor.name}</p>
                  </div>
                </SelectItem>
              ))}
            </CustomFormField>

            <CustomFormField
              fieldType={FormFieldTypes.DATE_PICKER}
              control={form.control}
              name="schedule"
              label="Expected Appointment Date"
              placeholder="Select a Date"
              showTimeSelect
              dateFormat="MM/dd/yyyy - h:mm aa"
            />

            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                fieldType={FormFieldTypes.TEXTAREA}
                control={form.control}
                name="reason"
                label="Reason for Appointment"
                placeholder="Enter Reason"
              />

              <CustomFormField
                fieldType={FormFieldTypes.TEXTAREA}
                control={form.control}
                name="note"
                label="Notes"
                placeholder="Enter Notes"
              />
            </div>
          </>
        )}

        {type === 'cancel' && (
          <CustomFormField
            fieldType={FormFieldTypes.TEXTAREA}
            control={form.control}
            name="cancellationReason"
            label="Reason for cancellation"
            placeholder="Enter Reason for cancellation"
          />
        )}

        <SubmitButton
          isLoading={isLoading}
          className={`${type === 'cancel' ? 'shad-danger-btn' :
              'shad-primary-btn bg-[linear-gradient(to_right,#064E4C,#024632,#013220)] border-2 border-cyan-900'
            } w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  );
};

export default AppointmentForm;