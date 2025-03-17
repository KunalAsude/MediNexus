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
    X,
    Video,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { getAppointment } from "@/lib/actions/appointment.actions"
import { useParams } from "next/navigation"
import { getRegisteredPatient } from "@/lib/actions/patient.actions"
import AppointmentModal from "@/components/ui/AppointmentModal"
import { toast } from "@/hooks/use-toast"

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

export default function PatientDetails() {
    const [patient, setPatient] = useState(null)
    const [appointment, setAppointment] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [cancelModel, setCancelModel] = useState(false)
    const [openModel, setOpenModel] = useState(false)
    const params = useParams()
    const id = params?.id

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

    // Close modal function
    const handleCloseModal = () => {
        setModalType(null)
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
                <Link href="/dashboard" className="text-primary flex items-center mb-3 hover:underline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold">Patient Details</h1>
                    <div className="flex gap-3 mt-3 sm:mt-0">

                        <div className="flex gap-3  justify-center sm:ml-5 ">
                            <Button
                                variant="outline"
                                className="border-0 py-4 text-sm bg-teal-900 hover:bg-teal-900 shadow-xl hover:shadow-xl transition-all duration-100 
             rounded-lg px-4 transform hover:scale-105 flex items-center justify-center gap-2"
                                onClick={() => window.open("https://meet.jit.si/MediNexus-Consultation", "_blank")}
                            >
                                <Video className="h-4 w-4" />
                                Join Video Call
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
                {/* Essential Patient Info */}
                <Card className="w-full lg:col-span-4 bg-teal-950 border border-gray-900">
                    <CardHeader className="bg-primary text-primary-foreground pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-medium">Patient Profile</CardTitle>
                            <Badge variant="outline" className="bg-teal-900 border-0 p-2 text-primary ">
                                {patient?.gender?.charAt(0).toUpperCase() + patient?.gender?.slice(1) || "Unknown"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-900">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">{patient?.name || "Unknown"}</h2>
                                <p className="text-muted-foreground">{patient?.age || "?"} years</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <Phone className="h-4 w-4 text-primary mr-3" />
                                <span>{patient?.phone || "No phone"}</span>
                            </div>

                            <div className="flex items-center">
                                <Mail className="h-4 w-4 text-primary mr-3" />
                                <span>{patient?.email || "No email"}</span>
                            </div>

                            <div className="flex items-start ">
                                <AlertTriangle className="h-4 w-4 text-primary mr-3 mt-1 " />
                                <div>
                                    <p className="font-medium">Emergency Contact</p>
                                    <p className="text-sm text-muted-foreground mt-1">{patient?.emergencyContactName || "None"}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{patient?.emergencyContactNumber || "None"}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <FileText className="h-4 w-4 text-primary mr-3 mt-1" />
                                <div>
                                    <p className="font-medium">ID</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {patient?.identificationType}: {patient?.identificationNumber || "None"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Current Appointment */}
                    <Card className="w-full border bg-teal-950 border-gray-900">
                        <CardHeader className="pb-3 border-b border-gray-900">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-medium">Current Appointment</CardTitle>
                                <Badge className={`${getStatusColor(appointment?.status)} px-2 py-1`}>
                                    {appointment?.status?.charAt(0).toUpperCase() + appointment?.status?.slice(1) || "Unknown"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 text-primary mr-3" />
                                        <div>
                                            <p className="font-medium">Date</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(appointment?.timeSlot?.startTime) || "Not scheduled"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 text-primary mr-3" />
                                        <div>
                                            <p className="font-medium">Time</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatTime(appointment?.timeSlot?.startTime)} -{" "}
                                                {formatTime(appointment?.timeSlot?.endTime) || "Not scheduled"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <User className="h-4 w-4 text-primary mr-3" />
                                        <div>
                                            <p className="font-medium">Physician</p>
                                            <p className="text-sm text-muted-foreground">
                                                {appointment?.primaryPhysician?.name || "Not assigned"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-2">Reason for Visit</h3>
                                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                        {appointment?.reason || "No reason specified"}
                                    </p>

                                    <div className="mt-4 flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs bg-teal-900 border-0 py-1 px-2">
                                            {appointment?.isVirtual ? "Virtual" : "In-person"}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">Created: {formatDate(appointment?.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Medical Information */}
                    <Card className="w-full bg-teal-950 border border-gray-900">
                        <CardHeader className="pb-3 border-b border-gray-900">
                            <CardTitle className="text-lg font-medium">Medical Information</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Tabs defaultValue="medical-history" className="w-full ">
                                <TabsList className="grid w-full grid-cols-3 gap-3 p-2 mb-4 ">
                                    <TabsTrigger
                                        value="medical-history"
                                        className="data-[state=active]:border-b-2 border-teal-600 data-[state=active]:border-primary"
                                    >
                                        Medical History
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="medications"
                                        className="data-[state=active]:border-b-2 border-teal-600  data-[state=active]:border-primary"
                                    >
                                        Medications
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="allergies"
                                        className="data-[state=active]:border-b-2 border-teal-600  data-[state=active]:border-primary"
                                    >
                                        Allergies & Alerts
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="medical-history">
                                    <div className="space-y-4">
                                        <div className="w-full  border border-gray-900 p-4 rounded-md">
                                            <h3 className="font-medium flex items-center mb-2">
                                                <Heart className="h-4 w-4 text-primary mr-2" />
                                                Past Medical History
                                            </h3>
                                            <p className="text-sm">{patient?.pastMedicalHistory || "No past medical history recorded"}</p>
                                        </div>

                                        <div className="w-full border border-gray-900 p-4 rounded-md">
                                            <h3 className="font-medium flex items-center mb-2">
                                                <Heart className="h-4 w-4 text-primary mr-2" />
                                                Family Medical History
                                            </h3>
                                            <p className="text-sm">{patient?.familyMedicalHistory || "No family medical history recorded"}</p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="medications">
                                    <div className="w-full border border-gray-900 p-4 rounded-md">
                                        <h3 className="font-medium flex items-center mb-2">
                                            <Pill className="h-4 w-4 text-primary mr-2" />
                                            Current Medications
                                        </h3>
                                        <p className="text-sm">{patient?.currentMedication || "No current medications recorded"}</p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="allergies">
                                    <div className="space-y-4">
                                        <div className="w-full border border-gray-900 p-4 rounded-md">
                                            <h3 className="font-medium flex items-center mb-2">
                                                <AlertTriangle className="h-4 w-4 text-primary mr-2" />
                                                Allergies
                                            </h3>
                                            <p className="text-sm">{patient?.allergies || "No allergies recorded"}</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="flex items-center p-3 border border-gray-900 rounded-md">
                                                <Shield className="h-4 w-4 text-primary mr-2" />
                                                <div>
                                                    <p className="text-xs font-medium">Treatment Consent</p>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            patient?.treatmentConsent ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                        }
                                                    >
                                                        {patient?.treatmentConsent ? "Provided" : "Not Provided"}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex items-center p-3 border border-gray-900 rounded-md">
                                                <Shield className="h-4 w-4 text-primary mr-2" />
                                                <div>
                                                    <p className="text-xs font-medium">Disclosure Consent</p>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            patient?.disclosureConsent ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                        }
                                                    >
                                                        {patient?.disclosureConsent ? "Provided" : "Not Provided"}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex items-center p-3 border border-gray-900 rounded-md">
                                                <Shield className="h-4 w-4 text-primary mr-2" />
                                                <div>
                                                    <p className="text-xs font-medium">Privacy Consent</p>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            patient?.privacyConsent ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                        }
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

                    {/* Insurance Information - Simplified */}
                    <div className="w-full flex items-center justify-between bg-teal-950 border border-gray-900 p-4 rounded-md">
                        <div>
                            <h3 className="font-medium">Insurance</h3>
                            <p className="text-sm text-muted-foreground">
                                {patient?.insuranceProvider || "None"} • Policy: {patient?.insurancePolicyNumber || "N/A"}
                            </p>
                        </div>
                        <Button variant="outline" className="border-0 bg-teal-800 hover:bg-teal-900" size="sm">
                            View Details
                        </Button>
                    </div>
                </div>
            </div>



        </div>
    )
}

