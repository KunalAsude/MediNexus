"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Phone,
    Clock,
    MapPin,
    Star,
    Store,
    AmbulanceIcon as FirstAid,
    Stethoscope,
    Activity,
    Users,
    Search,
    Award,
    ThumbsUp,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useDispatch } from "react-redux"
import { setSelectedHospital } from "@/redux/slice/hospitalSlice"
import { useRouter } from "next/navigation"
import { getAllHospitals } from "@/lib/actions/patient.actions"
import { motion } from "framer-motion"
import { scaleUp } from "../../components/ui/animations"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { LineChart } from "@/components/ui/LineChart"
import { Doughnut } from "react-chartjs-2"



ChartJS.register(ArcElement, Tooltip, Legend)

export interface Hospital {
    _id: string
    name: string
    location: {
        address: string
        city: string
        state: string
        pincode: string
    }
    contact: {
        phone: string
        email: string
        website?: string
    }
    departments: string[]
    facilities: string[]
    ratings: {
        average: number
        reviews: number
    }
    image?: string
    description?: string
    status: "active" | "inactive"
}

const services = [
    {
        icon: <FirstAid className="h-8 w-8 text-teal-400" />,
        title: "Emergency Care",
        description: "24/7 emergency medical services with rapid response teams",
    },
    {
        icon: <Stethoscope className="h-8 w-8 text-teal-400" />,
        title: "Specialist Consultation",
        description: "Expert medical consultation across all specialties",
    },
    {
        icon: <Activity className="h-8 w-8 text-teal-400" />,
        title: "Diagnostic Services",
        description: "Advanced diagnostic and imaging facilities",
    },
    {
        icon: <Users className="h-8 w-8 text-teal-400" />,
        title: "Patient Care",
        description: "Comprehensive patient care and support services",
    },
]

const achievements = [
    {
        icon: <Award className="h-8 w-8 text-teal-400" />,
        title: "Best Hospital Network 2024",
        description: "Awarded by Healthcare Excellence Institute",
    },
    {
        icon: <ThumbsUp className="h-8 w-8 text-teal-400" />,
        title: "98% Patient Satisfaction",
        description: "Based on 50,000+ patient reviews",
    },
    {
        icon: <Users className="h-8 w-8 text-teal-400" />,
        title: "1M+ Patients Served",
        description: "Across our network in the last year",
    },
]
const appointmentData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
        {
            label: "Weekly Appointments",
            data: [72, 61, 90, 75, 63, 58, 45], // Example appointment counts
            borderColor: "rgb(20, 184, 166)",
            backgroundColor: "rgba(20, 184, 166, 0.2)",
            fill: true,
        },
    ],
};



const reviews = [
    { name: "Rajesh K.", rating: 5, comment: "Excellent care and professional staff. Highly recommended!" },
    { name: "Priya S.", rating: 4, comment: "Great experience overall. Quick and efficient service." },
    { name: "Amit P.", rating: 5, comment: "Top-notch facilities and caring doctors. Thank you MediNexus!" },
];

