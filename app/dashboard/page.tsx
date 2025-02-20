'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PasskeyModal from "@/components/ui/PasskeyModal";
import { Hospital, Users, Stethoscope, Store, Activity, Bell, ClipboardList, UserPlus, Clock, Bed, Ambulance, PieChart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from '@/hooks/use-toast';
import { StatCard } from "@/components/ui/Stat";
import { LineChart } from "@/components/ui/LineChart";
import { BarChart } from "@/components/ui/BarChart";


export default function Home() {
    const [showPasskeyModal, setShowPasskeyModal] = useState(false);
    const { toast } = useToast();

    const handleLinkClick = (e: React.MouseEvent, featureName: string) => {
        e.preventDefault();
        toast({
            title: `${featureName} Under Maintenance`,
            description: `${featureName} is currently being built. Please check back later.`,
            variant: 'destructive',
            duration: 2000,
        });
    };

    const handleLinkClick1 = (featureName: string) => {
        toast({
            title: `Processing Your Request!!`,
            description: `Directing You To ${featureName}`,
            variant: 'default',
            duration: 2000,
        });
    };

    // Sample data for charts
    const appointmentTrends = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Weekly Appointments',
            data: [65, 59, 80, 81, 56, 55, 40],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true
        }]
    };

    const appointmentStatus = {
        labels: ['Completed', 'Canceled', 'Scheduled'],
        datasets: [{
            data: [300, 50, 100],
            backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(255, 206, 86, 0.6)'
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 1
        }]
    };

    const departmentData = {
        labels: ['Cardiology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Dermatology'],
        datasets: [{
            label: 'Appointments by Department',
            data: [120, 90, 85, 70, 65],
            backgroundColor: 'rgba(75, 192, 192, 0.6)'
        }]
    };

    return (
        <div className="h-screen overflow-hidden font-sans antialiased remove-scrollbar">
            {/* Header */}
            <header className='admin-header mb-3'>
                <Link href='/' className='cursor-pointer'>
                    <div className="flex flex-row align-middle">
                        <img
                            src="https://img.icons8.com/arcade/64/hospital.png"
                            alt="MediNexus Logo"
                            height='100px'
                            width='100px'
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <Link href="/patients" className="group" onClick={(e) => handleLinkClick1('Register Patient Portal')}>
                        <Card className="h-40 bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.02]">
                            <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                                <Users className="h-10 w-10 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                                <h3 className="text-lg font-semibold text-teal-50">Patient Portal</h3>
                                <p className="text-xs text-teal-300/70">Register Patient and Book Appointments</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/hospital" className="group" onClick={(e) => handleLinkClick1('Hospital Details')}>
                        <Card className="h-40 bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.02]">
                            <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                                <ClipboardList className="h-10 w-10 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                                <h3 className="text-lg font-semibold text-teal-50">Hospital Details</h3>
                                <p className="text-xs text-teal-300/70">View hospital information</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <div onClick={() => setShowPasskeyModal(true)} className="group cursor-pointer">
                        <Card className="h-40 bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.02]">
                            <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                                <Activity className="h-10 w-10 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                                <h3 className="text-lg font-semibold text-teal-50">Doctors Panel</h3>
                                <p className="text-xs text-teal-300/70">Manage appointments & records</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Link href="#" className="group" onClick={(e) => handleLinkClick(e, 'Medical Store')}>
                        <Card className="h-40 bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.02]">
                            <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                                <Store className="h-10 w-10 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                                <h3 className="text-lg font-semibold text-teal-50">Medical Store</h3>
                                <p className="text-xs text-teal-300/70">Manage pharmacy inventory</p>
                            </CardContent>
                        </Card>
                    </Link>
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
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 remove-scrollbar">
                        <Card className="bg-teal-900/20 border-teal-400/10 p-4">
                            <LineChart data={appointmentTrends} title="Weekly Appointment Trends" />
                        </Card>
                        <Card className="bg-teal-900/20 border-teal-400/10 p-4">
                            <BarChart data={departmentData} title="Appointments by Department" />
                        </Card>
                    </div>
                </div>
            </main>

            {showPasskeyModal && <PasskeyModal open={showPasskeyModal} onClose={() => setShowPasskeyModal(false)} />}
        </div>
    );
}