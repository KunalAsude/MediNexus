"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  AlertTriangle,
  Heart,
  ArrowLeft,
  FileText,
  Shield,
  Pill,
  Video,
  Copy,
  MapPin,
  CheckCircle,
  XCircle,
  Clock4,
  X,
  Briefcase,
  CreditCard,
  User,
  Download,
} from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "@/hooks/use-toast"
import { getRegisteredPatient, getUser } from "@/lib/actions/patient.actions"
import { useParams } from "next/navigation"
import { cancelAppointment, getPrescription, getPrescriptionByAppointmentId, getUserAppointments } from "@/lib/actions/appointment.actions"
import axios from "axios"
import AppointmentModal from "@/components/ui/AppointmentModal"
import { CancellationModal } from "@/components/ui/cancellation-modal"
import { generatePrescriptionPDF } from "@/lib/actions/prescriptionPdfGenerator"

// Appointment Card Component
function AppointmentCard({
  appointment,
  formatDate,
  formatTime,
  copyMeetingLink,
  onManageVirtual,
  onCancel,
  onDownloadPrescription,
  isPast = false,
}) {
  return (
    <div className="bg-teal-900/50 p-4 rounded-lg border border-teal-900 text-white">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left side with doctor info */}
        <div className="flex items-start gap-3">
          <div className="bg-teal-900 p-2 rounded-lg flex-shrink-0">
            <Calendar className="h-5 w-5 text-teal-300" />
          </div>
          <div>
            <h3 className="font-medium">{appointment?.primaryPhysician?.name || "Doctor"}</h3>
            <p className="text-sm text-teal-300">{appointment?.reason || "Consultation"}</p>
            <div className="flex items-center mt-1 text-xs text-teal-200">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(appointment?.timeSlot?.startTime)}
              <Clock className="h-3 w-3 ml-3 mr-1" />
              {formatTime(appointment?.timeSlot?.startTime)} - {formatTime(appointment?.timeSlot?.endTime)}
            </div>
          </div>
        </div>

        {/* Right side with status and actions */}
        <div className="flex flex-col items-end">
          {" "}
          {/* Added items-end to align everything to the right */}
          <div className="flex flex-wrap gap-2 justify-end">
            {" "}
            {/* Added justify-end for badge alignment */}
            {appointment?.status === "scheduled" && (
              <Badge className={`${appointment.isVirtual ? "bg-blue-600" : "bg-green-600"} border-none`}>
                {appointment.isVirtual ? "Virtual" : "In-Person"}
              </Badge>
            )}
            {appointment?.status === "completed" && <Badge className="bg-green-600 border-none">Completed</Badge>}
            {appointment?.status === "cancelled" && <Badge className="bg-red-600 border-none">Cancelled</Badge>}
          </div>
          {/* Show cancellation reason if cancelled - aligned right */}
          {appointment?.status === "cancelled" && appointment.cancellationReason && (
            <p className="text-xs text-red-300 text-right mt-1">Reason: {appointment.cancellationReason}</p>
          )}
          {/* Action buttons - only show for scheduled appointments that aren't in the past */}
          {appointment?.status === "scheduled" && !isPast && (
            <div className="flex flex-wrap gap-2 mt-2 justify-end">
              {" "}
              {/* Added justify-end for button alignment */}
              {appointment.isVirtual && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-teal-800 hover:bg-teal-900 border-none text-white h-8"
                  onClick={() => copyMeetingLink(appointment.meetingLink)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Link
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="bg-teal-800 hover:bg-teal-900 border-none text-white h-8"
                onClick={() => onManageVirtual(appointment)}
              >
                <Video className="h-3 w-3 mr-1" />
                Join Meeting
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-800/70 hover:bg-red-900 border-none text-white h-8"
                onClick={() => onCancel(appointment)}
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          )}
          {isPast && appointment?.status !== "cancelled" && (
            <div className="flex flex-wrap gap-2 mt-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-800/70 hover:bg-blue-900 border-none text-white h-8"
                onClick={() => onDownloadPrescription && onDownloadPrescription(appointment)}  
              >
                <Download className="h-3 w-3 mr-1" />
                Download Prescription
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default function PatientProfile() {
  const [isVirtual, setIsVirtual] = useState(false)
  const [meetingLink, setMeetingLink] = useState("")
  const [virtualMeetingModal, setVirtualMeetingModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)

  // Cancel appointment modal
  const [cancelModal, setCancelModal] = useState(false)
  const [cancellationReason, setCancellationReason] = useState("")
  const params = useParams()
  const userId = params?.id

  // Fetch patient data and appointments
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setIsLoading(true)
        const response = await getUser(userId)
        if (response) {
          const patientData = await getRegisteredPatient(response._id)
          setPatient(patientData)

          if (patientData?.userId) {
            const appointmentData = await getUserAppointments(patientData.userId)
            setAppointments(appointmentData?.documents || [])
          }
        }
      } catch (error) {
        console.error("Error fetching patient data:", error)
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchPatient()
    }
  }, [userId])

  const joinMeeting = (appointment) => {
    if (appointment?.meetingLink) {
      window.open(appointment.meetingLink, "_blank")
    } else {
      toast({
        title: "Error",
        description: "Meeting link is not available for this appointment",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPrescription = async (appointment) => {
    try {
      setIsLoading(true)

      console.log("appointment - ", appointment?._id)
      const response = await getPrescriptionByAppointmentId(appointment?._id)
      console.log("res - ", response.data)
      let pdf =await generatePrescriptionPDF(response?.data)
      console.log(pdf)

      

      toast({
        title: "Success",
        description: "Prescription downloaded successfully",
      })
    } catch (error) {
      console.error("Error downloading prescription:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to download prescription",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "Invalid date"
    }
  }

  // Format time helper function
  const formatTime = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Invalid time"
    }
  }

  // Copy meeting link to clipboard
  const copyMeetingLink = (link) => {
    navigator.clipboard.writeText(link || "")
    toast({
      title: "Success",
      description: "Meeting link copied to clipboard",
    })
  }

  // Handle update appointment type
  const handleUpdateAppointmentType = async () => {
    if (!selectedAppointment) return

    setIsLoading(true)

    try {
      await axios.patch(`/api/appointments/${selectedAppointment._id}`, {
        isVirtual,
        meetingLink: isVirtual ? meetingLink : null,
      })

      // Update the local state
      setAppointments(
        appointments.map((app) =>
          app._id === selectedAppointment._id
            ? { ...app, isVirtual, meetingLink: isVirtual ? meetingLink : null }
            : app,
        ),
      )

      toast({
        title: "Success",
        description: "Appointment updated successfully",
      })

      setVirtualMeetingModal(false)
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle cancel appointment
  //   const handleCancelAppointment = async () => {
  //     if (!selectedAppointment) return

  //     setIsLoading(true)

  //     try {
  //       // Replace with your actual API endpoint
  //       await axios.patch(`/api/appointments/${selectedAppointment._id}`, {
  //         status: "cancelled",
  //         cancellationReason,
  //       })

  //       const response = await getUserAppointments(selectedAppointment.userId)

  //       // Update the local state
  //       setAppointments(
  //         appointments.map((app) =>
  //           app._id === selectedAppointment._id ? { ...app, status: "cancelled", cancellationReason } : app,
  //         ),
  //       )

  //       toast({
  //         title: "Success",
  //         description: "Appointment cancelled successfully",
  //       })

  //       setCancelModal(false)
  //       setCancellationReason("")
  //     } catch (error) {
  //       console.error("Error cancelling appointment:", error)
  //       toast({
  //         title: "Error",
  //         description: "Failed to cancel appointment",
  //         variant: "destructive",
  //       })
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }

  // Join meeting or open virtual meeting modal
  const openVirtualMeetingModal = (appointment) => {
    if (appointment.isVirtual && appointment.meetingLink) {
      joinMeeting(appointment)
    } else {
      setSelectedAppointment(appointment)
      setIsVirtual(appointment.isVirtual)
      setMeetingLink(appointment.meetingLink || "")
      setVirtualMeetingModal(true)
    }
  }

  // Open cancel appointment modal
  const openCancelModal = (appointment) => {
    setSelectedAppointment(appointment)
    setCancellationReason("")
    setCancelModal(true)
  }

  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter((appointment) => {
    if (!appointment?.timeSlot?.startTime) return false

    const appointmentDate = new Date(appointment.timeSlot.startTime)
    const today = new Date()

    switch (activeTab) {
      case "upcoming":
        return appointment.status === "scheduled" && appointmentDate > today
      case "past":
        return appointment.status === "completed" || (appointmentDate < today && appointment.status !== "cancelled")
      case "cancelled":
        return appointment.status === "cancelled"
      default:
        return true
    }
  })

  const cancel = async (appointment, reason) => {
    try {
      setIsLoading(true)
      console.log("Appointment and reason - ", appointment, reason)

      // You should be using the appointment ID directly
      const cancelResponse = await cancelAppointment(appointment._id, reason)
      console.log(cancelResponse)

      setAppointments(
        appointments.map((app) =>
          app._id === appointment._id ? { ...app, status: "cancelled", cancellationReason: reason } : app,
        ),
      )

      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      })

      setCancelModal(false)
      setCancellationReason("")
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-teal-950">
        <div className="text-white text-center">
          <Clock4 className="h-12 w-12 mx-auto mb-3 animate-spin text-teal-300" />
          <p>Loading patient data...</p>
        </div>
      </div>
    )
  }

  // Error state - no patient found
  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-teal-950">
        <div className="text-white text-center max-w-md p-6">
          <XCircle className="h-12 w-12 mx-auto mb-3 text-red-400" />
          <h2 className="text-xl font-bold mb-2">Patient Not Found</h2>
          <p className="mb-4">The patient profile you're looking for could not be found or may have been removed.</p>
          <Link href="/admin">
            <Button className="bg-teal-700 hover:bg-teal-600">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-background">
      <header className="p-6 bg-teal-950">
        <Link href="/" className="text-teal-300 flex items-center mb-3 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-white">Patient Profile</h1>
          <div className="flex gap-3 mt-3 sm:mt-0">
            {/* <Button
              variant="outline"
              className="border-0 py-4 text-sm bg-teal-900 hover:bg-teal-800 text-white shadow-xl hover:shadow-xl transition-all duration-100 
              rounded-lg px-4 transform hover:scale-105 flex items-center justify-center gap-2"
              onClick={() => {
                // Just open the dialog without an appointment selected
                setSelectedAppointment(null)
                setVirtualMeetingModal(true)
              }}
            >
              <Video className="h-4 w-4" />
              Join Meeting
            </Button> */}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-6">
        {/* Sidebar - Patient Info */}
        <div className="lg:col-span-3 space-y-4">
          {/* Patient Profile Card */}
          <Card className="shadow-lg bg-gradient-to-br from-teal-950 to-teal-950 border-0">
            <CardHeader className="bg-gradient-to-r from-teal-950 to-teal-950 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white font-medium">Patient Profile</CardTitle>
                <Badge className="bg-gray-900 px-2 py-2 text-teal-50 font-medium border-none">
                  {patient?.gender?.charAt(0).toUpperCase() + patient?.gender?.slice(1) || "Unknown"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-5">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-teal-900">
                <Avatar className="w-16 h-16 bg-teal-900">
                  <AvatarFallback className="text-white">{patient?.name?.charAt(0) || "P"}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold text-white">{patient?.name || "Unknown"}</h2>
                  <p className="text-teal-300">{patient?.age || "?"} years old</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center text-white">
                  <Phone className="h-4 w-4 text-teal-300 mr-3 flex-shrink-0" />
                  <span className="truncate">{patient?.phone || "No phone"}</span>
                </div>

                <div className="flex items-center text-white">
                  <Mail className="h-4 w-4 text-teal-300 mr-3 flex-shrink-0" />
                  <span className="truncate">{patient?.email || "No email"}</span>
                </div>

                <div className="flex items-center text-white">
                  <MapPin className="h-4 w-4 text-teal-300 mr-3 flex-shrink-0" />
                  <span className="truncate">{patient?.address || "No address"}</span>
                </div>

                <div className="flex items-center text-white">
                  <Briefcase className="h-4 w-4 text-teal-300 mr-3 flex-shrink-0" />
                  <span className="truncate">{patient?.occupation || "No occupation listed"}</span>
                </div>

                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-teal-300 mr-3 mt-1 flex-shrink-0" />
                  <div className="text-white">
                    <p className="font-medium">Emergency Contact</p>
                    <p className="text-sm text-teal-300 mt-1">{patient?.emergencyContactName || "None"}</p>
                    <p className="text-sm text-teal-300 mt-1">{patient?.emergencyContactNumber || "None"}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FileText className="h-4 w-4 text-teal-300 mr-3 mt-1 flex-shrink-0" />
                  <div className="text-white">
                    <p className="font-medium">Identification</p>
                    <p className="text-sm text-teal-300 mt-1">
                      {patient?.identificationType || "ID"}: {patient?.identificationNumber || "None"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Information Card */}
          <Card className="shadow-lg bg-gradient-to-br from-teal-950 to-teal-950 border-0">
            <CardHeader className="bg-gradient-to-r from-teal-950 to-teal-950 pb-3">
              <CardTitle className="text-white font-medium">Insurance Details</CardTitle>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="space-y-4 text-white">
                <div className="flex items-start">
                  <Shield className="h-4 w-4 text-teal-300 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Provider</p>
                    <p className="text-sm text-teal-300">{patient?.insuranceProvider || "None registered"}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CreditCard className="h-4 w-4 text-teal-300 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Policy Number</p>
                    <p className="text-sm text-teal-300">{patient?.insurancePolicyNumber || "N/A"}</p>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm" className="bg-teal-900 hover:bg-teal-800 border-none text-white">
                    View Full Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User ID Information */}
          <Card className="shadow-lg bg-gradient-to-br from-teal-950 to-teal-950 border-0">
            <CardHeader className="bg-gradient-to-r from-teal-950 to-teal-950 pb-3">
              <CardTitle className="text-white font-medium">System Information</CardTitle>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="space-y-4 text-white">
                <div className="flex items-start">
                  <User className="h-4 w-4 text-teal-300 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">User ID</p>
                    <p className="text-sm text-teal-300 break-all">{patient?.userId || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FileText className="h-4 w-4 text-teal-300 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Patient ID</p>
                    <p className="text-sm text-teal-300 break-all">{patient?._id || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="h-4 w-4 text-teal-300 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-sm text-teal-300">{formatDate(patient?.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-4">
          {/* Appointments Section */}
          <Card className="shadow-lg bg-gradient-to-br from-teal-950 to-teal-950 border-0">
            <CardHeader className="bg-gradient-to-r from-teal-950 to-teal-950 pb-3">
              <CardTitle className="text-white font-medium">Appointments</CardTitle>
            </CardHeader>

            <CardContent className="pt-4">
              <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-teal-900 p-1 rounded-lg">
                  <TabsTrigger
                    value="upcoming"
                    className="text-teal-200 data-[state=active]:bg-teal-800 data-[state=active]:text-white rounded-md transition-all"
                  >
                    Upcoming
                  </TabsTrigger>
                  <TabsTrigger
                    value="past"
                    className="text-teal-200 data-[state=active]:bg-teal-800 data-[state=active]:text-white rounded-md transition-all"
                  >
                    Past
                  </TabsTrigger>
                  <TabsTrigger
                    value="cancelled"
                    className="text-teal-200 data-[state=active]:bg-teal-800 data-[state=active]:text-white rounded-md transition-all"
                  >
                    Cancelled
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-0 space-y-4">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment._id}
                        appointment={appointment}
                        formatDate={formatDate}
                        formatTime={formatTime}
                        copyMeetingLink={copyMeetingLink}
                        onManageVirtual={openVirtualMeetingModal}
                        onCancel={openCancelModal}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-teal-300">
                      <Clock4 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No upcoming appointments</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="past" className="mt-0 space-y-4">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment._id}
                        appointment={appointment}
                        formatDate={formatDate}
                        formatTime={formatTime}
                        copyMeetingLink={copyMeetingLink}
                        isPast={true}
                        onDownloadPrescription={handleDownloadPrescription}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-teal-300">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No past appointments</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="cancelled" className="mt-0 space-y-4">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment._id}
                        appointment={appointment}
                        formatDate={formatDate}
                        formatTime={formatTime}
                        copyMeetingLink={copyMeetingLink}
                        isPast={true}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-teal-300">
                      <XCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No cancelled appointments</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Medical Information Card */}
          <Card className="shadow-lg bg-gradient-to-br from-teal-950 to-teal-950 border-0">
            <CardHeader className="bg-gradient-to-r from-teal-950 to-teal-950 pb-3">
              <CardTitle className="text-white font-medium">Medical Information</CardTitle>
            </CardHeader>

            <CardContent className="pt-4">
              <Tabs defaultValue="allergies" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-teal-900 p-1 rounded-lg">
                  <TabsTrigger
                    value="allergies"
                    className="text-teal-200 data-[state=active]:bg-teal-800 data-[state=active]:text-white rounded-md transition-all"
                  >
                    Allergies & Alerts
                  </TabsTrigger>
                  <TabsTrigger
                    value="medical-history"
                    className="text-teal-200 data-[state=active]:bg-teal-800 data-[state=active]:text-white rounded-md transition-all"
                  >
                    Medical History
                  </TabsTrigger>
                  <TabsTrigger
                    value="medications"
                    className="text-teal-200 data-[state=active]:bg-teal-800 data-[state=active]:text-white rounded-md transition-all"
                  >
                    Medications
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="allergies" className="mt-0">
                  <div className="space-y-4 text-white">
                    <div className="bg-teal-900/50 p-4 rounded-lg border border-teal-900">
                      <h3 className="font-medium flex items-center mb-3">
                        <AlertTriangle className="h-4 w-4 text-teal-300 mr-2" />
                        Allergies
                      </h3>
                      <p className="text-sm text-teal-200 bg-teal-900/30 p-3 rounded-md">
                        {patient?.allergies || "No allergies recorded"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-teal-900/30 p-4 rounded-lg border border-teal-900 flex items-center">
                        <Shield className="h-4 w-4 text-teal-300 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium">Treatment Consent</p>
                          <Badge
                            className={`mt-1 ${patient?.treatmentConsent ? "bg-green-500 text-green-950" : "bg-red-500 text-red-950"
                              } border-none`}
                          >
                            {patient?.treatmentConsent ? "Provided" : "Not Provided"}
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-teal-900/30 p-4 rounded-lg border border-teal-900 flex items-center">
                        <Shield className="h-4 w-4 text-teal-300 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium">Disclosure Consent</p>
                          <Badge
                            className={`mt-1 ${patient?.disclosureConsent ? "bg-green-500 text-green-950" : "bg-red-500 text-red-950"
                              } border-none`}
                          >
                            {patient?.disclosureConsent ? "Provided" : "Not Provided"}
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-teal-900/30 p-4 rounded-lg border border-teal-900 flex items-center">
                        <Shield className="h-4 w-4 text-teal-300 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium">Privacy Consent</p>
                          <Badge
                            className={`mt-1 ${patient?.privacyConsent ? "bg-green-500 text-green-950" : "bg-red-500 text-red-950"
                              } border-none`}
                          >
                            {patient?.privacyConsent ? "Provided" : "Not Provided"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="medical-history" className="mt-0">
                  <div className="space-y-4 text-white">
                    <div className="bg-teal-900/50 p-4 rounded-lg border border-teal-900">
                      <h3 className="font-medium flex items-center mb-3">
                        <FileText className="h-4 w-4 text-teal-300 mr-2" />
                        Medical History
                      </h3>
                      <p className="text-sm text-teal-200 bg-teal-900/30 p-3 rounded-md">
                        {patient?.medicalHistory || "No medical history recorded"}
                      </p>
                    </div>

                    <div className="bg-teal-900/50 p-4 rounded-lg border border-teal-900">
                      <h3 className="font-medium flex items-center mb-3">
                        <Heart className="h-4 w-4 text-teal-300 mr-2" />
                        Family Medical History
                      </h3>
                      <p className="text-sm text-teal-200 bg-teal-900/30 p-3 rounded-md">
                        {patient?.familyMedicalHistory || "No family medical history recorded"}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="medications" className="mt-0">
                  <div className="space-y-4 text-white">
                    <div className="bg-teal-900/50 p-4 rounded-lg border border-teal-900">
                      <h3 className="font-medium flex items-center mb-3">
                        <Pill className="h-4 w-4 text-teal-300 mr-2" />
                        Current Medications
                      </h3>
                      <p className="text-sm text-teal-200 bg-teal-900/30 p-3 rounded-md">
                        {patient?.currentMedications || "No current medications recorded"}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Virtual Meeting Modal */}
      {virtualMeetingModal && (
        <AppointmentModal
          isOpen={virtualMeetingModal}
          onClose={() => setVirtualMeetingModal(false)}
          title="Virtual Meeting"
          description="Join or set up a virtual meeting for this appointment"
          onSubmit={handleUpdateAppointmentType}
          isLoading={isLoading}
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isVirtual"
                checked={isVirtual}
                onChange={(e) => setIsVirtual(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="isVirtual" className="text-sm font-medium text-gray-700">
                This is a virtual appointment
              </label>
            </div>

            {isVirtual && (
              <div>
                <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700">
                  Meeting Link
                </label>
                <input
                  type="text"
                  id="meetingLink"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.example.com/room"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                />
              </div>
            )}
          </div>
        </AppointmentModal>
      )}

      {/* Cancel Appointment Modal */}
      {cancelModal && (
        <CancellationModal
          isOpen={cancelModal}
          onClose={() => setCancelModal(false)}
          onConfirm={(reason) => cancel(selectedAppointment, reason)}
          isLoading={isLoading}
          appointmentDetails={
            selectedAppointment && {
              doctorName: selectedAppointment?.primaryPhysician?.name || "Doctor",
              date: formatDate(selectedAppointment?.timeSlot?.startTime),
              time: `${formatTime(selectedAppointment?.timeSlot?.startTime)} - ${formatTime(selectedAppointment?.timeSlot?.endTime)}`,
            }
          }
        />
      )}
    </div>
  )
}

