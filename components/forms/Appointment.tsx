"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { SelectItem } from "@/components/ui/select"
import CustomFormField from "../customFormField"
import SubmitButton from "../SubmitButton"
import { useEffect, useState, useCallback } from "react"
import { getAppointmentSchema } from "@/lib/Validation"
import { useRouter } from "next/navigation"
import { createAppointment, getBookedAppointments, updateAppointment } from "@/lib/actions/appointment.actions"
import { getDoctorsByHospital, getUser } from "@/lib/actions/patient.actions"
import { toast } from "sonner"
import type { Appointment } from "@/types/appwrite.types"
import { useSelector } from "react-redux"
import { Loader2 } from "lucide-react"
import { useWatch } from "react-hook-form"

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
  _id: string
  name: string
  specialization: string
  image: string
  email: string
  phone: string
  status: string
  // Legacy field - keep for backward compatibility
  availableSlots: { startTime: string; endTime: string }[]
  // New weekly availability structure
  weeklyAvailability: {
    monday: { startTime: string; endTime: string }[]
    tuesday: { startTime: string; endTime: string }[]
    wednesday: { startTime: string; endTime: string }[]
    thursday: { startTime: string; endTime: string }[]
    friday: { startTime: string; endTime: string }[]
    saturday: { startTime: string; endTime: string }[]
    sunday: { startTime: string; endTime: string }[]
  }
  // Date specific slots for holidays or special hours
  dateSpecificSlots?: Map<string, { startTime: string; endTime: string }[]>
}

export interface PrimaryPhysician {
  id: string
  name: string
}

export interface AppointmentFormData {
  primaryPhysician: string;
  schedule: Date;
  reason: string;
  isVirtual: boolean; 
  cancellationReason?: string;
  timeSlot: {
    startTime: Date;
    endTime: Date;
  };
}


export interface AppointmentData {
  userId: string
  patientId: string
  patientName: string
  primaryPhysician: PrimaryPhysician
  reason: string
  timeSlot: {
    startTime: Date
    endTime: Date
  }
  status: "pending" | "scheduled" | "cancelled"
  isVirtual: boolean
  cancellationReason?: string
}

interface AppointmentFormProps {
  userId: string
  patientId: string
  patientName: string
  type: "create" | "cancel" | "schedule"
  appointment?: Appointment
  setOpen?: (open: boolean) => void
}

