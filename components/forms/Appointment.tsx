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
import { Loader2 } from "lucide-react";

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
  email: string;
  phone: string;
  status: string;
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
  const reduxHospitalId = useSelector((state: any) => state.hospital.selectedHospitalId);
  const [isSmallLoading, setIsSmallLoading] = useState(false);
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);


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
    const storedHospitalId = localStorage.getItem("hospitalId");
    if (storedHospitalId) {
      setHospitalId(storedHospitalId);
    }
  }, []);
  useEffect(() => {
    if (reduxHospitalId) {
      setHospitalId(reduxHospitalId);
      localStorage.setItem("hospitalId", reduxHospitalId);
    }
  }, [reduxHospitalId]);

  useEffect(() => {
    if (!hospitalId) return;

    const fetchDoctors = async () => {
      setIsSmallLoading(true);
      try {
        const fetchedDoctors = await getDoctorsByHospital(hospitalId);
        setDoctors(fetchedDoctors);
      } catch (error) {
        toast.error("Failed to fetch doctors. Please try again later.");
        console.error("Error fetching doctors:", error);
      } finally {
        setIsSmallLoading(false);
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
        console.log("Appointment Data:", appointmentData);
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
            const user = await getUser(updatedAppointment?.userId);
            console.log("User:", user.email);
            const response = await fetch("/api/email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user?.email, 
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

  const availableSlots = [
    "10:00 AM - 10:30 AM",
    "11:00 AM - 11:30 AM",
    "02:00 PM - 02:30 PM",
    "03:30 PM - 04:00 PM",
    "05:00 PM - 05:30 PM",
    "03:30 PM - 04:00 PM",
    "05:00 PM - 05:30 PM",
    "03:30 PM - 04:00 PM",
    "05:00 PM - 05:30 PM",
  ];

  const handleSlotClick = (slot: string) => {
    const selectedDate = form.watch("schedule");
    if (!selectedDate) {
      toast.error("Please select a date first.");
      return;
    }

    // Extract time and period (AM/PM)
    const [time, period] = slot.split(" ");
    const [hours, minutes] = time.split(":").map(Number);

    // Convert to 24-hour format
    let finalHours = hours;
    if (period.toLowerCase() === "pm" && hours !== 12) finalHours += 12;
    if (period.toLowerCase() === "am" && hours === 12) finalHours = 0;

    // Set the final date-time value
    const finalSchedule = new Date(selectedDate);
    finalSchedule.setHours(finalHours, minutes, 0, 0);

    // Update form state with the final schedule
    form.setValue("schedule", finalSchedule);
    setSelectedTimeSlot(slot); // Highlight selected time slot

    console.log("Final Scheduled Date & Time:", finalSchedule);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">

        {type !== "cancel" && (
          <>
            {/* Doctor Selection */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-5">
              {/* Time Slots (Left Side) */}


              {/* Input Fields (Right Side) */}
              <div className="flex flex-col gap-6 mt-3">
                <CustomFormField
                  fieldType={FormFieldTypes.SELECT}
                  control={form.control}
                  name="primaryPhysician"
                  label="Doctor"
                  placeholder="Select a physician"
                >
                  {isSmallLoading ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
                    </div>
                  ) : (
                    doctors.map((doctor) => (
                      <SelectItem key={doctor._id} value={JSON.stringify({ id: doctor._id, name: doctor.name })}>
                        <div className="flex cursor-pointer items-center gap-2">
                          <p>{doctor.name}</p>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </CustomFormField>

                <CustomFormField fieldType={FormFieldTypes.DATE_PICKER} control={form.control} name="schedule" label="Expected Appointment Date" placeholder="Select a Date" dateFormat="MM/dd/yyyy - h:mm aa" />

                <CustomFormField fieldType={FormFieldTypes.TEXTAREA} control={form.control} name="reason" label="Reason for Appointment" placeholder="Enter Reason" />

                <CustomFormField
                  fieldType={FormFieldTypes.TEXTAREA}
                  control={form.control}
                  name="note"
                  label="Notes"
                  placeholder="Enter Notes"

                />

              </div>
              <div className="w-full p-4 bg-[#012621]/50 backdrop-blur-md rounded-lg shadow-md h-full overflow-y-auto">
                <h6 className="text-teal-100 text-sm font-medium mb-3 pt-1">Available Time Slots</h6>
                {availableSlots.length > 0 ? (
                  <ul className="space-y-2 cursor-pointer">
                    {availableSlots.map((slot, index) => (
                      <li
                        key={index}
                        className={`text-teal-300 text-sm bg-[#014d3b]/50 p-2 rounded-md text-center cursor-pointer transition-all duration-200 ${selectedTimeSlot === slot ? "bg-teal-950 text-white" : ""
                          }`}
                        onClick={() => handleSlotClick(slot)} // Fixed onClick syntax
                      >
                        {slot}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-teal-400/60">No slots available for this date.</p>
                )}
              </div>

            </div>


            {/* Reason & Notes Fields */}

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