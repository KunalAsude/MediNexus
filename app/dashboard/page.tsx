"use client"
import { Card, CardContent } from "@/components/ui/card"
import PasskeyModal from "@/components/ui/PasskeyModal"
import { Users, Activity, ClipboardList, UserPlus, Clock, Bed, Ambulance } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { StatCard } from "@/components/ui/Stat"
import { LineChart } from "@/components/ui/LineChart"
import { BarChart } from "@/components/ui/BarChart"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [showPasskeyModal, setShowPasskeyModal] = useState(false)
  const { toast } = useToast()

  const handleLinkClick = (featureName: string) => {
    toast({
      title: `Processing Your Request!!`,
      description: `Directing You To ${featureName}`,
      variant: "default",
      duration: 2000,
    })
  }

  // Sample data for charts
  const appointmentTrends = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Weekly Appointments",
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: "rgb(20, 184, 166)",
        backgroundColor: "rgba(20, 184, 166, 0.2)",
        fill: true,
      },
    ],
  }

  const departmentData = {
    labels: ["Cardiology", "Orthopedics", "Pediatrics", "Neurology", "Dermatology"],
    datasets: [
      {
        label: "Appointments by Department",
        data: [120, 90, 85, 70, 65],
        backgroundColor: "rgba(20, 184, 166, 0.6)",
      },
    ],
  }

  return (
    <div className="h-screen overflow-hidden font-sans antialiased remove-scrollbar">
      {/* Header */}
      <header className="admin-header mb-3 mt-2">
        <Link href="/" className="cursor-pointer">
          <div className="flex flex-row align-middle">
            <img
              src="https://img.icons8.com/arcade/64/hospital.png"
              alt="MediNexus Logo"
              height="100px"
              width="100px"
              className="h-10 w-fit"
            />
            <div className="text-lg font-bold flex items-center justify-center text-teal-400">MediNexus</div>
          </div>
        </Link>
        <p className="text-sm sm:text-lg font-bold flex items-center justify-center text-teal-400">
          Hospital Dashboard
        </p>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-60px)] overflow-auto p-4 remove-scrollbar">
        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {/* Patient Portal Card */}
          <Link href="/patients" className="group" onClick={() => handleLinkClick("Register Patient Portal")}>
            <Card className="h-48 md:h-56 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.01]">
              <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Users className="h-10 w-10 text-teal-400 mb-2 group-hover:scale-105 transition-transform" />
                <h3 className="text-lg font-semibold text-teal-50">Patient Portal</h3>
                <p className="text-xs text-teal-300/70 mb-4">Register Patient and Book Appointments</p>
                <Button className="w-full bg-teal-900 hover:bg-teal-800">Click Here</Button>
              </CardContent>
            </Card>
          </Link>

          {/* Hospital Details Card */}
          <Link href="/hospital" className="group" onClick={() => handleLinkClick("Hospital Details")}>
            <Card className="h-48 md:h-56  border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.01]">
              <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                <ClipboardList className="h-10 w-10 text-teal-400 mb-2 group-hover:scale-105 transition-transform" />
                <h3 className="text-lg font-semibold text-teal-50">Hospital Details</h3>
                <p className="text-xs text-teal-300/70 mb-4">View hospital information</p>
                <Button className="w-full bg-teal-900 hover:bg-teal-800">Click Here</Button>
              </CardContent>
            </Card>
          </Link>

          {/* Doctors Panel Card */}
          <div onClick={() => setShowPasskeyModal(true)} className="group cursor-pointer">
            <Card className="h-48 md:h-56   border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.01]">
              <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Activity className="h-10 w-10 text-teal-400 mb-2 group-hover:scale-105 transition-transform" />
                <h3 className="text-lg font-semibold text-teal-50">Doctors Panel</h3>
                <p className="text-xs text-teal-300/70 mb-4">Manage appointments & records</p>
                <Button className="w-full bg-teal-900 hover:bg-teal-800">Click Here</Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Patients"
              value="1,234"
              icon={<UserPlus size={24} />}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Appointments Today"
              value="45"
              icon={<Clock size={24} />}
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              title="Bed Occupancy"
              value="85%"
              icon={<Bed size={24} />}
              trend={{ value: 3, isPositive: false }}
            />
            <StatCard
              title="Emergency Cases"
              value="8"
              icon={<Ambulance size={24} />}
              trend={{ value: 2, isPositive: true }}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 remove-scrollbar">
            <Card className="bg-teal-900/20 border-teal-400/10 p-4 border-0">
            <h2 className="text-lg text-teal-50 mt-4 ml-5 mb-2">Weekly Appointment Statistics</h2>
              <LineChart data={appointmentTrends} title="Weekly Appointment Trends" />
            </Card>
            <Card className="bg-teal-900/20 border-teal-400/10 p-4 border-0">
            <h2 className="text-lg text-teal-50 mt-4 ml-5 mb-2">Appointments by Department</h2>
              <BarChart data={departmentData} title="" />
            </Card>
          </div>
        </div>
        <footer className="bg-teal-900/20 text-center p-4 mt-3 mb-4">
          <div className="text-white">© MediNexus 2025</div>
        </footer>
      </main>

      {showPasskeyModal && <PasskeyModal open={showPasskeyModal} onClose={() => setShowPasskeyModal(false)} />}
    </div>
  )
}