export default function Home() {
    const { toast } = useToast()
    const [hospitals, setHospitals] = useState<Hospital[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const dispatch = useDispatch()
    const router = useRouter()

    const [stats, setStats] = useState({ hospitals: 0, patients: 0, rating: 0 })

    useEffect(() => {
        const getHospitals = async () => {
            try {
                const hospitalsData: Hospital[] = await getAllHospitals()
                setHospitals(hospitalsData)
                console.log("Fetched Hospitals:", hospitalsData)
            } catch (error) {
                console.error("Error fetching hospitals:", error)
            }
        }
        getHospitals()

        const interval = setInterval(() => {
            setStats((prev) => ({
                hospitals: Math.min(prev.hospitals + 5, 500),
                patients: Math.min(prev.patients + 1000, 50000),
                rating: Math.min(prev.rating + 0.1, 4.8),
            }))
        }, 50)

        return () => clearInterval(interval)
    }, [])

    const handleStoreClick = () => {
        window.location.href = "https://medical-store-bice.vercel.app/";
    };
    

    const filteredHospitals = hospitals.filter(
        (hospital) =>
            hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hospital.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hospital.location.city.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const handleHospitalClick = (hospitalId: string) => {
        dispatch(setSelectedHospital(hospitalId))
        console.log("Selected Hospital ID:", hospitalId)
        router.push("/dashboard")
    }

    return (
        <div className="min-h-screen font-sans antialiased">
            {/* Header */}
            <header className="admin-header mb-6 flex justify-between items-center px-6 py-4 bg-teal-900/50">
                <Link href="/" className="cursor-pointer">
                    <div className="flex items-center space-x-2">
                        <img src="https://img.icons8.com/arcade/64/hospital.png" alt="MediNexus Logo" className="h-10 w-10" />
                        <div className="text-lg font-bold text-teal-400">MediNexus</div>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center space-x-6">
                    <a href="#services" className="text-teal-300 hover:text-teal-400 transition-colors">
                        Services
                    </a>
                    <a href="#hospitals" className="text-teal-300 hover:text-teal-400 transition-colors">
                        Hospitals
                    </a>
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
                    <h1 className="text-4xl md:text-5xl font-bold text-teal-300 mb-6">Your Health, Our Priority</h1>
                    <p className="text-xl text-white max-w-3xl mx-auto mb-8">
                        Connecting you with leading hospitals and comprehensive medical services for better healthcare
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        <div className="bg-teal-800/30 p-4 rounded-lg">
                            <h3 className="text-2xl font-bold text-teal-300">{stats.hospitals}+</h3>
                            <p className="text-white">Network Hospitals</p>
                        </div>
                        <div className="bg-teal-800/30 p-4 rounded-lg">
                            <h3 className="text-2xl font-bold text-teal-300">{stats.patients.toLocaleString()}+</h3>
                            <p className="text-white">Patients Served</p>
                        </div>
                        <div className="bg-teal-800/30 p-4 rounded-lg">
                            <h3 className="text-2xl font-bold text-teal-300">{stats.rating.toFixed(1)}/5</h3>
                            <p className="text-white">Average Rating</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Services Section */}
            <section id="services" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-teal-400 mb-8 text-center">Our Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, index) => (
                        <Card className="bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all">
                            <CardContent className="p-6 text-center">
                                <div className="mb-4">{service.icon}</div>
                                <h3 className="text-xl font-semibold text-teal-50 mb-2">{service.title}</h3>
                                <p className="text-teal-300/70">{service.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-10 px-4 sm:px-6 lg:px-5 max-w-full mx-auto">
                <h2 className="text-3xl font-bold text-teal-400 mb-8 text-center">Our Impact</h2>
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="bg-teal-900/20 border-teal-400/10 w-full h-full">
                        <h2 className="text-lg text-teal-50 mt-4 ml-5 mb-2">Weekly Appointment Statistics</h2>
                        <CardContent>
                            <LineChart data={appointmentData} title="Weekly Appointment Trends" />
                        </CardContent>
                    </Card>
                    <Card className="bg-teal-900/20 border-teal-400/10">
                        <h2 className="text-lg text-teal-50 mt-4 ml-5">Weekly Department Statistics</h2>
                        <CardContent>
                            <div className="w-64 h-64 mt-4 lg:w-80 lg:h-80 mx-auto relative">
                                <Doughnut
                                    className="mt-2 border-0"
                                    data={{
                                        labels: ["Cardiology", "Orthopedics", "Neurology", "Oncology", "Pediatrics"],
                                        datasets: [
                                            {
                                                data: [30, 20, 25, 15, 10],
                                                backgroundColor: [
                                                    "#0A6A52", // Dark teal - Cardiology
                                                    "#A07089", // Muted mauve - Orthopedics
                                                    "#178245", // Deep greenish teal - Neurology
                                                    "#158F80", // Dark green - Oncology
                                                    "#B29D35", // Deep magenta-pink - Pediatrics
                                                ],
                                                borderColor: "rgba(255, 255, 255, 1)",
                                                borderWidth: 0,
                                                cutout: "60%", // Makes the center thinner
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: false, // Hides default legend
                                            },
                                        },
                                    }}
                                />
                            </div>

                            {/* Fixed Legend Colors to Match Chart Order */}
                            <div className="grid grid-cols-3 gap-4 mt-3 text-xs text-white">
                                <div className="flex items-center space-x-2">
                                    <span className="w-4 h-4 bg-[#0A6A52] rounded-full"></span>
                                    <span>Cardiology</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-4 h-4 bg-[#A07089] rounded-full"></span>
                                    <span>Orthopedics</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-4 h-4 bg-[#178245] rounded-full"></span>
                                    <span>Neurology</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-4 h-4 bg-[#158F80] rounded-full"></span>
                                    <span>Oncology</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-4 h-4 bg-[#B24D85] rounded-full"></span>
                                    <span>Pediatrics</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>


                </div>
            </section>

            {/* Achievements Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-teal-400 mb-8 text-center">Our Achievements</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {achievements.map((achievement, index) => (
                        <Card key={index} className="bg-teal-900/20 border-teal-400/10">
                            <CardContent className="p-6 text-center">
                                <div className="mb-4">{achievement.icon}</div>
                                <h3 className="text-xl font-semibold text-teal-50 mb-2">{achievement.title}</h3>
                                <p className="text-teal-300/70">{achievement.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Patient Reviews Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-teal-400 mb-8 text-center">Patient Reviews</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map((review, index) => (
                        <Card key={index} className="bg-teal-900/20 border-teal-400/10">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-4">
                                    <Star className="h-5 w-5 text-yellow-400 mr-1" fill="currentColor" />
                                    <span className="text-teal-300 font-semibold">{review.rating}/5</span>
                                </div>
                                <p className="text-teal-100 mb-4">"{review.comment}"</p>
                                <p className="text-teal-300 font-semibold">- {review.name}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Medical Store Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <Card
                    className="bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all cursor-pointer"
                    onClick={handleStoreClick}
                >
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

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8 px-3 sm:px-0">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by hospital name or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-teal-900/20 border-2 border-teal-400/30 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg focus:outline-none focus:border-teal-400 pl-12 sm:pl-14"
                    />
                    <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-teal-400" />
                </div>
            </div>

            {/* Hospitals Section */}
            <section id="hospitals" className="py-12 px-4 sm:px-6 lg:px-8 max-w-full mx-auto">
                <h2 className="text-3xl font-bold text-teal-400 mb-8 text-center">Our Network Hospitals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredHospitals.map((hospital) => (

                        <Card
                            className="bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all cursor-pointer overflow-hidden"
                            onClick={() => handleHospitalClick(hospital._id.toString())}
                        >
                            <CardContent className="p-0">
                                {/* Hospital Image */}
                                <div className="relative h-48 w-full">
                                    <img
                                        src={hospital.image || "https://via.placeholder.com/300"}
                                        alt={hospital.name}
                                        className="w-full h-full object-cover"
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
                                            <p className="text-teal-300/70">
                                                {hospital.location.address}, {hospital.location.city}
                                            </p>
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
                                                    <span key={index} className="bg-teal-900/40 text-teal-300 text-xs px-3 py-1 rounded-full">
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

            {/* Footer */}
            <footer className="bg-teal-900/20 text-center p-4 mt-auto">
                <div className="text-white">© MediNexus {new Date().getFullYear()}</div>
            </footer>
        </div>
    )
}

