"use client"

import { useState } from "react"
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
} from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function PatientProfile() {
  const [isVirtual, setIsVirtual] = useState(false)
  const [meetingLink, setMeetingLink] = useState("")
  const [virtualMeetingModal, setVirtualMeetingModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("upcoming")

  // Mock data based on the provided structure
  const patient = {
    _id: "67a7313c5dffaa705bde2574",
    userId: "67a484ec396d9229646173e3",
    name: "Kunal",
    email: "kunal@gmail.com",
    phone: "+918010868744",
    age: "20",
    gender: "male",
    address: "Kopargaon",
    occupation: "Software Engineer",
    emergencyContactName: "two",
    emergencyContactNumber: "+91213654789",
    insuranceProvider: "none",
    insurancePolicyNumber: "none",
    allergies: "",
    currentMedication: "",
    familyMedicalHistory: "",
    pastMedicalHistory: "",
    identificationType: "Aadhaar Card",
    identificationNumber: "123654",
    identificationDocumentUrl: null,
    treatmentConsent: true,
    disclosureConsent: true,
    privacyConsent: true,
    createdAt: "2025-02-08T10:26:04.304+00:00",
    updatedAt: "2025-02-08T10:26:04.304+00:00",
  }

  const appointments = [
    {
      _id: "67d82bb1988554c5b162081a",
      userId: "67a58aea395e00827e303179",
      patientId: "67a86da6204e7cb7509b9687",
      patientName: "Kunal",
      primaryPhysician: {
        id: "67a5b2c92524f85fb9930d1e",
        name: "Dr. Priya Shah",
        image: "",
      },
      reason: "test",
      timeSlot: {
        startTime: "2025-03-17T05:30:00.000+00:00",
        endTime: "2025-03-17T06:00:00.000+00:00",
      },
      status: "scheduled",
      isVirtual: true,
      meetingLink: "https://meet.jit.si/MediNexus-Kunal-2025-03-17",
      cancellationReason: "",
      createdAt: "2025-03-17T14:03:29.738+00:00",
      updatedAt: "2025-03-19T14:47:12.973+00:00",
    },
    {
      _id: "67d82bb1988554c5b162082b",
      userId: "67a58aea395e00827e303179",
      patientId: "67a86da6204e7cb7509b9687",
      patientName: "Kunal",
      primaryPhysician: {
        id: "67a5b2c92524f85fb9930d1e",
        name: "Dr. Anil Kumar",
        image: "",
      },
      reason: "Follow-up",
      timeSlot: {
        startTime: "2025-03-25T07:30:00.000+00:00",
        endTime: "2025-03-25T08:00:00.000+00:00",
      },
      status: "scheduled",
      isVirtual: false,
      cancellationReason: "",
      createdAt: "2025-03-20T10:03:29.738+00:00",
      updatedAt: "2025-03-20T10:03:29.738+00:00",
    },
    {
      _id: "67d82bb1988554c5b162083c",
      userId: "67a58aea395e00827e303179",
      patientId: "67a86da6204e7cb7509b9687",
      patientName: "Kunal",
      primaryPhysician: {
        id: "67a5b2c92524f85fb9930d1e",
        name: "Dr. Meera Patel",
        image: "",
      },
      reason: "Annual checkup",
      timeSlot: {
        startTime: "2025-02-15T09:30:00.000+00:00",
        endTime: "2025-02-15T10:00:00.000+00:00",
      },
      status: "completed",
      isVirtual: true,
      meetingLink: "https://meet.jit.si/MediNexus-Kunal-2025-02-15",
      cancellationReason: "",
      createdAt: "2025-02-10T11:03:29.738+00:00",
      updatedAt: "2025-02-15T10:47:12.973+00:00",
    },
    {
      _id: "67d82bb1988554c5b162084d",
      userId: "67a58aea395e00827e303179",
      patientId: "67a86da6204e7cb7509b9687",
      patientName: "Kunal",
      primaryPhysician: {
        id: "67a5b2c92524f85fb9930d1e",
        name: "Dr. Rajesh Gupta",
        image: "",
      },
      reason: "Fever and cold",
      timeSlot: {
        startTime: "2025-01-05T14:30:00.000+00:00",
        endTime: "2025-01-05T15:00:00.000+00:00",
      },
      status: "cancelled",
      isVirtual: false,
      cancellationReason: "Patient unavailable",
      createdAt: "2025-01-03T09:03:29.738+00:00",
      updatedAt: "2025-01-04T16:47:12.973+00:00",
    },
  ]

  // Generate a default meeting link
  const generateDefaultLink = () => {
    const defaultLink = `https://meet.jit.si/MediNexus-${patient?.name?.replace(/\s+/g, "-")}-${formatDate(new Date().toISOString(), "yyyy-MM-dd")}`
    setMeetingLink(defaultLink)
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
    // In a real app, you would show a toast notification here
    console.log("Meeting link copied to clipboard")
  }

  // Handle update appointment type
  const handleUpdateAppointmentType = async () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setVirtualMeetingModal(false)
      // In a real app, you would update the appointment in the database
      console.log("Appointment updated:", { isVirtual, meetingLink })
    }, 1000)
  }

  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.timeSlot.startTime)
    const today = new Date()

    switch (activeTab) {
      case "upcoming":
        return appointment.status === "scheduled" && appointmentDate > today
      case "past":
        return appointment.status === "completed" || appointmentDate < today
      case "cancelled":
        return appointment.status === "cancelled"
      default:
        return true
    }
  })

  return (
    <div className="w-full bg-background">
      <header className="p-6 bg-teal-950">
        <Link href="/admin" className="text-teal-300 flex items-center mb-3 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-white">Patient Profile</h1>
          <div className="flex gap-3 mt-3 sm:mt-0">
            <Button
              variant="outline"
              className="border-0 py-4 text-sm bg-teal-900 hover:bg-teal-800 text-white shadow-xl hover:shadow-xl transition-all duration-100 
              rounded-lg px-4 transform hover:scale-105 flex items-center justify-center gap-2"
              onClick={() => setVirtualMeetingModal(true)}
            >
              <Video className="h-4 w-4" />
              Manage Appointment
            </Button>
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
                  <AvatarFallback className="text-white">{patient.name.charAt(0)}</AvatarFallback>
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
                      {patient?.identificationType}: {patient?.identificationNumber || "None"}
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
                  <FileText className="h-4 w-4 text-teal-300 mr-3 mt-1 flex-shrink-0" />
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
              <Tabs defaultValue="medical-history" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-teal-900 p-1 rounded-lg">
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
                  <TabsTrigger
                    value="allergies"
                    className="text-teal-200 data-[state=active]:bg-teal-800 data-[state=active]:text-white rounded-md transition-all"
                  >
                    Allergies & Alerts
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="medical-history" className="mt-0">
                  <div className="space-y-4 text-white">
                    <div className="bg-teal-900/50 p-4 rounded-lg border border-teal-900">
                      <h3 className="font-medium flex items-center mb-3">
                        <Heart className="h-4 w-4 text-teal-300 mr-2" />
                        Past Medical History
                      </h3>
                      <p className="text-sm text-teal-200 bg-teal-900/30 p-3 rounded-md">
                        {patient?.pastMedicalHistory || "No past medical history recorded"}
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
                  <div className="bg-teal-900/50 p-4 rounded-lg border border-teal-900 text-white">
                    <h3 className="font-medium flex items-center mb-3">
                      <Pill className="h-4 w-4 text-teal-300 mr-2" />
                      Current Medications
                    </h3>
                    <p className="text-sm text-teal-200 bg-teal-900/30 p-3 rounded-md">
                      {patient?.currentMedication || "No current medications recorded"}
                    </p>
                  </div>
                </TabsContent>

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
                            className={`mt-1 ${
                              patient?.treatmentConsent ? "bg-green-500 text-green-950" : "bg-red-500 text-red-950"
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
                            className={`mt-1 ${
                              patient?.disclosureConsent ? "bg-green-500 text-green-950" : "bg-red-500 text-red-950"
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
                            className={`mt-1 ${
                              patient?.privacyConsent ? "bg-green-500 text-green-950" : "bg-red-500 text-red-950"
                            } border-none`}
                          >
                            {patient?.privacyConsent ? "Provided" : "Not Provided"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Virtual Meeting Modal */}
      <Dialog open={virtualMeetingModal} onOpenChange={setVirtualMeetingModal}>
        <DialogContent className="sm:max-w-md bg-teal-950 border-teal-900 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-teal-50">Appointment Type</DialogTitle>
            <DialogDescription className="text-teal-300">
              Configure appointment method and meeting details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between p-4 bg-teal-900 rounded-lg">
              <div className="space-y-1">
                <Label className="text-teal-50">Virtual Appointment</Label>
                <p className="text-sm text-teal-300">Enable for telehealth consultation</p>
              </div>
              <Switch checked={isVirtual} onCheckedChange={setIsVirtual} className="data-[state=checked]:bg-teal-600" />
            </div>

            {isVirtual && (
              <div className="space-y-3 p-4 bg-teal-900/50 rounded-lg border border-teal-800">
                <Label htmlFor="meetingLink" className="text-teal-50">
                  Meeting Link
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="meetingLink"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.example.com/room-id"
                    className="bg-teal-900 border-teal-800 text-teal-50 placeholder:text-teal-400"
                  />
                  <Button
                    variant="outline"
                    className="bg-teal-800 hover:bg-teal-700 border-teal-700 text-teal-50"
                    onClick={generateDefaultLink}
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-teal-300">
                  Patient will receive this link via email to join the virtual consultation
                </p>
              </div>
            )}

            {!isVirtual && (
              <div className="p-4 bg-teal-900/30 border border-teal-800 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-teal-300 mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-teal-200">In-Person Appointment</p>
                    <p className="text-xs text-teal-300 mt-1">
                      The patient must attend in person at the clinic. They will be notified that virtual consultation
                      is not available.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setVirtualMeetingModal(false)}
              className="w-full sm:w-auto bg-teal-900 hover:bg-teal-800 border-teal-800 text-teal-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAppointmentType}
              disabled={isLoading}
              className="w-full sm:w-auto bg-teal-700 hover:bg-teal-600 text-teal-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Appointment Card Component
function AppointmentCard({ appointment, formatDate, formatTime, copyMeetingLink }) {
  // Status badge color mapping
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500 text-green-950"
      case "scheduled":
        return "bg-amber-500 text-amber-950"
      case "cancelled":
        return "bg-red-500 text-red-950"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <div className="bg-teal-900/50 p-4 rounded-lg border border-teal-900 text-white">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`${getStatusColor(appointment.status)} border-none`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Badge>
            <Badge className="bg-teal-900 text-white border-none">
              {appointment.isVirtual ? "Virtual" : "In-person"}
            </Badge>
          </div>
          <h3 className="font-semibold text-lg">{appointment.primaryPhysician.name}</h3>
          <p className="text-teal-300 text-sm">{appointment.reason}</p>

          {appointment.cancellationReason && (
            <div className="mt-2 text-sm">
              <span className="text-red-300">Cancellation reason: </span>
              <span className="text-teal-200">{appointment.cancellationReason}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-teal-300" />
            <span>{formatDate(appointment.timeSlot.startTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-teal-300" />
            <span>
              {formatTime(appointment.timeSlot.startTime)} - {formatTime(appointment.timeSlot.endTime)}
            </span>
          </div>

          {appointment.isVirtual && appointment.meetingLink && (
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-teal-800 hover:bg-teal-700 border-teal-700 text-teal-50"
                onClick={() => window.open(appointment.meetingLink, "_blank")}
              >
                <Video className="h-3 w-3 mr-1" />
                <span className="text-xs">Join</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 bg-transparent hover:bg-teal-800 text-teal-50"
                onClick={() => copyMeetingLink(appointment.meetingLink)}
              >
                <Copy className="h-3 w-3 mr-1" />
                <span className="text-xs">Copy Link</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

