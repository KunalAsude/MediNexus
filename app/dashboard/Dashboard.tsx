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
                <p className='text-xl font-bold flex items-center justify-center text-teal-400'>Dashboard</p>
            </header>

            {/* Main Content */}
            <main className="h-[calc(100vh-60px)] overflow-hidden p-4 flex flex-col">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Quick Access Cards */}
                    <Link href="/patients" className="group" onClick={(e) => handleLinkClick1('Register Patient Portal')}>
                        <Card className="h-32 bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.02]">
                            <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                                <Users className="h-10 w-10 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                                <h3 className="text-lg font-semibold text-teal-50">Patient Portal</h3>
                                <p className="text-xs text-teal-300/70">Register Patient and Book Appointments</p>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Hospital Details Link with Toast */}
                    <Link href="/hospital" className="group" onClick={(e) => handleLinkClick1('Hospital Details')}>
                        <Card className="h-32 bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.02]">
                            <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                                <ClipboardList className="h-10 w-10 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                                <h3 className="text-lg font-semibold text-teal-50">Hospital Details</h3>
                                <p className="text-xs text-teal-300/70">View hospital information</p>
                            </CardContent>
                        </Card>
                    </Link>


                    <div>
                        {/* Admin Panel Card */}
                        <div onClick={() => setShowPasskeyModal(true)} className="group cursor-pointer">
                            <Card className="h-32 bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.02]">
                                <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                                    <Activity className="h-10 w-10 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-lg font-semibold text-teal-50">Admin Panel</h3>
                                    <p className="text-xs text-teal-300/70">Manage appointments & records</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Render PasskeyModal when clicked */}
                        {showPasskeyModal && <PasskeyModal />}
                    </div>

                    {/* Medical Store Link with Toast */}
                    <Link href="#" className="group" onClick={(e) => handleLinkClick(e, 'Medical Store')}>
                        <Card className="h-32 bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.02]">
                            <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                                <Store className="h-10 w-10 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                                <h3 className="text-lg font-semibold text-teal-50">Medical Store</h3>
                                <p className="text-xs text-teal-300/70">Manage pharmacy inventory</p>
                            </CardContent>
                        </Card>
                    </Link>

                </div>

                {/* Notifications Section */}
                <div className="mt-6 flex flex-col flex-1 overflow-hidden mb-5 mr-1">
                    <h2 className="text-2xl font-bold text-teal-300 mb-4">Latest Updates</h2>
                    <div className="flex-1 overflow-y-auto remove-scrollbar ">
                        <div className="space-y-4">
                            <div className="p-5 bg-teal-900/40 rounded-xl text-white text-base border-l-8 border-teal-500 shadow-lg">
                                <p className="font-semibold">🩺 New appointment slots available for Dr. Johnson and Dr. Patel.</p>
                            </div>
                            <div className="p-5 bg-teal-900/40 rounded-xl text-white text-base border-l-8 border-red-500 shadow-lg">
                                <p className="font-semibold">🏥 ICU capacity has been increased to accommodate more critical patients.</p>
                            </div>
                            <div className="p-5 bg-teal-900/40 rounded-xl text-white text-base border-l-8 border-blue-500 shadow-lg">
                                <p className="font-semibold">💊 The pharmacy has restocked essential medicines, including emergency supplies.</p>
                            </div>
                            <div className="p-5 bg-teal-900/40 rounded-xl text-white text-base border-l-8 border-yellow-500 shadow-lg">
                                <p className="font-semibold">🩸 Blood donation camp scheduled for this Saturday in the hospital lobby.</p>
                            </div>
                            <div className="p-5 bg-teal-900/40 rounded-xl text-white text-base border-l-8 border-purple-500 shadow-lg">
                                <p className="font-semibold">🖥️ New advanced MRI scanning machine installed in the radiology department.</p>
                            </div>
                            <div className="p-5 bg-teal-900/40 rounded-xl text-white text-base border-l-8 border-green-500 shadow-lg">
                                <p className="font-semibold">💉 COVID-19 booster shots now available at the outpatient department.</p>
                            </div>
                        </div>
                    </div>
                </div>


            </main>
        </div>
    );
}
