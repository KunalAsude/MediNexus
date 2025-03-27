"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  AlertTriangle,
  Heart,
  ArrowLeft,
  FileText,
  Shield,
  Pill,
  Video,
  LinkIcon,
  Copy,
  X,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import {
  getAppointment,
  getPrescription,
  setPatientPrescription,
  updateAppointment,
} from "@/lib/actions/appointment.actions"
import { useParams } from "next/navigation"
import { getDoctorById, getRegisteredPatient, getUser } from "@/lib/actions/patient.actions"
import AppointmentModal from "@/components/ui/AppointmentModal"
import { toast } from "@/hooks/use-toast"
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
import { generatePrescriptionPDF } from "@/lib/actions/prescriptionPdfGenerator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Add custom scrollbar styling
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`

// Helper function to format date
const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), "PPP")
  } catch (error) {
    return "Invalid date"
  }
}

// Helper function to format time
const formatTime = (dateString) => {
  try {
    return format(new Date(dateString), "h:mm a")
  } catch (error) {
    return "Invalid time"
  }
}

// Common medicine database with details
const medicineDatabase = [
  {
    id: "med1",
    name: "Amoxicillin",
    dosage: "500mg",
    frequency: "Three times daily",
    duration: "7 days",
    quantity: "21 tablets",
    instructions: "Take with food to reduce stomach upset",
  },
  {
    id: "med2",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    duration: "30 days",
    quantity: "30 tablets",
    instructions: "Take in the morning",
  },
  {
    id: "med3",
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily",
    duration: "30 days",
    quantity: "30 tablets",
    instructions: "Take in the evening",
  },
  {
    id: "med4",
    name: "Metformin",
    dosage: "1000mg",
    frequency: "Twice daily",
    duration: "30 days",
    quantity: "60 tablets",
    instructions: "Take with meals",
  },
  {
    id: "med5",
    name: "Ibuprofen",
    dosage: "400mg",
    frequency: "Every 6-8 hours as needed",
    duration: "5 days",
    quantity: "20 tablets",
    instructions: "Take with food or milk",
  },
]

export default function PatientDetails() {
  const [patient, setPatient] = useState(null)
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cancelModel, setCancelModel] = useState(false)
  const [openModel, setOpenModel] = useState(false)
  const [virtualMeetingModal, setVirtualMeetingModal] = useState(false)
  const [meetingLink, setMeetingLink] = useState("")
  const [isVirtual, setIsVirtual] = useState(false)
  const params = useParams()
  const id = params?.id
  const [prescriptionsToDownload, setPrescriptionsToDownload] = useState()
  const [user, setUser] = useState()

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)
  const [prescriptions, setPrescriptions] = useState([
    {
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      quantity: "",
      instructions: "",
    },
  ])
  const [patientInfo, setPatientInfo] = useState({
    patientName: "",
    patientId: "",
    notes: "",
  })

  // Add these functions to handle multiple prescriptions
  const handlePatientInfoChange = (e) => {
    setPatientInfo({
      ...patientInfo,
      [e.target.name]: e.target.value,
    })
  }

  const handlePrescriptionChange = (index, e) => {
    const updatedPrescriptions = [...prescriptions]
    updatedPrescriptions[index] = {
      ...updatedPrescriptions[index],
      [e.target.name]: e.target.value,
    }
    setPrescriptions(updatedPrescriptions)
  }

  const handleMedicineSelect = (index, medicineId) => {
    if (!medicineId) return

    const selectedMedicine = medicineDatabase.find((med) => med.id === medicineId)
    if (!selectedMedicine) return

    const updatedPrescriptions = [...prescriptions]
    updatedPrescriptions[index] = {
      ...updatedPrescriptions[index],
      medication: selectedMedicine.name,
      dosage: selectedMedicine.dosage,
      frequency: selectedMedicine.frequency,
      duration: selectedMedicine.duration,
      quantity: selectedMedicine.quantity,
      instructions: selectedMedicine.instructions,
    }

    setPrescriptions(updatedPrescriptions)

    toast({
      title: "Medicine Selected",
      description: `${selectedMedicine.name} details have been filled in`,
      variant: "default",
    })
  }

  const addPrescriptionRow = () => {
    setPrescriptions([
      ...prescriptions,
      {
        medication: "",
        dosage: "",
        frequency: "",
        duration: "",
        quantity: "",
        instructions: "",
      },
    ])
  }

  const removePrescriptionRow = (index) => {
    if (prescriptions.length > 1) {
      const updatedPrescriptions = [...prescriptions]
      updatedPrescriptions.splice(index, 1)
      setPrescriptions(updatedPrescriptions)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Create toast notification
    toast({
      title: "Saving...",
      description: "Creating prescription record",
      variant: "default",
    })

    try {
      // Prepare the data
      const prescriptionData = {
        patientName: patientInfo.patientName,
        patientId: patientInfo.patientId,
        notes: patientInfo.notes,
        prescriptions: prescriptions,
        doctorId: appointment?.primaryPhysician?.id || "",
        doctorName: appointment?.primaryPhysician?.name || "",
        appointmentId: appointment?._id,
      }

      // Call the server action
      console.log("prescritptiondata", prescriptionData)
      const response = await setPatientPrescription(prescriptionData)

      const prescription = await getPrescription(response?.data?._id)

      setPrescriptionsToDownload(prescription)

      console.log(prescription)

      if (response.ok) {
        setShowPrescriptionModal(false)
        // Show success notification
        toast({
          title: "Success",
          description: "Prescription created successfully",
          variant: "default",
        })

        // Reset form state

        setPrescriptions([
          {
            medication: "",
            dosage: "",
            frequency: "",
            duration: "",
            quantity: "",
            instructions: "",
          },
        ])
        setPatientInfo({
          patientName: "",
          patientId: "",
          notes: "",
        })
      } else {
        throw new Error(response.message || "Failed to create prescription")
      }
    } catch (error) {
      console.error("Error creating prescription:", error)

      // Show error notification
      toast({
        title: "Error",
        description: `Failed to create prescription: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  // Update the useEffect to pre-fill patient info
  useEffect(() => {
    if (patient && showPrescriptionModal) {
      setPatientInfo({
        patientName: patient.name || "",
        patientId: patient._id || "",
        notes: "",
      })
    }
  }, [patient, showPrescriptionModal])

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return

      setLoading(true)
      try {
        const fetchedAppointment = await getAppointment(id)
        const fetchedPatient = await getRegisteredPatient(fetchedAppointment?.userId)

        setPatient(fetchedPatient)
        if (fetchedAppointment) {
          setAppointment(fetchedAppointment)
          setIsVirtual(fetchedAppointment.isVirtual || false)
          setMeetingLink(fetchedAppointment.meetingLink || "")
        }
      } catch (error) {
        console.error("Error fetching patient data:", error)
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPatientData()
  }, [id])

  // Generate a default meeting link
  const generateDefaultLink = () => {
    const defaultLink = `https://meet.jit.si/MediNexus-${patient?.name?.replace(/\s+/g, "-")}-${format(new Date(), "yyyy-MM-dd")}`
    setMeetingLink(defaultLink)
  }

  // Auto-generate meeting link when virtual is toggled on
  useEffect(() => {
    if (isVirtual && !meetingLink && patient?.name) {
      generateDefaultLink()
    }
  }, [isVirtual, patient])

  // Handle toggle change with auto-generation
  const handleVirtualToggle = (checked) => {
    setIsVirtual(checked)
    // If turning on virtual and no link exists, it will be generated by the useEffect
  }

  // Status badge color mapping
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500"
      case "pending":
        return "bg-amber-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleUpdateAppointmentType = async () => {
    if (!appointment?._id) return

    setIsLoading(true)
    try {
      // Create the properly formatted params object that matches the server API
      const updateParams = {
        appointmentId: appointment._id,
        userId: appointment.userId,
        appointment: {
          // Only include fields you want to update
          isVirtual,
          meetingLink: meetingLink,
        },
        type: "schedule",
      }

      const updatedAppointment = await updateAppointment(updateParams)
      setAppointment(updatedAppointment)

      // Show success toast for appointment update
      toast({
        title: "Success",
        description: `Appointment updated to ${isVirtual ? "virtual" : "in-person"} `,
        variant: "default",
      })

      try {
        const user = await getUser(updatedAppointment?.userId)
        setUser(user)
        const doctor = await getDoctorById(updatedAppointment?.primaryPhysician?.id)

        const response = await fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user?.email,
            name: updatedAppointment?.patientName,
            appointmentDate: updatedAppointment?.timeSlot?.startTime,
            reason: updatedAppointment?.reason,
            doctorName: updatedAppointment?.primaryPhysician?.name,
            type: "schedule",
            meetingId: updatedAppointment?.meetingLink,
            doctorEmail: doctor?.email,
          }),
        })

        const data = await response.json()

        if (data.success) {
          console.log("Email notification sent")
        }
      } catch (error) {
        console.error("Error sending email notification:", error)
      }

      setVirtualMeetingModal(false)
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to update appointment type",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const download = async (prescriptionsToDownload: any, appointmentData?: any, patientData?: any) => {
    console.log(prescriptionsToDownload)

    try {
      // Include doctorName in the prescription data, safely accessing possibly undefined data
      const prescriptionData = {
        ...prescriptionsToDownload,
        doctorName: appointmentData?.primaryPhysician?.name || prescriptionsToDownload.doctorName || "Doctor",
        patientEmail: patientData?.email || prescriptionsToDownload.patientEmail,
      }

      console.log(prescriptionData)

      // Generate PDF locally
      const pdfBase64 = await generatePrescriptionPDF(prescriptionData)

      // Create and trigger download link
      const link = document.createElement("a")
      link.href = pdfBase64
      link.download = `prescription_${prescriptionData._id || new Date().getTime()}.pdf`
      document.body.appendChild(link) // Some browsers require the link to be in the document
      link.click()
      document.body.removeChild(link) // Clean up

      return pdfBase64
    } catch (error) {
      console.error("Error in download function:", error)
      // Show error message to user
      return null
    }
  }

  // Copy meeting link to clipboard
  const copyMeetingLink = () => {
    navigator.clipboard.writeText(appointment?.meetingLink || "")
    toast({
      title: "Copied",
      description: "Meeting link copied to clipboard",
      variant: "default",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full p-6 bg-background">
      <header className="mb-6">
        <Link href="/admin" className="text-primary flex items-center mb-3 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Patient Details</h1>
          <div className="flex flex-wrap gap-3 mt-3 sm:mt-0">
            <div className="flex flex-wrap gap-3 justify-center sm:justify-end w-full sm:w-auto">
              {/* {prescriptionsToDownload && prescriptionsToDownload.data && (
                                <button
                                    onClick={() => download(prescriptionsToDownload.data)}
                                    className="border-0 py-2 text-sm bg-teal-950 hover:bg-teal-900 shadow-xl hover:shadow-xl transition-all duration-100 
    rounded-lg px-4 transform hover:scale-105 flex items-center justify-center w-full sm:w-auto"
                                >
                                    Send 
                                </button>
                            )} */}
              <button
                onClick={() => setShowPrescriptionModal(true)}
                className="border-0 py-2 text-sm bg-teal-950 hover:bg-teal-900 shadow-xl hover:shadow-xl transition-all duration-100 
    rounded-lg px-4 transform hover:scale-105 flex items-center justify-center w-full sm:w-auto"
              >
                Prescription
              </button>
              {/* Virtual Meeting Button - Only show if appointment is virtual and has a meeting link */}
              {appointment?.isVirtual && appointment?.meetingLink && (
                <Button
                  variant="outline"
                  className="border-0 py-4 text-sm bg-teal-950 hover:bg-teal-900 shadow-xl hover:shadow-xl transition-all duration-100 
                                rounded-lg px-4 transform hover:scale-105 flex items-center justify-center gap-2"
                  onClick={() => window.open(appointment.meetingLink, "_blank")}
                >
                  <Video className="h-4 w-4" />
                  Join Call
                </Button>
              )}

              {/* Virtual/In-person toggle button */}
              <Button
                variant="outline"
                className="border-0 py-4 text-sm bg-teal-950 hover:bg-teal-900 shadow-xl hover:shadow-xl transition-all duration-100 
                            rounded-lg px-4 transform hover:scale-105 flex items-center justify-center gap-2"
                onClick={() => setVirtualMeetingModal(true)}
              >
                {appointment?.isVirtual ? (
                  <>
                    <Video className="h-4 w-4" />
                    Manage Meeting
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    Appointment Type
                  </>
                )}
              </Button>

              <AppointmentModal
                type="schedule"
                patientId={patient?._id}
                userId={appointment?.userId}
                appointment={appointment}
                onClose={() => setOpenModel(false)}
              />
              <AppointmentModal
                type="cancel"
                patientId={patient?._id}
                userId={appointment?.userId}
                appointment={appointment}
                onClose={() => setOpenModel(false)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar - Patient Info */}
        <div className="lg:col-span-4 space-y-4">
          {/* Patient Profile Card */}
          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-teal-950 to-teal-950">
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
                <div className="w-16 h-16 rounded-full bg-teal-900 flex items-center justify-center shadow-inner">
                  <User className="h-8 w-8 text-white" />
                </div>
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
          <Card className="border-none shadow-lg bg-gradient-to-br from-teal-950 to-teal-950">
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
                  <Button variant="outline" size="sm" className="bg-teal-900 hover:bg-teal-900 border-none text-white">
                    View Full Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-4 md:space-y-6">
          {/* Current Appointment Card */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-teal-950 to-teal-950">
            <CardHeader className="bg-gradient-to-r from-teal-950 to-teal-950 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-white font-medium">Current Appointment</CardTitle>
              <Badge
                className={`px-2 py-2 ${
                  appointment?.status?.toLowerCase() === "completed"
                    ? "bg-green-500 text-green-950"
                    : appointment?.status?.toLowerCase() === "pending"
                      ? "bg-amber-500 text-amber-950"
                      : appointment?.status?.toLowerCase() === "cancelled"
                        ? "bg-red-500 text-red-950"
                        : "bg-gray-900 text-white"
                } font-medium border-none`}
              >
                {appointment?.status?.charAt(0).toUpperCase() + appointment?.status?.slice(1) || "Unknown"}
              </Badge>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 text-white">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-teal-300 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm text-teal-300">
                        {formatDate(appointment?.timeSlot?.startTime) || "Not scheduled"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-teal-300 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-teal-300">
                        {formatTime(appointment?.timeSlot?.startTime)} -{" "}
                        {formatTime(appointment?.timeSlot?.endTime) || "TBD"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <User className="h-4 w-4 text-teal-300 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Doctor</p>
                      <p className="text-sm text-teal-300">{appointment?.primaryPhysician?.name || "Not assigned"}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {appointment?.isVirtual ? (
                      <Video className="h-4 w-4 text-teal-300 mr-3 flex-shrink-0" />
                    ) : (
                      <User className="h-4 w-4 text-teal-300 mr-3 flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">Type</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-teal-300">
                          {appointment?.isVirtual ? "Virtual Consultation" : "In-person Visit"}
                        </p>
                        {appointment?.isVirtual && (
                          <Badge className="bg-teal-900 text-white text-xs border-none">Online</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Meeting Link (only if virtual) */}
                  {appointment?.isVirtual && appointment?.meetingLink && (
                    <div className="flex items-start">
                      <LinkIcon className="h-4 w-4 text-teal-300 mr-3 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">Meeting Link</p>
                        <div className="flex items-center mt-1 gap-2">
                          <p className="text-xs text-teal-300 truncate max-w-[70%] hidden sm:block">
                            {appointment.meetingLink}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 bg-teal-900 hover:bg-teal-900 text-white"
                            onClick={copyMeetingLink}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            <span className="text-xs">Copy</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-white">
                  <h3 className="font-medium mb-2">Reason for Visit</h3>
                  <div className="bg-teal-900/50 p-4 rounded-md border border-teal-900 shadow-inner mb-4">
                    <p className="text-sm text-teal-200">{appointment?.reason || "No reason specified"}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <Badge className="bg-teal-900 text-white border-none">
                      {appointment?.isVirtual ? "Virtual" : "In-person"}
                    </Badge>
                    <span className="text-xs text-teal-300">Created: {formatDate(appointment?.createdAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information Card */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-teal-950 to-teal-950">
            <CardHeader className="bg-gradient-to-r from-teal-950 to-teal-950 pb-3">
              <CardTitle className="text-white font-medium">Medical Information</CardTitle>
            </CardHeader>

            <CardContent className="pt-4">
              <Tabs defaultValue="allergies" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-teal-900 p-1 rounded-lg">
                  <TabsTrigger
                    value="medical-history"
                    className="text-teal-200 data-[state=active]:bg-teal-900 data-[state=active]:text-white rounded-md transition-all"
                  >
                    History
                  </TabsTrigger>
                  <TabsTrigger
                    value="medications"
                    className="text-teal-200 data-[state=active]:bg-teal-900 data-[state=active]:text-white rounded-md transition-all"
                  >
                    Medication
                  </TabsTrigger>
                  <TabsTrigger
                    value="allergies"
                    className="text-teal-200 data-[state=active]:bg-teal-900 data-[state=active]:text-white rounded-md transition-all"
                  >
                    Allergies
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
              <Switch
                checked={isVirtual}
                onCheckedChange={handleVirtualToggle}
                className="data-[state=checked]:bg-teal-600"
              />
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
                    className="bg-teal-950 border-teal-800 text-white placeholder:text-teal-400"
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

      {/* Modal components (included but not visible initially) */}
      {openModel && (
        <AppointmentModal
          type="schedule"
          patientId={patient?._id}
          userId={appointment?.userId}
          appointment={appointment}
          onClose={() => setOpenModel(false)}
        />
      )}

      {cancelModel && (
        <AppointmentModal
          type="cancel"
          patientId={patient?._id}
          userId={appointment?.userId}
          appointment={appointment}
          onClose={() => setCancelModel(false)}
        />
      )}
      {showPrescriptionModal && (
        <Dialog open={showPrescriptionModal} onOpenChange={setShowPrescriptionModal}>
          <DialogContent className="w-[95%] sm:w-[85%] max-w-[1200px] bg-teal-950 border-teal-900 shadow-xl overflow-hidden p-0">
            <div className="flex flex-col h-full max-h-[85vh]">
              <DialogHeader className="px-6 pt-6 pb-2">
                <DialogTitle className="text-teal-50 flex items-center gap-2 text-xl">
                  <Pill className="h-5 w-5" />
                  Create New Prescription
                </DialogTitle>
                <DialogDescription className="text-teal-300">
                  Fill in the prescription details for the patient
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-auto px-6 pb-6 custom-scrollbar">
                <form id="prescription-form" onSubmit={handleSubmit} className="space-y-5">
                  {/* Patient Information Section */}
                  <div className="bg-teal-950 p-4 rounded-lg border border-teal-800">
                    <h3 className="text-teal-50 font-medium mb-3 flex items-center">
                      <User className="h-4 w-4 mr-2 text-teal-300" />
                      Patient Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="patientName" className="text-white text-sm">
                          Patient Name
                        </Label>
                        <Input
                          id="patientName"
                          name="patientName"
                          value={patientInfo.patientName}
                          onChange={handlePatientInfoChange}
                          className="bg-teal-950 border-teal-800 text-white placeholder:text-teal-400"
                          placeholder="Enter patient name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="patientId" className="text-white text-sm">
                          Patient ID
                        </Label>
                        <Input
                          id="patientId"
                          name="patientId"
                          value={patientInfo.patientId}
                          onChange={handlePatientInfoChange}
                          className="bg-teal-950 border-teal-800 text-white placeholder:text-teal-400"
                          placeholder="Enter patient ID"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Medications Section */}
                  <div className="bg-teal-950 p-4 rounded-lg border border-teal-800">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-teal-50 font-medium flex items-center">
                        <Pill className="h-4 w-4 mr-2 text-teal-300" />
                        Medications
                      </h3>
                      <Button
                        type="button"
                        onClick={addPrescriptionRow}
                        variant="outline"
                        size="sm"
                        className="bg-teal-800 hover:bg-teal-700 border-teal-700 text-teal-50 h-8"
                      >
                        + Add Medication
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {prescriptions.map((prescription, index) => (
                        <div key={index} className="p-3 bg-teal-950 rounded-lg border border-teal-800 relative">
                          {prescriptions.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePrescriptionRow(index)}
                              className="absolute top-1 right-1 h-7 w-7 p-0 text-teal-300 hover:text-teal-50 hover:bg-teal-800 rounded-full"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          )}

                          <div className="space-y-3">
                            {/* Medicine Selection Dropdown */}
                            <div className="space-y-1">
                              <Label htmlFor={`medicine-select-${index}`} className="text-white text-sm">
                                Select Medicine
                              </Label>
                              <Select onValueChange={(value) => handleMedicineSelect(index, value)}>
                                <SelectTrigger className="bg-teal-950 border-teal-800 text-white h-9">
                                  <SelectValue placeholder="Select a medicine" />
                                </SelectTrigger>
                                <SelectContent className="bg-teal-950 border-teal-800 text-white">
                                  {medicineDatabase.map((medicine) => (
                                    <SelectItem key={medicine.id} value={medicine.id}>
                                      {medicine.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-teal-400 mt-1">
                                Select a medicine to auto-fill details or enter manually
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="space-y-1">
                                <Label htmlFor={`medication-${index}`} className="text-white text-sm">
                                  Medication Name
                                </Label>
                                <Input
                                  id={`medication-${index}`}
                                  name="medication"
                                  value={prescription.medication}
                                  onChange={(e) => handlePrescriptionChange(index, e)}
                                  className="bg-teal-950 border-teal-800 text-white placeholder:text-teal-400 h-9"
                                  placeholder="Enter medication name"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <Label htmlFor={`instructions-${index}`} className="text-white text-sm">
                                  Special Instructions
                                </Label>
                                <Input
                                  id={`instructions-${index}`}
                                  name="instructions"
                                  value={prescription.instructions}
                                  onChange={(e) => handlePrescriptionChange(index, e)}
                                  className="bg-teal-950 border-teal-800 text-white placeholder:text-teal-400 h-9"
                                  placeholder="e.g., Take with food"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="space-y-1">
                                <Label htmlFor={`dosage-${index}`} className="text-white text-sm">
                                  Dosage
                                </Label>
                                <Input
                                  id={`dosage-${index}`}
                                  name="dosage"
                                  value={prescription.dosage}
                                  onChange={(e) => handlePrescriptionChange(index, e)}
                                  className="bg-teal-950 border-teal-800 text-white placeholder:text-teal-400 h-9"
                                  placeholder="e.g., 10mg"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <Label htmlFor={`frequency-${index}`} className="text-white text-sm">
                                  Frequency
                                </Label>
                                <Input
                                  id={`frequency-${index}`}
                                  name="frequency"
                                  value={prescription.frequency}
                                  onChange={(e) => handlePrescriptionChange(index, e)}
                                  className="bg-teal-950 border-teal-800 text-white placeholder:text-teal-400 h-9"
                                  placeholder="e.g., Twice daily"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <Label htmlFor={`duration-${index}`} className="text-white text-sm">
                                  Duration
                                </Label>
                                <Input
                                  id={`duration-${index}`}
                                  name="duration"
                                  value={prescription.duration}
                                  onChange={(e) => handlePrescriptionChange(index, e)}
                                  className="bg-teal-950 border-teal-800 text-white placeholder:text-teal-400 h-9"
                                  placeholder="e.g., 7 days"
                                  required
                                />
                              </div>

                              <div className="space-y-1">
                                <Label htmlFor={`quantity-${index}`} className="text-white text-sm">
                                  Quantity
                                </Label>
                                <Input
                                  id={`quantity-${index}`}
                                  name="quantity"
                                  value={prescription.quantity}
                                  onChange={(e) => handlePrescriptionChange(index, e)}
                                  className="bg-teal-950 border-teal-800 text-white placeholder:text-teal-400 h-9"
                                  placeholder="e.g., 30 tablets"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Notes Section */}
                  <div className="bg-teal-950 p-4 rounded-lg border border-teal-800">
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-white text-sm flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-teal-300" />
                        Additional Notes
                      </Label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={patientInfo.notes}
                        onChange={handlePatientInfoChange}
                        className="w-full h-20 bg-teal-950 border-teal-800 text-white placeholder:text-teal-400 rounded-md p-3 resize-none"
                        placeholder="Enter any additional notes or instructions for the patient"
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="border-t border-teal-800 p-4 bg-teal-950/80 flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="bg-teal-900 hover:bg-teal-800 border-teal-800 text-teal-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="prescription-form"
                  className="bg-teal-700 hover:bg-teal-600 text-white flex items-center gap-2 font-medium"
                >
                  <Pill className="h-4 w-4" />
                  Save Prescription
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

