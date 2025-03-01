"use client"
import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/redux/store";
import { columns } from "@/components/table/columns"
import { DataTable } from "@/components/table/DataTable"
import StatCard from "@/components/ui/StatCard"
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions"
import Link from "next/link"
import Loader from "@/components/ui/Loader"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { updateDoctorAvailability, getDoctorById } from "@/lib/actions/patient.actions"
import { Calendar, Check, Clock, Copy, Power } from "lucide-react"
import type { AppointmentStats, Doctor } from "@/types/appwrite.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { setSelectedDoctor } from "@/redux/slice/doctorSlice"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { set } from "mongoose"
import { get } from "http"

// Generate predefined time slots (11:00 AM to 7:00 PM in 2-hour intervals)
const generateTimeSlots = () => {
  const slots = []
  const startHour = 11 // 11:00 AM
  const endHour = 19 // 7:00 PM
  const intervalHours = 2

  for (let hour = startHour; hour < endHour; hour += intervalHours) {
    const slotStart = new Date()
    slotStart.setHours(hour, 0, 0, 0)

    const slotEnd = new Date()
    slotEnd.setHours(hour + intervalHours, 0, 0, 0)

    slots.push({
      startTime: `${hour.toString().padStart(2, "0")}:00`,
      endTime: `${(hour + intervalHours).toString().padStart(2, "0")}:00`,
      label: `${slotStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${slotEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    })
  }
  return slots
}

const timeSlots = generateTimeSlots()
const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const dayLabels = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
}

// Helper function to normalize time string format (ensure HH:MM format)
const normalizeTimeString = (timeStr) => {
  if (!timeStr) return null;

  // If it's a Date object, convert it to HH:MM string
  if (timeStr instanceof Date) {
    return `${timeStr.getHours().toString().padStart(2, "0")}:${timeStr.getMinutes().toString().padStart(2, "0")}`;
  }

  // If it's already a string in the expected format, return it
  if (typeof timeStr === 'string' && /^\d{2}:\d{2}$/.test(timeStr)) {
    return timeStr;
  }

  // Try to parse as a date string
  try {
    const date = new Date(timeStr);
    if (!isNaN(date.getTime())) {
      return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    }
  } catch (e) {
    throw new error("Error parsing time:", e);
  }

  return null;
};

// Helper function to convert date objects to time string format
const dateToTimeString = (date) => {
  return normalizeTimeString(date);
}

// Helper function to parse stored weekly availability
const parseWeeklyAvailability = (doctorData) => {
  const initialWeeklyAvailability = {};



  // First check if doctor has structured weeklyAvailability
  if (doctorData.weeklyAvailability && Object.keys(doctorData.weeklyAvailability).length > 0) {

    // Process each day's slots
    daysOfWeek.forEach((day) => {
      const daySlots = doctorData.weeklyAvailability[day] || [];

      // Convert the date objects to normalized time strings
      initialWeeklyAvailability[day] = daySlots.map((slot) => {
        return {
          startTime: normalizeTimeString(slot.startTime) || "00:00",
          endTime: normalizeTimeString(slot.endTime) || "00:00",
          isBooked: !!slot.isBooked
        };
      });
    });
  }
  // Otherwise, create default structure from legacy availableSlots
  else {
    daysOfWeek.forEach((day) => {
      initialWeeklyAvailability[day] = [];
    });

    // If there are legacy slots, add them to Monday as default
    if (doctorData.availableSlots && doctorData.availableSlots.length > 0) {
      initialWeeklyAvailability.monday = doctorData.availableSlots.map((slot) => {
        return {
          startTime: normalizeTimeString(slot.startTime) || "00:00",
          endTime: normalizeTimeString(slot.endTime) || "00:00",
        };
      });
    }
  }

  // If there are booked slots, ensure they are also included in the weeklyAvailability
  if (doctorData.bookedSlots && doctorData.bookedSlots.length > 0) {
    doctorData.bookedSlots.forEach((bookedSlot) => {
      // Determine which day this booked slot belongs to
      const slotDate = new Date(bookedSlot.date);
      const dayIndex = slotDate.getDay(); // 0 is Sunday, 1 is Monday, etc.
      const dayName = daysOfWeek[dayIndex === 0 ? 6 : dayIndex - 1]; // Adjust for our day array

      const startTime = normalizeTimeString(bookedSlot.startTime);
      const endTime = normalizeTimeString(bookedSlot.endTime);


      if (startTime && endTime) {
        // Check if this slot is already included in the day's availability
        const isSlotIncluded = (initialWeeklyAvailability[dayName] || []).some(
          (slot) => normalizeTimeString(slot.startTime) === startTime && normalizeTimeString(slot.endTime) === endTime
        );

        // If not already included, add it
        if (!isSlotIncluded) {
          if (!initialWeeklyAvailability[dayName]) {
            initialWeeklyAvailability[dayName] = [];
          }

          initialWeeklyAvailability[dayName].push({
            startTime,
            endTime,
            isBooked: true
          });

        } else {
          throw new error(`Slot already exists in ${dayName}`);
        }
      }
    });
  }

  return initialWeeklyAvailability;
}

const Admin = () => {
  const [appointments, setAppointments] = useState<AppointmentStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [doctorLoading, setDoctorLoading] = useState(true)
  const selectedDoctor = useSelector((state: RootState) => state.doctor?.selectedDoctor ?? null);
  const [isActive, setIsActive] = useState(false)
  const [weeklyAvailability, setWeeklyAvailability] = useState<Record<string, any>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [activeDay, setActiveDay] = useState("monday")
  const [doctorId, setDoctorId] = useState(selectedDoctor);
  const dispatch = useDispatch()


  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!doctorId) return;

      setDoctorLoading(true);
      try {
        const freshDoctorData = await getDoctorById(doctorId || freshDoctorData?._id);

        if (freshDoctorData) {
          setIsActive(freshDoctorData.status === "active");
          setWeeklyAvailability(parseWeeklyAvailability(freshDoctorData));
          localStorage.setItem("selectedDoctor", JSON.stringify(freshDoctorData));
        }

        // Fetch recent appointments
        try {
          const validDoctorId = doctorId || freshDoctorData?._id;

          if (validDoctorId) {
            const data = await getRecentAppointmentList(validDoctorId);
            setAppointments(data);
          }

        } catch (error) {
          throw new error("Error fetching appointments:", error);
          toast.error("Failed to fetch appointments");
        }
      } catch (error) {
        throw new error("Error initializing doctor data:", error);
        toast.error("Failed to load doctor data");
      } finally {
        setLoading(false);
        setDoctorLoading(false);
      }
    };

    fetchDoctorData();
  }, []);


  const handleStatusToggle = () => {
    const newStatus = !isActive
    setIsActive(newStatus)
    setHasUnsavedChanges(true)
  }

  const handleSlotChange = (day: string, slotTime: string) => {
    const daySlots = [...(weeklyAvailability[day] || [])]

    // Check if this slot exists in the day's slots
    const slotIndex = daySlots.findIndex((slot) => normalizeTimeString(slot.startTime) === normalizeTimeString(slotTime))

    if (slotIndex >= 0) {
      // Remove the slot
      daySlots.splice(slotIndex, 1)
    } else {
      // Add the slot
      const timeSlot = timeSlots.find((slot) => slot.startTime === slotTime)
      if (timeSlot) {
        daySlots.push({
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
        })
      }
    }

    setWeeklyAvailability({
      ...weeklyAvailability,
      [day]: daySlots,
    })

    setHasUnsavedChanges(true)
  }

  const isSlotSelected = (day: string, slotTime: string) => {
    const daySlots = weeklyAvailability[day] || [];
    const normalizedSlotTime = normalizeTimeString(slotTime);

    const result = daySlots.some((slot) => normalizeTimeString(slot.startTime) === normalizedSlotTime);


    return result;
  }

  const handleSelectAllForDay = (day: string, checked: boolean) => {
    const updatedAvailability = { ...weeklyAvailability }

    if (checked) {
      // Select all slots for the day
      updatedAvailability[day] = timeSlots.map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      }))
    } else {
      // Deselect all slots for the day
      updatedAvailability[day] = []
    }

    setWeeklyAvailability(updatedAvailability)
    setHasUnsavedChanges(true)
  }

  const areAllSlotsSelectedForDay = (day: string) => {
    return (weeklyAvailability[day] || []).length === timeSlots.length
  }

  const handleCopyFromPreviousDay = () => {
    const dayIndex = daysOfWeek.indexOf(activeDay)
    if (dayIndex <= 0) return // Can't copy if it's the first day

    const previousDay = daysOfWeek[dayIndex - 1]
    const previousDaySlots = weeklyAvailability[previousDay] || []

    setWeeklyAvailability({
      ...weeklyAvailability,
      [activeDay]: [...previousDaySlots],
    })

    setHasUnsavedChanges(true)
    toast.success(`Copied slots from ${dayLabels[previousDay]}`)
  }

  const handleSaveAvailability = async () => {
    if (!selectedDoctor) {
      toast.error("No doctor selected")
      return
    }

    try {
      // Make sure we're passing the correct doctor ID format
      const doctorId = selectedDoctor// Use the correct ID property

      // Convert the weekly availability to the format expected by the API
      const formattedWeeklyAvailability = { ...weeklyAvailability }

      // Send the doctorId string directly without trying to convert it to ObjectId
      // The conversion should happen server-side in the API function
      const response = await updateDoctorAvailability(
        doctorId, // Send just the ID string
        isActive,
        [], // Empty array for legacy availableSlots (phasing out)
        formattedWeeklyAvailability
      )

      if (response.success) {
        toast.success("Availability updated successfully")
        setHasUnsavedChanges(false)
          const DoctorData = await getDoctorById(doctorId)
          console.log("Fresh doctor data:", DoctorData)
          if (DoctorData) {
            setIsActive(DoctorData.status === "active");
            setWeeklyAvailability(parseWeeklyAvailability(DoctorData));
          }
       else {
        toast.error(`Failed to update availability: ${response.message || "Unknown error"}`)
      }
    }} catch (error) {
      throw new errorr("Error updating availability:", error)
      toast.error("Something went wrong")
    }
  }

  if (loading || doctorLoading) {
    return <Loader />
  }

  // if (!selectedDoctor) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <p className="text-lg text-gray-600">No doctor data available</p>
  //     </div>
  //   )
  // }

  if (!appointments) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">No appointment data available</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full px-2 sm:px-6 lg:px-3 py-6 space-y-8">
      <header className="admin-header">
        <Link href="/dashboard" className="cursor-pointer">
          <div className="flex flex-row align-middle">
            <img
              src="https://img.icons8.com/arcade/64/hospital.png"
              alt="MediNexus Logo"
              height="100px"
              width="100px"
              className="h-10 w-fit"
            />
            <div className="text-lg font-bold flex items-center justify-center text-teal-500">MediNexus</div>
          </div>
        </Link>
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors duration-300 ${isActive ? "bg-green-700" : "bg-red-700"
              }`}
            onClick={handleStatusToggle}
          >
            <Power className={`h-4 w-4 ${isActive ? "text-green-200" : "text-red-200"}`} />
            <span className="text-sm font-medium text-white">{isActive ? "Active" : "Inactive"}</span>
          </div>
        </div>
      </header>

      <main className="space-y-8">
        <div className="bg-teal-950 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-300">Welcome</h2>
          <p className="text-muted-foreground mt-1">Manage your appointments and weekly availability</p>
        </div>

        {/* Weekly Availability Settings */}
        <Card className="shadow-md border border-gray-900 overflow-hidden">
          <CardHeader className=" px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-400" />
                <CardTitle className="text-lg font-medium text-white">Weekly Availability</CardTitle>
              </div>
              <Badge
                variant="outline"
                className={`${isActive ? "bg-teal-600 text-white border-0 " : "bg-red-700 text-white border-0 "
                  } px-3 py-2 hidden lg:block`}
              >
                {isActive ? "Available" : "Unavailable"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row">
              {/* Left sidebar */}
              <div className="w-full lg:w-64 p-5 border-r border-gray-900 lg:min-h-[300px]">
                <div className="space-y-6">
                  {/* Save button */}
                  <div className="pt-3 border-t border-gray-900">
                    <Button
                      className={`w-full ${hasUnsavedChanges
                        ? "bg-teal-600 hover:bg-teal-700"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed hover:bg-gray-600"
                        }`}
                      onClick={handleSaveAvailability}
                      disabled={!hasUnsavedChanges}
                    >
                      {hasUnsavedChanges ? "Save Changes" : "No Changes"}
                    </Button>

                    {hasUnsavedChanges && (
                      <p className="text-amber-400 text-xs mt-2 flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                        You have unsaved changes
                      </p>
                    )}
                  </div>

                  {/* Tips */}
                  <div className="pt-3 border-t border-gray-900">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Tips</h3>
                    <ul className="space-y-2 text-xs text-gray-300">
                      <li className="flex items-start gap-2">
                        <div className="text-teal-400 rounded-full w-4 h-4 flex items-center justify-center text-[10px] mt-0.5 flex-shrink-0">
                          1
                        </div>
                        <span>Select time slots for each day you're available</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="text-teal-400 rounded-full w-4 h-4 flex items-center justify-center text-[10px] mt-0.5 flex-shrink-0">
                          2
                        </div>
                        <span>Use "Select All" to quickly choose all slots</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="text-teal-400 rounded-full w-4 h-4 flex items-center justify-center text-[10px] mt-0.5 flex-shrink-0">
                          3
                        </div>
                        <span>Copy schedule from previous days to save time</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1">
                <Tabs defaultValue="monday" value={activeDay} onValueChange={setActiveDay} className="w-full">
                  <div className="border-b border-gray-900">
                    <TabsList className="flex w-full rounded-none bg-black-800 p-0">
                      {daysOfWeek.map((day) => (
                        <TabsTrigger
                          key={day}
                          value={day}
                          className="flex-1 rounded-none border-b-2 border-transparent py-3 text-sm font-medium text-gray-300
                    data-[state=active]:border-teal-600 data-[state=active]:text-teal-200 data-[state=active]:bg-black-800"
                        >
                          {dayLabels[day].substring(0, 3)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <div className="p-6">
                    {daysOfWeek.map((day) => (
                      <TabsContent key={day} value={day} className="m-0 pt-0">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`select-all-${day}`}
                                checked={areAllSlotsSelectedForDay(day)}
                                onCheckedChange={(checked) => handleSelectAllForDay(day, !!checked)}
                                className="border-teal-400 data-[state=checked]:bg-teal-400"
                              />
                              <Label
                                htmlFor={`select-all-${day}`}
                                className="text-sm font-medium leading-none cursor-pointer text-teal-400"
                              >
                                {areAllSlotsSelectedForDay(day) ? "All Selected" : "Select All"}
                              </Label>
                            </div>

                            <Badge variant="outline" className="bg-black-800 h-8 text-teal-400 border-teal-600">
                              {(weeklyAvailability[day] || []).length} slot
                              {(weeklyAvailability[day] || []).length !== 1 ? "s" : ""} selected
                            </Badge>
                          </div>

                          {day !== "monday" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCopyFromPreviousDay}
                              className="text-xs flex items-center gap-1 border-teal-200 text-teal-400 hover:bg-teal-50"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span>
                                Copy from {dayLabels[daysOfWeek[daysOfWeek.indexOf(day) - 1]].substring(0, 3)}
                              </span>
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {timeSlots.map((slot) => (
                            <div
                              key={`${day}-${slot.startTime}`}
                              className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all
                        ${isSlotSelected(day, slot.startTime)
                                  ? "bg-teal-950 border border-teal-200"
                                  : "bg-teal-800 border border-gray-600 hover:bg-teal-900"
                                }`}
                              onClick={() => handleSlotChange(day, slot.startTime)}
                            >
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                          ${isSlotSelected(day, slot.startTime)
                                    ? "bg-teal-600 text-white"
                                    : "bg-black-800 border border-gray-600"
                                  }`}
                              >
                                {isSlotSelected(day, slot.startTime) && <Check className="h-3 w-3" />}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock
                                  className={`h-3.5 w-3.5 ${isSlotSelected(day, slot.startTime) ? "text-white" : "text-white"}`}
                                />
                                <Label
                                  className={`text-sm cursor-pointer ${isSlotSelected(day, slot.startTime) ? "font-medium text-white" : "text-white"}`}
                                >
                                  {slot.label}
                                </Label>
                              </div>
                            </div>
                          ))}
                        </div>

                        {(weeklyAvailability[day] || []).length === 0 && (
                          <div className="mt-5 p-4 shadow-md border-0 rounded-md text-amber-400  text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            No time slots selected for {dayLabels[day]}. You will not be available for appointments on
                            this day.
                          </div>
                        )}
                      </TabsContent>
                    ))}
                  </div>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            type="appointments"
            count={appointments.scheduledCount}
            label="Scheduled Appointments"
            icon="/assets/icons/appointments.svg"
          />
          <StatCard
            type="pending"
            count={appointments.pendingCount}
            label="Pending Appointments"
            icon="/assets/icons/pending.svg"
          />
          <StatCard
            type="appointments"
            count={appointments.cancelledCount}
            label="Cancelled Appointments"
            icon="/assets/icons/cancelled.svg"
          />
        </div>

        <Card className="p-3 lg:p-3 shadow-sm border-0">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold">Recent Appointments</h3>
          </div>
          <div className="overflow-hidden rounded-lg border-0">
            <DataTable columns={columns} data={appointments.documents} />
          </div>
        </Card>
      </main>
    </div>
  )
}

export default Admin