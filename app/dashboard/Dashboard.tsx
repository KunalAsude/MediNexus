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
            title: `${featureName} Under Construction`,
            description: `${featureName} is currently being built. Please check back later.`,
            variant: 'destructive', // Error style for toast
        });

        // No redirection, links remain static
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
                <p className='text-sm font-bold flex items-center justify-center text-teal-400'>Dashboard</p>
            </header>

            {/* Main Content */}
            <main className="h-[calc(100vh-60px)] overflow-hidden p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Quick Access Cards */}
                    <Link href="/patients" className="group">
                        <Card className="h-32 bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.02]">
                            <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                                <Users className="h-10 w-10 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                                <h3 className="text-lg font-semibold text-teal-50">Patient Portal</h3>
                                <p className="text-xs text-teal-300/70">Manage appointments & records</p>
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
                                    <p className="text-xs text-teal-300/70">Access hospital management</p>
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

                    {/* Notifications Link with Toast */}
                    <Link href="#" className="group" onClick={(e) => handleLinkClick(e, 'Notifications')}>
                        <Card className="h-32 bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.02]">
                            <CardContent className="flex flex-col items-center justify-center h-full p-4 text-center">
                                <ClipboardList className="h-10 w-10 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                                <h3 className="text-lg font-semibold text-teal-50">Notifications</h3>
                                <p className="text-xs text-teal-300/70">View hospital updates</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
                {/* Notifications Section */}
                <div className="mt-4">
                    <h2 className="text-lg text-teal-300 mb-2">Latest Updates</h2>
                    <div className="space-y-2">
                        <div className="p-3 bg-teal-900/30 rounded-lg text-teal-200 text-sm border-l-4 border-teal-500">
                            <p>New appointment slots available for Dr. Smith.</p>
                        </div>
                        <div className="p-3 bg-teal-900/30 rounded-lg text-teal-200 text-sm border-l-4 border-teal-500">
                            <p>Emergency cases have increased in the ICU.</p>
                        </div>
                        <div className="p-3 bg-teal-900/30 rounded-lg text-teal-200 text-sm border-l-4 border-teal-500">
                            <p>Pharmacy is restocking essential medicines.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
