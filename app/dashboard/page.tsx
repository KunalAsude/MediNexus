'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PasskeyModal from "@/components/ui/PasskeyModal";
import { Hospital, Users, Stethoscope, Store, Activity, Bell, ClipboardList } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function Home() {
    const [showPasskeyModal, setShowPasskeyModal] = useState(false);
    const { toast } = useToast(); // Initialize the toast function

    // Handle link click to show toast
    const handleLinkClick = (e: React.MouseEvent, featureName: string) => {
        e.preventDefault(); // Prevent immediate navigation

        toast({
            title: `${featureName} Under Maintenance`,
            description: `${featureName} is currently being built. Please check back later.`,
            variant: 'destructive', // Error style for toast
            duration: 2000, // Auto-hide after 3 seconds
        });
    };

    const handleLinkClick1 = (featureName: string) => {
        toast({
            title: `Processing Your Request!!`,
            description: `Directing You To ${featureName}`,
            variant: 'default',
            duration: 2000, // Auto-hide after 3 seconds
        });
    };

    return (
        <div className="h-screen overflow-hidden font-sans antialiased">
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
            <main className="h-[calc(100vh-60px)] p-4 flex flex-col">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {/* Quick Access Cards */}
                    <Link href="/patients" className="group" onClick={(e) => handleLinkClick1("Register Patient Portal")}>
                        <Card className="h-40 bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.02]">
                            <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                                <Users className="h-12 w-12 text-teal-400 mb-3 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-semibold text-teal-50 mb-1">Patient Portal</h3>
                                <p className="text-sm text-teal-300/70">Register Patient and Book Appointments</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/hospital" className="group" onClick={(e) => handleLinkClick1("Hospital Details")}>
                        <Card className="h-40 bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.02]">
                            <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                                <ClipboardList className="h-12 w-12 text-teal-400 mb-3 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-semibold text-teal-50 mb-1">Hospital Details</h3>
                                <p className="text-sm text-teal-300/70">View hospital information</p>
                            </CardContent>
                        </Card>
                    </Link>

                    <div onClick={() => setShowPasskeyModal(true)} className="group cursor-pointer">
                        <Card className="h-40 bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.02]">
                            <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                                <Activity className="h-12 w-12 text-teal-400 mb-3 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-semibold text-teal-50 mb-1">Doctors Panel</h3>
                                <p className="text-sm text-teal-300/70">Manage appointments & records</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Link href="#" className="group" onClick={(e) => handleLinkClick(e, "Medical Store")}>
                        <Card className="h-40 bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.02]">
                            <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                                <Store className="h-12 w-12 text-teal-400 mb-3 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-semibold text-teal-50 mb-1">Medical Store</h3>
                                <p className="text-sm text-teal-300/70">Manage pharmacy inventory</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Notifications Section */}
                <div className="mt-6 flex flex-col flex-1 overflow-hidden mb-5 mr-1">
                    <h2 className="text-2xl font-bold text-teal-300 mb-4">Latest Updates</h2>
                    <div className="flex-1 overflow-y-auto remove-scrollbar ">
                        <div className="space-y-4">
                            <div className="p-4 bg-teal-950/20 rounded-xl text-white text-base border-l-8 border-teal-500 shadow-lg">
                                <p className="font-semibold">🩺 New appointment slots available for Dr. Johnson and Dr. Patel.</p>
                            </div>
                            <div className="p-4 bg-teal-950/40 rounded-xl text-white text-base border-l-8 border-red-500 shadow-lg">
                                <p className="font-semibold">🏥 ICU capacity has been increased to accommodate more critical patients.</p>
                            </div>
                            <div className="p-4 bg-teal-950/40 rounded-xl text-white text-base border-l-8 border-blue-500 shadow-lg">
                                <p className="font-semibold">💊 The pharmacy has restocked essential medicines, including emergency supplies.</p>
                            </div>
                            <div className="p-4 bg-teal-950/40 rounded-xl text-white text-base border-l-8 border-yellow-500 shadow-lg">
                                <p className="font-semibold">🩸 Blood donation camp scheduled for this Saturday in the hospital lobby.</p>
                            </div>
                            <div className="p-4 bg-teal-950/40 rounded-xl text-white text-base border-l-8 border-purple-500 shadow-lg">
                                <p className="font-semibold">🖥️ New advanced MRI scanning machine installed in the radiology department.</p>
                            </div>
                        </div>
                    </div>
                </div>


            </main>
        </div>
    );
}
