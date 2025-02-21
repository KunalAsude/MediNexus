"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { columns } from "@/components/table/columns"
import { DataTable } from "@/components/table/DataTable"
import StatCard from "@/components/ui/StatCard"
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions"
import Link from "next/link"
import Loader from "@/components/ui/Loader"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { updateDoctorAvailability } from "@/lib/actions/patient.actions"
import { Calendar, Clock, Power } from "lucide-react"
import type { AppointmentStats, Doctor } from "@/types/appwrite.types"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { setSelectedDoctor } from "@/redux/slice/doctorSlice"
import { Checkbox } from "@/components/ui/checkbox"

// Generate predefined time slots for the current day (11:00 AM to 7:00 PM in 2-hour intervals)
const generateTimeSlots = () => {
  const slots = []
  const startTime = new Date()
  startTime.setHours(11, 0, 0, 0) // Set to 11:00 AM
  const endTime = new Date()
  endTime.setHours(19, 0, 0, 0) // Set to 7:00 PM

  while (startTime < endTime) {
    const slotStart = new Date(startTime)
    const slotEnd = new Date(startTime.setHours(startTime.getHours() + 2)) // Add 2 hours
    slots.push({
      startTime: slotStart.toISOString(),
      endTime: slotEnd.toISOString(),
      label: `${slotStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${slotEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    })
  }
  return slots
}

const timeSlots = generateTimeSlots()

const Admin = () => {
  const [appointments, setAppointments] = useState<AppointmentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const selectedDoctor = useSelector((state: RootState) => state.doctor.selectedDoctor)
  const [isActive, setIsActive] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [selectAll, setSelectAll] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    const initializeDoctor = () => {
      let doctor = selectedDoctor
      if (!doctor) {
        const storedDoctor = localStorage.getItem("selectedDoctor")
        if (storedDoctor) {
          doctor = JSON.parse(storedDoctor) as Doctor
          dispatch(setSelectedDoctor(doctor))
        }
      }
      return doctor
    }

    const doctor = initializeDoctor()
    if (!doctor) return

    const savedStatus = localStorage.getItem("doctorStatus")
    const savedSlots = localStorage.getItem("selectedTimeSlots")

    setIsActive(savedStatus ? savedStatus === "active" : doctor.status === "active")
    setSelectedSlots(savedSlots ? JSON.parse(savedSlots) : doctor.availableSlots || [])
    setSelectAll(savedSlots ? JSON.parse(savedSlots).length === timeSlots.length : false)

    const fetchAppointments = async () => {
      try {
        const data = await getRecentAppointmentList(doctor)
        setAppointments(data)
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast.error("Failed to fetch appointments")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [selectedDoctor, dispatch])

  const handleStatusToggle = async () => {
    const newStatus = !isActive
    setIsActive(newStatus)
    setHasUnsavedChanges(true)
    localStorage.setItem("doctorStatus", newStatus ? "active" : "inactive")
  }

  const handleSlotChange = (slot: string) => {
    const updatedSlots = selectedSlots.includes(slot)
      ? selectedSlots.filter((s) => s !== slot) // Deselect slot
      : [...selectedSlots, slot] // Select slot
    setSelectedSlots(updatedSlots)
    setSelectAll(updatedSlots.length === timeSlots.length)
    setHasUnsavedChanges(true)
    localStorage.setItem("selectedTimeSlots", JSON.stringify(updatedSlots))
  }

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked)
    const newSlots = checked ? timeSlots.map((slot) => slot.startTime) : []
    setSelectedSlots(newSlots)
    setHasUnsavedChanges(true)
    localStorage.setItem("selectedTimeSlots", JSON.stringify(newSlots))
  }

  const handleSaveAvailability = async () => {
    if (!selectedDoctor) {
      toast.error("No doctor selected");
      return;
    }
  
    try {
      const formattedSlots = selectedSlots.map((slot) => {
        const startTime = new Date(slot);
        const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
  
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          throw new Error("Invalid date format");
        }
  
        return { startTime, endTime };
      });
  
      const response = await updateDoctorAvailability(selectedDoctor, isActive, formattedSlots);
  
      if (response.success) {
        toast.success("Availability updated successfully");
        localStorage.setItem("doctorStatus", isActive ? "active" : "inactive");
        localStorage.setItem("selectedTimeSlots", JSON.stringify(selectedSlots));
        setHasUnsavedChanges(false);
      } else {
        toast.error("Failed to update availability");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };
  
  
  

  if (loading) {
    return <Loader />
  }

  if (!appointments) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-600">No appointment data available</p>
      </div>
    )
  }

  return (
      <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
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
            <p className="text-muted-foreground mt-1">Manage your appointments and availability</p>
          </div>

          <Card className="shadow-sm border-0">
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-teal-600" />
                <h3 className="text-lg font-semibold">Availability Settings</h3>
              </div>


              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-4 border-0 bg-appointments">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="active-status" className="text-base font-medium">
                        Status
                      </Label>
                      <p className="text-sm text-muted-foreground">Set your availability</p>
                    </div>
                    <div className="flex-1 flex justify-end">
                      <Switch
                        id="active-status"
                        checked={isActive}
                        onCheckedChange={handleStatusToggle}
                        className="w-16 h-8 rounded-full transition-colors duration-300 
                          data-[state=checked]:bg-green-700 data-[state=unchecked]:bg-red-500"
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-0 bg-appointments">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-teal-600" />
                      <Label className="text-base font-medium">Time Slots</Label>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="select-all"
                          checked={selectAll}
                          onCheckedChange={handleSelectAllChange}
                          className="border-teal-700"
                        />
                        <label
                          htmlFor="select-all"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {selectAll ? "All Selected" : "Select All"}
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {timeSlots.map((slot) => (
                          <div
                            key={slot.startTime}
                            className="flex items-center space-x-2 p-2 border-0 rounded-lg cursor-pointer hover:bg-teal-700  transition-colors"
                            onClick={() => handleSlotChange(slot.startTime)}
                          >
                            <Checkbox
                              checked={selectedSlots.includes(slot.startTime)}
                              onCheckedChange={() => handleSlotChange(slot.startTime)}
                              className="border-teal-700 "
                            />
                            <Label>{slot.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-0 bg-appointments">
                  <div className="h-full flex flex-col justify-between">
                    <Label className="text-base font-medium">Save Changes</Label>
                    <Button
                      className="w-full bg-teal-700 hover:bg-teal-700 text-white mt-2"
                      onClick={handleSaveAvailability}
                      disabled={!hasUnsavedChanges}
                    >
                      Update Availability
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
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

          <Card className="p-6 shadow-sm border-0">
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