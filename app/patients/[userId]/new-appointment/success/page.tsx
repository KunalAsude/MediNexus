import { Button } from "@/components/ui/button"
import { getAppointment } from "@/lib/actions/appointment.actions"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

interface SearchParamProps {
  params: {
    userId: string
  }
  searchParams: {
    appointmentId?: string
  }
}

const Success = async ({ params: { userId }, searchParams }: SearchParamProps) => {
  const appointmentId = searchParams?.appointmentId || ""

  let appointment
  let primaryPhysician
  let appointmentDate = "Date not specified"
  let appointmentTime = "Time not specified"

  try {
    appointment = await getAppointment(appointmentId)
    console.log("Appointment found:", appointmentId)
    console.log("Appointment:", appointment)
    primaryPhysician = appointment?.primaryPhysician

    // Format the appointment start and end time for display
    if (appointment?.timeSlot?.startTime && appointment?.timeSlot?.endTime) {
      // Parse the ISO date strings
      const startDate = new Date(appointment.timeSlot.startTime)
      const endDate = new Date(appointment.timeSlot.endTime)

      // Format the date: Feb 28, 2025
      // Format the date: 28 Feb, 2025
      appointmentDate = startDate.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "Asia/Kolkata" // Indian Standard Time
      })

      // Format the time: 6:15 PM - 6:45 PM
      const startTime = startDate.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata" // Indian Standard Time
      })

      const endTime = endDate.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata" // Indian Standard Time
      })

      appointmentTime = `${startTime} - ${endTime} (IST)`
      appointmentTime = `${startTime} - ${endTime}`

      console.log("Formatted Date:", appointmentDate)
      console.log("Formatted Time:", appointmentTime)
    }

    console.log("Appointment details loaded successfully")
  } catch (error) {
    console.error("Error loading appointment:", error)
  }

  return (
    <div className="flex h-screen max-h-screen px-[5%] items-center justify-center relative">
      {/* Back Button */}
      <Button
        variant="outline"
        className="shad-primary-btn bg-[linear-gradient(to_right,#064E4C,#024632,#013220)] border-2 border-cyan-900 mt-4 absolute top-4 left-4 sm:left-1 sm:top-1 flex items-center gap-2 sm:gap-0"
        asChild
      >
        <Link href="/dashboard" className="flex items-center">
          <div className="flex gap-2 justify-center items-center">
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="hidden sm:block">Back to Dashboard</span>
          </div>
        </Link>
      </Button>

      {/* Success Section */}
      <div className="success-img flex flex-col items-center">
        {/* Logo */}
        <div className="flex flex-row align-middle">
          <img src="https://img.icons8.com/arcade/64/hospital.png" alt="MediNexus Logo" className="h-15 w-fit" />
          <div className="text-2xl font-bold flex items-center justify-center text-teal-300">MediNexus</div>
        </div>

        {/* Success Animation */}
        <section className="flex flex-col items-center">
          <Image src="/assets/gifs/success.gif" alt="success" width={300} height={280} />
          <h2 className="header mb-2 max-w-[600px] text-center">
            Your <span className="text-teal-300">Appointment Request</span> has been received successfully !!!
          </h2>
          <p className="text-center">We'll get back to you shortly with the appointment details.</p>
        </section>

        {/* Appointment Details - Focused on Date and Time */}
        <section className="request-details bg-teal-900/20 px-10 rounded-lg border border-teal-700 ">
          <h3 className="text-xl font-semibold text-teal-300 ">Appointment Details</h3>

          {/* Doctor Info */}
          <div className="flex items-center gap-4">
            {primaryPhysician?.image ? (
              <Image
                src={primaryPhysician.image || "/placeholder.svg"}
                alt="doctor"
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-teal-700 rounded-full flex items-center justify-center text-white">
                {primaryPhysician?.name?.charAt(0) || "D"}
              </div>
            )}
            <p className="font-medium">{primaryPhysician?.name || "Doctor not specified"}</p>
          </div>

          {/* Date - Highlighted */}
          <div className="flex items-center align-middle gap-3 p-1  rounded-md">
            <Calendar className="h-5 w-5 text-teal-300" />
            <div>
              <p className="text-sm text-teal-300">Date</p>
              <p className="font-medium">{appointmentDate}</p>
            </div>
          </div>

          {/* Time Slot - Highlighted */}
          <div className="flex items-center align-middle gap-3 p-1 rounded-md">
            <Clock className="h-5 w-5 text-teal-300" />
            <div>
              <p className="text-sm text-teal-300">Time Slot</p>
              <p className="font-medium">{console.log(appointmentTime)}</p>
              <p className="font-medium">{appointmentTime}</p>
            </div>
          </div>
        </section>

        {/* New Appointment Button */}
        <Button
          variant="outline"
          className="shad-primary-btn bg-[linear-gradient(to_right,#064E4C,#024632,#013220)] border-2 border-cyan-900"
          asChild
        >
          <Link href={`/patients/${userId}/new-appointment`}>New Appointment</Link>
        </Button>

        {/* Footer */}
        <p className="copyright text-sm text-teal-100/60">© MediNexus 2025</p>
      </div>
    </div>
  )
}

export default Success

