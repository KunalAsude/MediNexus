'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Hospital, Phone, Clock, MapPin, Star, Store, ChevronFirst as FirstAid, Stethoscope, Activity, Users, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setSelectedHospital } from "@/redux/slice/hospitalSlice"; 
import { useRouter } from "next/navigation";
import { getAllHospitals } from "@/lib/actions/patient.actions";



export interface Hospital {
    _id: string;
    name: string;
    location: {
        address: string;
        city: string;
        state: string;
        pincode: string;
    };
    contact: {
        phone: string;
        email: string;
        website?: string; 
    };
    departments: string[];
    facilities: string[];
    ratings: {
        average: number;
        reviews: number;
    };
    image?: string; 
    description?: string; 
    status: "active" | "inactive"; 
}

const services = [
    {
        icon: <FirstAid className="h-8 w-8 text-teal-400" />,
        title: "Emergency Care",
        description: "24/7 emergency medical services with rapid response teams"
    },
    {
        icon: <Stethoscope className="h-8 w-8 text-teal-400" />,
        title: "Specialist Consultation",
        description: "Expert medical consultation across all specialties"
    },
    {
        icon: <Activity className="h-8 w-8 text-teal-400" />,
        title: "Diagnostic Services",
        description: "Advanced diagnostic and imaging facilities"
    },
    {
        icon: <Users className="h-8 w-8 text-teal-400" />,
        title: "Patient Care",
        description: "Comprehensive patient care and support services"
    }
];

export default function Home() {
    const { toast } = useToast();
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const dispatch = useDispatch();
    const router = useRouter();

    useEffect(() => {
        const getHospitals = async () => {
            try {
                const hospitalsData: Hospital[] = await getAllHospitals();
                setHospitals(hospitalsData);
                console.log("Fetched Hospitals:", hospitalsData);
            } catch (error) {
                console.error("Error fetching hospitals:", error);
            }
        };
        getHospitals();
    }, []);

    const handleStoreClick = () => {
        toast({
            title: "Store is Under Maintenance",
            description: "Redirecting to medical store portal...",
            duration: 2000,
            variant: 'destructive',
        });
    };

    const filteredHospitals = hospitals.filter(hospital =>
        hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hospital.location.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
        hospital.location.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleHospitalClick = (hospitalId: string) => {
        dispatch(setSelectedHospital(hospitalId));
        console.log("Selected Hospital ID:", hospitalId);
        router.push('/dashboard');
    };

      return (
        <div className="h-screen font-sans antialiased">
            {/* Header */}
            <header className="admin-header mb-6 flex justify-between items-center px-6">
                <Link href="/" className="cursor-pointer">
                    <div className="flex items-center space-x-2">
                        <img
                            src="https://img.icons8.com/arcade/64/hospital.png"
                            alt="MediNexus Logo"
                            className="h-10 w-10"
                        />
                        <div className="text-lg font-bold text-teal-400">MediNexus</div>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center space-x-6">
                    <a href="#services" className="text-teal-300 hover:text-teal-400 transition-colors">Services</a>
                    <a href="#hospitals" className="text-teal-300 hover:text-teal-400 transition-colors">Hospitals</a>
                    <button
                        onClick={handleStoreClick}
                        className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Medical Store
                    </button>
                </nav>
            </header>

            {/* Hero Section */}
            <div className="bg-teal-900/30 py-16 px-4 sm:px-6 lg:px-8 m-3 rounded-lg">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-teal-400 mb-6">
                        Your Health, Our Priority
                    </h1>
                    <p className="text-xl text-teal-300/70 max-w-3xl mx-auto">
                        Connecting you with leading hospitals and comprehensive medical services for better healthcare
                    </p>
                </div>
            </div>

            {/* Services Section */}
            <section id="services" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-teal-400 mb-8 text-center">Our Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, index) => (
                        <Card key={index} className="bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.02]">
                            <CardContent className="p-6 text-center">
                                <div className="mb-4">{service.icon}</div>
                                <h3 className="text-xl font-semibold text-teal-50 mb-2">{service.title}</h3>
                                <p className="text-teal-300/70">{service.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Medical Store Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <Card className="bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all cursor-pointer"
                    onClick={handleStoreClick}>
                    <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between cursor-pointer">
                        <div className="flex items-center mb-4 md:mb-0">
                            <Store className="h-12 w-12 text-teal-400 mr-6" />
                            <div>
                                <h3 className="text-2xl font-semibold text-teal-50 mb-2">Medical Store Access</h3>
                                <p className="text-teal-300/70">Browse and order medical supplies, equipment, and pharmaceuticals</p>
                            </div>
                        </div>
                        <button className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-lg transition-colors">
                            Access Store
                        </button>
                    </CardContent>
                </Card>
            </section>
            <div className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by hospital name or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-teal-900/20 border-2 border-teal-400/30 text-white px-6 py-4 rounded-lg focus:outline-none focus:border-teal-400 pl-14"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-teal-400" />
                </div>
            </div>


            {/* Hospitals Section */}
            <section id="hospitals" className="py-12 px-4 sm:px-6 lg:px-8 max-w-full mx-auto">
                <h2 className="text-3xl font-bold text-teal-400 mb-8 text-center">Our Network Hospitals</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredHospitals.map((hospital) => (
                        <Card key={hospital._id.toString()} 
                            className="bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all hover:scale-[1.02] cursor-pointer"
                            onClick={() => handleHospitalClick(hospital._id.toString())}
                        >
                            <CardContent className="p-0">
                                {/* Hospital Image */}
                                <div className="relative h-48 w-full">
                                    <img
                                        src={hospital.image || "https://via.placeholder.com/300"}
                                        alt={hospital.name}
                                        className="w-full h-full object-cover rounded-t-lg"
                                    />
                                    <div className="absolute top-4 right-4 bg-teal-900/90 px-3 py-1 rounded-full flex items-center">
                                        <Star className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" />
                                        <span className="text-white text-sm">{hospital.ratings.average}</span>
                                    </div>
                                </div>

                                {/* Hospital Info */}
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-teal-50 mb-4">{hospital.name}</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <MapPin className="h-5 w-5 text-teal-400 mr-3 mt-1 flex-shrink-0" />
                                            <p className="text-teal-300/70">{hospital.location.address}, {hospital.location.city}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <Phone className="h-5 w-5 text-teal-400 mr-3 flex-shrink-0" />
                                            <p className="text-teal-300/70">{hospital.contact.phone}</p>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="h-5 w-5 text-teal-400 mr-3 flex-shrink-0" />
                                            <p className="text-teal-300/70">24/7 Availability</p>
                                        </div>

                                        {/* Specialties */}
                                        <div className="pt-4">
                                            <h4 className="text-sm font-semibold text-teal-400 mb-2">Departments</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {hospital.departments.map((department, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-teal-900/40 text-teal-300 text-xs px-3 py-1 rounded-full"
                                                    >
                                                        {department}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}