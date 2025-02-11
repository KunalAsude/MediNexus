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
import { Calendar, Clock, Power, X } from "lucide-react"
import type { AppointmentStats, Doctor } from "@/types/appwrite.types"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { setSelectedDoctor } from "@/redux/slice/doctorSlice"

const timeSlotOptions = ["11:30 AM - 1:30 PM", "2:00 PM - 4:00 PM", "5:00 PM - 7:00 PM"] as const

const Admin = () => {
  const [appointments, setAppointments] = useState<AppointmentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const selectedDoctor = useSelector((state: RootState) => state.doctor.selectedDoctor)
  const [isActive, setIsActive] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false) // Added state for unsaved changes
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

    // Load saved preferences from localStorage
    const savedStatus = localStorage.getItem("doctorStatus")
    const savedSlots = localStorage.getItem("selectedTimeSlots")

    setIsActive(savedStatus ? savedStatus === "active" : doctor.status === "active")
    setSelectedSlots(savedSlots ? JSON.parse(savedSlots) : doctor.availableSlots || [])

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
    setHasUnsavedChanges(true) // Set unsaved changes to true
    localStorage.setItem("doctorStatus", newStatus ? "active" : "inactive")
  }

  const toggleTimeSlot = (slot: string) => {
    setSelectedSlots((prev) => {
      const updatedSlots = prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]

      localStorage.setItem("selectedTimeSlots", JSON.stringify(updatedSlots))
      setHasUnsavedChanges(true) // Set unsaved changes to true
      return updatedSlots
    })
  }

  const handleSaveAvailability = async () => {
    if (!selectedDoctor) {
      toast.error("No doctor selected")
      return
    }

    try {
      const response = await updateDoctorAvailability(selectedDoctor, isActive, selectedSlots)
      if (response.success) {
        toast.success("Availability updated successfully")

        localStorage.setItem("doctorStatus", isActive ? "active" : "inactive")
        localStorage.setItem("selectedTimeSlots", JSON.stringify(selectedSlots))
        setHasUnsavedChanges(false) // Set unsaved changes to false after successful update
      } else {
        toast.error("Failed to update availability")
      }
    } catch (error) {
      console.error("Error updating availability:", error)
      toast.error("Something went wrong")
    }
  }

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
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
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
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors duration-300 ${
                isActive ? "bg-green-700" : "bg-red-700"
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
                    <div className="flex flex-wrap gap-2 justify-center align-middle">
                      {timeSlotOptions.map((slot) => (
                        <Badge
                          key={slot}
                          variant={selectedSlots.includes(slot) ? "default" : "outline"}
                          className={`cursor-pointer p-2 bg-teal-600 hover:bg-teal-800 border-0 ${
                            selectedSlots.includes(slot) ? "bg-teal-800 hover:bg-teal-700" : "bg-transparent"
                          }`}
                          onClick={() => toggleTimeSlot(slot)}
                        >
                          {slot}
                          {selectedSlots.includes(slot) && <X className="ml-1 h-3 w-3" />}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border-0 bg-appointments">
                  <div className="h-full flex flex-col justify-between">
                    <Label className="text-base font-medium">Save Changes</Label>
                    <Button
                      className="w-full bg-teal-700 hover:bg-teal-700 text-white mt-2"
                      onClick={handleSaveAvailability}
                      disabled={!hasUnsavedChanges} // Added disabled prop
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
    </div>
  )
}

export default Admin