const AppointmentForm = ({ userId, patientId, patientName, type, appointment, setOpen }: AppointmentFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const router = useRouter()
  const reduxHospitalId = useSelector((state: any) => state.hospital.selectedHospitalId)
  const [isSmallLoading, setIsSmallLoading] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [hospitalId, setHospitalId] = useState<string | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [bookedAppointments, setBookedAppointments] = useState<any[]>([])
  const [appointmentType, setAppointmentType] = useState(false) // false = in-person, true = virtual

  const AppointmentFormValidation = getAppointmentSchema(type)

  // Helper function to get day name from Date object
  const getDayOfWeek = (date: Date): string => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    return days[date.getDay()]
  }

  // Parse dates safely for the initial form values
  const safeParseDate = (dateString: string | undefined | null): Date | null => {
    if (!dateString) return null
    const parsedDate = new Date(dateString)
    return !isNaN(parsedDate.getTime()) ? parsedDate : null
  }

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      primaryPhysician: appointment?.primaryPhysician ? JSON.stringify(appointment.primaryPhysician) : "",
      schedule: safeParseDate(appointment?.timeSlot?.startTime) || new Date(),
      reason: appointment?.reason || "",
      isVirtual: appointment?.isVirtual ?? false, 
      cancellationReason: appointment?.cancellationReason || "",
      timeSlot: {
        startTime: safeParseDate(appointment?.timeSlot?.startTime) || null,
        endTime: safeParseDate(appointment?.timeSlot?.endTime) || null,
      },
    },
  });
  

  // Watch for changes in primaryPhysician and schedule to fetch booked appointments
  const primaryPhysician = useWatch({ control: form.control, name: "primaryPhysician" })
  const schedule = useWatch({ control: form.control, name: "schedule" })

  useEffect(() => {
    const storedHospitalId = localStorage.getItem("hospitalId")
    if (storedHospitalId) {
      setHospitalId(storedHospitalId)
    }
  }, [])

  useEffect(() => {
    if (reduxHospitalId) {
      setHospitalId(reduxHospitalId)
      localStorage.setItem("hospitalId", reduxHospitalId)
    }
  }, [reduxHospitalId])

  useEffect(() => {
    if (!hospitalId) return

    const fetchDoctors = async () => {
      setIsSmallLoading(true)
      try {
        const fetchedDoctors = await getDoctorsByHospital(hospitalId)
        setDoctors(fetchedDoctors)
      } catch (error) {
        toast.error("Failed to fetch doctors. Please try again later.")
      } finally {
        setIsSmallLoading(false)
      }
    }

    fetchDoctors()
  }, [hospitalId])

  // Update form when appointment changes
  useEffect(() => {
    if (appointment) {
      // Parse the dates safely
      const startTime = safeParseDate(appointment.timeSlot?.startTime)
      const endTime = safeParseDate(appointment.timeSlot?.endTime)

      // If we have a valid time slot, update the selectedTimeSlot visual indicator
      if (startTime && endTime) {
        const timeSlotString = formatTimeSlot(startTime, endTime)
        setSelectedTimeSlot(timeSlotString)
      }

      // Reset the form with safely parsed values
      form.reset({
        primaryPhysician: appointment.primaryPhysician ? JSON.stringify(appointment.primaryPhysician) : "",
        schedule: startTime || new Date(),
        reason: appointment?.reason || "",
        isVirtual: appointment?.isVirtual ?? false,
        cancellationReason: appointment?.cancellationReason || "",
        timeSlot: {
          startTime: startTime,
          endTime: endTime,
        },
      })
    }
  }, [appointment, form])

  // Helper function to check if a time slot is booked
  const isTimeSlotBooked = useCallback(
    (slot: { startTime: Date; endTime: Date }) => {
      if (!bookedAppointments || bookedAppointments.length === 0) return false

      // Get the selected date from the form
      const selectedDate = form.getValues("schedule")
      if (!selectedDate) return false

      // Create a version of the slot with the correct date
      const slotWithCorrectDate = {
        startTime: new Date(selectedDate),
        endTime: new Date(selectedDate),
      }

      // Set time from the slot parameter
      slotWithCorrectDate.startTime.setHours(slot.startTime.getHours(), slot.startTime.getMinutes(), 0, 0)
      slotWithCorrectDate.endTime.setHours(slot.endTime.getHours(), slot.endTime.getMinutes(), 0, 0)

      // Current appointment ID (if editing)
      const currentAppointmentId = appointment?._id

      return bookedAppointments.some((appt) => {
        // Skip comparing with the current appointment being edited
        if (currentAppointmentId && appt._id === currentAppointmentId) return false

        // Ensure we're working with Date objects
        const apptStart = new Date(appt.timeSlot.startTime)
        const apptEnd = new Date(appt.timeSlot.endTime)

        // Check for time overlap
        return (
          (slotWithCorrectDate.startTime >= apptStart && slotWithCorrectDate.startTime < apptEnd) || // Slot starts during an appointment
          (slotWithCorrectDate.endTime > apptStart && slotWithCorrectDate.endTime <= apptEnd) || // Slot ends during an appointment
          (slotWithCorrectDate.startTime <= apptStart && slotWithCorrectDate.endTime >= apptEnd) // Slot encompasses an appointment
        )
      })
    },
    [bookedAppointments, appointment, form],
  )

  // Fetch booked appointments when doctor or date changes
  useEffect(() => {
    const fetchBookedAppointments = async () => {
      if (!primaryPhysician || !schedule) return

      try {
        let doctorId
        try {
          const doctor = JSON.parse(primaryPhysician)
          doctorId = doctor.id
        } catch (error) {
          console.error("Error parsing doctor data:", error)
          return
        }

        if (!doctorId) return

        setIsLoadingSlots(true)
        const appointmentsData = await getBookedAppointments(doctorId, schedule)
        console.log("Fetched appointments:", appointmentsData)
        setBookedAppointments(appointmentsData || [])
      } catch (error) {
        console.error("Error fetching booked appointments:", error)
        toast.error("Failed to fetch booked appointments")
        setBookedAppointments([])
      } finally {
        setIsLoadingSlots(false)
      }
    }

    fetchBookedAppointments()
  }, [primaryPhysician, schedule])

  // Helper function to format time slots consistently
  const formatTimeSlot = (startTime: Date, endTime: Date) => {
    return `${startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${endTime.toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit" },
    )}`
  }

  // Get available slots for the selected date
  const getAvailableSlotsForSelectedDate = (selectedDoctor: Doctor, selectedDate: Date) => {
    if (!selectedDoctor || !selectedDate) return []

    // Format date as YYYY-MM-DD for checking date-specific slots
    const dateString = selectedDate.toISOString().split("T")[0]

    // Check if there are date-specific slots (like holidays or special hours)
    if (selectedDoctor.dateSpecificSlots && selectedDoctor.dateSpecificSlots.has(dateString)) {
      return selectedDoctor.dateSpecificSlots.get(dateString) || []
    }

    // Otherwise use the weekly recurring schedule based on day of week
    const dayOfWeek = getDayOfWeek(selectedDate)

    // If weeklyAvailability exists and has slots for this day, use them
    if (selectedDoctor.weeklyAvailability && selectedDoctor.weeklyAvailability[dayOfWeek]) {
      return selectedDoctor.weeklyAvailability[dayOfWeek]
    }

    // Fallback to legacy availableSlots if needed
    return selectedDoctor.availableSlots || []
  }

  const onSubmit = async (values: AppointmentFormData) => {
    setIsLoading(true)

    try {
      const status = type === "schedule" ? "scheduled" : type === "cancel" ? "cancelled" : "pending"

      if (type === "create") {
        const selectedDoctor = JSON.parse(values.primaryPhysician)

        // Ensure timeSlot exists and has proper values
        let timeSlot = {
          startTime: null,
          endTime: null,
        }

        // Safely check if values.timeSlot exists and has valid startTime/endTime properties
        if (values.timeSlot && values.timeSlot.startTime && values.timeSlot.endTime) {
          timeSlot = {
            startTime: values.timeSlot.startTime,
            endTime: values.timeSlot.endTime,
          }
        } else {
          // Create a default time slot based on the schedule value
          const selectedDate = values.schedule
          const startTime = new Date(selectedDate)
          const endTime = new Date(selectedDate)
          endTime.setMinutes(endTime.getMinutes() + 30)
          timeSlot = { startTime, endTime }
        }

        const appointmentData: AppointmentData = {
          userId,
          patientId,
          patientName,
          primaryPhysician: {
            id: selectedDoctor.id,
            name: selectedDoctor.name,
          },
          reason: values.reason,
          timeSlot: timeSlot,
          status,
          isVirtual: appointmentType, // Add this line to include the appointment type
        }
        console.log("DATA :-", appointmentData)
        const newAppointment = await createAppointment(appointmentData)
        if (newAppointment) {
          form.reset()
          router.push(`/patients/${userId}/new-appointment/success?appointmentId=${newAppointment._id}`)
          toast.success("Appointment created successfully")
        }
      } else if (appointment && (type === "cancel" || type === "schedule")) {
        // For updating appointments, ensure we're using the selected time slot
        // Safely check if values.timeSlot exists before using it
        const timeSlotToUse =
          values.timeSlot && values.timeSlot.startTime && values.timeSlot.endTime
            ? values.timeSlot
            : appointment.timeSlot

        const appointmentToUpdate = {
          userId,
          appointmentId: appointment._id,
          appointment: {
            primaryPhysician: type !== "cancel" ? JSON.parse(values.primaryPhysician) : appointment.primaryPhysician,
            reason: values.reason || appointment.reason,
            timeSlot: timeSlotToUse,
            status,
            isVirtual: appointmentType, // Add this line to include the appointment type
            ...(type === "cancel" && {
              cancellationReason: values.cancellationReason,
            }),
          },
          type,
        }

        const updatedAppointment = await updateAppointment(appointmentToUpdate)
        if (updatedAppointment) {
          setOpen?.(false)
          form.reset()
          toast.success(`Appointment ${type}d successfully`)

          try {
            const user = await getUser(updatedAppointment?.userId)
            console.log("updated Appointment = ",updatedAppointment)
            const response = await fetch("/api/email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user?.email,
                name: updatedAppointment?.patientName,
                appointmentDate: updatedAppointment?.timeSlot?.startTime,
                reason: updatedAppointment?.reason,
                doctorName: updatedAppointment?.primaryPhysician?.name,
                type,
              }),
            })

            const data = await response.json()
            if (data.success) {
              toast.success("Email sent successfully")
            } else {
              toast.error("Failed to send email")
            }
          } catch (error) {
            toast.error("Error sending email")
          }
        }
      }
    } catch (error) {
      toast.error(`Failed to ${type} appointment`)
    } finally {
      setIsLoading(false)
    }
  }

  const buttonLabel =
    type === "create" ? "Book Appointment" : type === "cancel" ? "Cancel Appointment" : "Schedule Appointment"

  const handleSlotClick = (slot: { startTime: Date; endTime: Date }, isBooked: boolean) => {
    // Don't allow selection of booked slots
    if (isBooked) {
      toast.error("This time slot is already booked.")
      return
    }

    // Get the currently selected date from the form
    const selectedDate = form.getValues("schedule")
    if (!selectedDate || isNaN(selectedDate.getTime())) {
      toast.error("Please select a valid date first.")
      return
    }

    // Create new Date objects to avoid reference issues
    const startDateTime = new Date(selectedDate)
    // Set only the hours and minutes, preserving the selected date
    startDateTime.setHours(slot.startTime.getHours(), slot.startTime.getMinutes(), 0, 0)

    const endDateTime = new Date(selectedDate)
    endDateTime.setHours(slot.endTime.getHours(), slot.endTime.getMinutes(), 0, 0)

    // Update both the schedule date and the timeSlot
    form.setValue("schedule", startDateTime, { shouldValidate: true })
    form.setValue(
      "timeSlot",
      {
        startTime: startDateTime,
        endTime: endDateTime,
      },
      { shouldValidate: true },
    )

    // Update the visual time slot selector
    const timeSlotString = formatTimeSlot(startDateTime, endDateTime)
    setSelectedTimeSlot(timeSlotString)
  }

  // This function parses a time string in the format "HH:MM" and returns a Date object
  const parseTimeString = (timeString: string, baseDate: Date): Date => {
    const [hours, minutes] = timeString.split(":").map(Number)
    const result = new Date(baseDate)
    result.setHours(hours, minutes, 0, 0)
    return result
  }

  const generateTimeSlots = (startTimeStr: string, endTimeStr: string, interval: number, baseDate: Date) => {
    const slots = []

    // Parse the time strings into Date objects
    const start = parseTimeString(startTimeStr, baseDate)
    const end = parseTimeString(endTimeStr, baseDate)

    let currentSlotStart = new Date(start)

    while (currentSlotStart < end) {
      const slotEnd = new Date(currentSlotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + interval)

      // Ensure we don't create a slot that extends beyond the end time
      if (slotEnd <= end) {
        slots.push({
          startTime: new Date(currentSlotStart),
          endTime: new Date(slotEnd),
        })
      }

      // Move to the next slot start time
      currentSlotStart = new Date(slotEnd)
    }

    return slots
  }

  // Generate time slots for the selected date
  const generateTimeSlotsForSelectedDate = () => {
    try {
      if (!form.watch("primaryPhysician") || !form.watch("schedule")) return []

      const selectedDoctor = JSON.parse(form.watch("primaryPhysician"))
      const doctorData = doctors.find((doc) => doc._id === selectedDoctor.id)
      const selectedDate = form.getValues("schedule")

      if (!doctorData || !selectedDate) return []

      // Get the day of week (monday, tuesday, etc.)
      const dayOfWeek = getDayOfWeek(selectedDate)

      // If this day has no availability, return empty array
      if (
        !doctorData.weeklyAvailability ||
        !doctorData.weeklyAvailability[dayOfWeek] ||
        doctorData.weeklyAvailability[dayOfWeek].length === 0
      ) {
        return []
      }

      // Generate 30-minute slots from the available ranges for this day
      return doctorData.weeklyAvailability[dayOfWeek].flatMap((slot) =>
        generateTimeSlots(slot.startTime, slot.endTime, 30, selectedDate),
      )
    } catch (e) {
      console.error("Error generating time slots:", e)
      return []
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
        {type !== "cancel" && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-5">
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

                <CustomFormField
                  fieldType={FormFieldTypes.DATE_PICKER}
                  control={form.control}
                  name="schedule"
                  label="Expected Appointment Date"
                  placeholder="Select a Date"
                  dateFormat="MM/dd/yyyy - h:mm aa"
                />

                <CustomFormField
                  fieldType={FormFieldTypes.TEXTAREA}
                  control={form.control}
                  name="reason"
                  label="Reason for Appointment"
                  placeholder="Enter Reason"
                />

                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Appointment Type</label>
                    <div className="relative mt-1.5">
                      <div
                        className="w-full h-12 bg-[#014d3b]/30 rounded-lg cursor-pointer relative"
                        onClick={() => setAppointmentType(!appointmentType)}
                      >
                        {/* Sliding Background */}
                        <div
                          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-teal-950 border border-teal-400 rounded-md transition-all duration-300 ease-in-out ${appointmentType ? 'left-[calc(50%+4px)]' : 'left-1'
                            }`}
                        />

                        {/* Labels */}
                        <div className="absolute inset-0 flex">
                          <div className={`flex-1 flex items-center justify-center text-sm transition-colors duration-200 ${!appointmentType ? 'text-white' : 'text-teal-300'
                            }`}>
                            In-Person
                          </div>
                          <div className={`flex-1 flex items-center justify-center text-sm transition-colors duration-200 ${appointmentType ? 'text-white' : 'text-teal-300'
                            }`}>
                            Virtual
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full p-4 bg-[#012621]/50 backdrop-blur-md rounded-lg shadow-md h-full overflow-y-auto">
                <h6 className="text-teal-100 text-sm font-medium mb-3 pt-1">Available Time Slots</h6>

                {isLoadingSlots ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
                  </div>
                ) : doctors.length > 0 && form.watch("primaryPhysician") ? (
                  (() => {
                    try {
                      const selectedDoctor = JSON.parse(form.watch("primaryPhysician"))
                      const selectedDoctorData = doctors.find((doc) => doc._id === selectedDoctor.id)

                      if (!selectedDoctorData) return <p className="text-sm text-teal-400/60">Doctor data not found.</p>

                      const selectedDate = form.getValues("schedule")
                      const dayOfWeek = getDayOfWeek(selectedDate)

                      // Check if the doctor has availability on this day
                      if (
                        !selectedDoctorData.weeklyAvailability ||
                        !selectedDoctorData.weeklyAvailability[dayOfWeek] ||
                        selectedDoctorData.weeklyAvailability[dayOfWeek].length === 0
                      ) {
                        return (
                          <div className="text-center py-8">
                            <p className="text-sm text-teal-400/60">No available slots on {dayOfWeek}.</p>
                            <p className="text-xs text-teal-400/40 mt-2">Try Selecting Another Date...</p>
                          </div>
                        )
                      }

                      const timeSlots = generateTimeSlotsForSelectedDate()

                      return timeSlots.length > 0 ? (
                        <ul className="grid grid-cols-2 gap-2 cursor-pointer">
                          {timeSlots.map((slot, index) => {
                            const isBooked = isTimeSlotBooked(slot)
                            const slotTimeString = formatTimeSlot(slot.startTime, slot.endTime)
                            const isSelected = selectedTimeSlot === slotTimeString

                            return (
                              <li
                                key={index}
                                onClick={() => handleSlotClick(slot, isBooked)}
                                className={`
                                  text-sm p-2 rounded-md text-center transition-all duration-200 
                                  ${isBooked
                                    ? "bg-red-900/70 text-red-200 cursor-not-allowed"
                                    : isSelected
                                      ? "bg-teal-950 text-white border border-teal-400"
                                      : "bg-[#014d3b]/50 text-teal-300 hover:bg-teal-950/70 cursor-pointer"
                                  }
                                `}
                              >
                                {slotTimeString}
                              </li>
                            )
                          })}
                        </ul>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-sm text-teal-400/60">No available slots for this day.</p>
                          <p className="text-xs text-teal-400/40 mt-2">Try selecting a different date or doctor.</p>
                        </div>
                      )
                    } catch (e) {
                      console.error("Error rendering time slots:", e)
                      return <p className="text-sm text-teal-400/60">Error loading time slots.</p>
                    }
                  })()
                ) : (
                  <p className="text-sm text-teal-400/60">Select a doctor to view slots.</p>
                )}
              </div>
            </div>
          </>
        )}

        {type === "cancel" && (
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
          className={`${type === "cancel"
              ? "shad-danger-btn"
              : "shad-primary-btn bg-[linear-gradient(to_right,#064E4C,#024632,#013220)] border-2 border-cyan-900"
            } w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  )
}

export default AppointmentForm

