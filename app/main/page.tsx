"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Phone,
  Clock,
  MapPin,
  Star,
  Store,
  Activity,
  Users,
  Search,
  Award,
  MessageSquare,
  ThumbsUp,
  ArrowRight,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  User,
  ChevronDown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useDispatch } from "react-redux"
import { setSelectedHospital } from "@/redux/slice/hospitalSlice"
import { useRouter } from "next/navigation"
import { getAllHospitals } from "@/lib/actions/patient.actions"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

ChartJS.register(ArcElement, Tooltip, Legend)

// Add a global style to hide scrollbars
const hideScrollbarStyles = `
  /* Hide scrollbar for Chrome, Safari and Opera */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`

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

// Add a Message interface at the top with the existing interfaces
export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp?: string
}

// Add Google Maps types
interface GoogleGeocodeResponse {
  results: Array<{
    formatted_address: string
    geometry: {
      location: {
        lat: number
        lng: number
      }
    }
  }>
  status: string
}

interface UserData {
  id: string
  name: string
  email: string
  profileImage?: string
  phone?: string
  emergencyContact?: {
    name: string
    phone: string
    relation: string
  }
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

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
}

const reviews = [
  { name: "Rajesh K.", rating: 5, comment: "Excellent care and professional staff. Highly recommended!" },
  { name: "Priya S.", rating: 4, comment: "Great experience overall. Quick and efficient service." },
  { name: "Amit P.", rating: 5, comment: "Top-notch facilities and caring doctors. Thank you MediNexus!" },
]

export default function Home() {
  const { toast } = useToast()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const dispatch = useDispatch()
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const [stats, setStats] = useState({ hospitals: 0, patients: 0, rating: 0 })
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [voiceInput, setVoiceInput] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isEmergencyActive, setIsEmergencyActive] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userDetails")
    setIsLoggedIn(false)
    setShowUserMenu(false)
    setUserData(null)
    // Optional: redirect to login page
    // router.push('/login');
  }

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("authToken")
      const storedUserData = localStorage.getItem("userDetails")

      if (token && storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData)
          setIsLoggedIn(true)
          setUserData(parsedUserData)
        } catch (error) {
          console.error("Failed to parse user data from localStorage", error)
          // If parse fails, clear the invalid data
          localStorage.removeItem("userDetails")
          setIsLoggedIn(false)
          setUserData(null)
        }
      } else {
        // If either token or userData is missing, set not logged in
        setIsLoggedIn(false)
        setUserData(null)
      }
    }

    // Check on initial load
    checkLoginStatus()

    // Add event listener for storage changes (if user logs in/out in another tab)
    window.addEventListener("storage", checkLoginStatus)

    return () => {
      window.removeEventListener("storage", checkLoginStatus)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if browser supports SpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true

        recognitionInstance.onresult = (event: any) => {
          const current = event.resultIndex
          const result = event.results[current]
          const transcriptText = result[0].transcript

          if (result.isFinal) {
            handleVoiceInput(transcriptText)
            setIsListening(false)
            recognitionInstance.stop()
          }
        }

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setIsListening(false)
        }

        setRecognition(recognitionInstance)
      }
    }
  }, [])

  const handleVoiceInput = (transcript: string) => {
    if (transcript.trim()) {
      setVoiceInput(transcript)
      // Navigate to chat page with the voice input as a query parameter
      router.push(`/chat?message=${encodeURIComponent(transcript)}`)
    }
  }

  const handleChatBoxClick = () => {
    router.push("/chat")
  }

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
    window.location.href = "https://medical-store-bice.vercel.app/"
  }

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

  const scrollToHospitals = () => {
    document.getElementById("hospitals")?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleEmergencyClick = async () => {
    if (isGettingLocation) return

    try {
      setIsGettingLocation(true)
      setIsEmergencyActive(true)

      // Request location with high accuracy
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })

      const { latitude, longitude } = position.coords

      // Prepare emergency data
      const emergencyData = {
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
        userDetails: {
          id: userData?.id || "anonymous",
          name: userData?.name || "Anonymous User",
          email: userData?.email || "No email available",
          phone: userData?.phone || "No phone available",
          emergencyContact: userData?.emergencyContact || null,
        },
      }

      // Send emergency alert email using Resend
      const emailResponse = await fetch("/api/send-emergency-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emergencyData),
      })

      if (!emailResponse.ok) {
        throw new Error("Failed to send emergency alert")
      }

      // Show success message
      toast({
        title: "Emergency Alert Sent",
        description: "Your location has been sent to the MediNexus emergency team. Help is on the way.",
        variant: "destructive",
      })

      // Reset states after 5 seconds
      setTimeout(() => {
        setIsEmergencyActive(false)
        setIsGettingLocation(false)
      }, 5000)
    } catch (error) {
      console.error("Error in emergency alert:", error)
      toast({
        title: "Error",
        description: "Could not send emergency alert. Please try again or call emergency services directly.",
        variant: "destructive",
      })
      setIsGettingLocation(false)
      setIsEmergencyActive(false)
    }
  }

  return (
    <div className="min-h-screen font-sans antialiased no-scrollbar overflow-x-hidden">
      <style jsx global>
        {hideScrollbarStyles}
      </style>

      {/* Header */}
      <header className="fixed top-0 w-full flex justify-between items-center bg-teal-950 px-6 py-2 shadow-md z-50">
        <Link href="/" className="cursor-pointer">
          <div className="flex items-center space-x-2">
            <img src="https://img.icons8.com/arcade/64/hospital.png" alt="MediNexus Logo" className="h-10 w-10" />
            <div className="text-lg font-bold text-teal-400">MediNexus</div>
          </div>
        </Link>

        <nav className="flex items-center space-x-6">
          <button
            onClick={() => {
              if (recognition) {
                if (isListening) {
                  recognition.stop()
                  setIsListening(false)
                } else {
                  recognition.start()
                  setIsListening(true)
                }
              }
            }}
            className={`p-2 rounded-full ${isListening ? "bg-red-500/20 text-red-400" : "bg-cyan-900 hover:bg-teal-800/50"} transition-colors`}
            aria-label={isListening ? "Stop listening" : "Start voice assistant"}
          >
            {isListening ? <MicOff size={20} className="text-red-400" /> : <Mic size={20} className="text-teal-300" />}
          </button>
          {isListening && <div className="hidden md:block text-sm italic text-teal-300">Listening...</div>}
          <a href="#hospitals" className="hidden md:inline text-teal-300 hover:text-teal-400 transition-colors">
            Hospitals
          </a>
          <button
            onClick={handleStoreClick}
            className="hidden md:inline bg-teal-700 hover:bg-teal-800 text-white px-2 py-1 rounded-lg transition-colors"
          >
            Store
          </button>
          {isLoggedIn ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-1 text-teal-300 hover:text-teal-400"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center overflow-hidden">
                  {userData?.profileImage ? (
                    <img
                      src={userData.profileImage || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={16} className="text-teal-300" />
                  )}
                </div>
                <span className="hidden md:inline">{userData?.name || "Account"}</span>
                <ChevronDown size={16} className={`transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-teal-900 rounded-md shadow-lg py-1 z-10 border border-teal-700">
                  <div className="px-4 py-3 border-b border-teal-700">
                    <p className="text-sm text-teal-300 font-medium">{userData?.name || "User"}</p>
                    <p className="text-xs text-teal-400 truncate">{userData?.email || ""}</p>
                  </div>
                  <a
                    href={`/patient-profile/${userData?.id}`}
                    className="block px-4 py-2 text-sm text-teal-300 hover:bg-teal-800 flex items-center"
                  >
                    <User size={16} className="mr-2" />
                    Profile
                  </a>
                  <a
                    href={`/patient-profile/${userData?.id}`}
                    className="block px-4 py-2 text-sm text-teal-300 hover:bg-teal-800 flex items-center"
                  >
                    <Activity size={16} className="mr-2" />
                    Medical History
                  </a>
                  <a
                    href={`/patient-profile/${userData?.id}`}
                    className="block px-4 py-2 text-sm text-teal-300 hover:bg-teal-800 flex items-center"
                  >
                    <Clock size={16} className="mr-2" />
                    Appointments
                  </a>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-teal-800 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/login"
              className="flex items-center space-x-1 text-teal-300 hover:text-teal-400 transition-colors"
            >
              <User size={20} />
              <span className="hidden md:inline">Login</span>
            </a>
          )}
          <button
            onClick={handleEmergencyClick}
            className={`p-2 rounded-full ${isEmergencyActive ? "animate-pulse" : " hover:bg-red-600"} transition-colors flex items-center gap-2 text-white`}
            aria-label="Emergency Alert"
          >
            <img
              src="https://res.cloudinary.com/kunalstorage/image/upload/v1742881523/emergency-removebg-preview_1_f4yow9.png"
              alt="MediNexus Logo"
              className="h-8 w-8"
            />
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="bg-teal-900/30 pt-20  sm:pt-28 pb-16 mt-20 px-4 sm:px-6 lg:px-8 m-3 rounded-lg">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block bg-teal-900/50 text-teal-400 px-4 py-1 rounded-full text-sm font-medium mb-6">
            Trusted by 500+ hospitals nationwide
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-teal-300 mb-6 leading-tight">
            Your Health, <span className="text-white">Our Priority</span>
          </h1>
          <p className="text-xl text-white max-w-3xl mx-auto mb-10">
            Connecting you with leading hospitals and comprehensive medical services for better healthcare experiences
            across India
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={scrollToHospitals}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 rounded-lg text-lg"
            >
              Find Hospitals <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={handleChatBoxClick}
              className="bg-teal-900/50 hover:bg-teal-900/70 text-teal-300 border border-teal-600 px-8 py-6 rounded-lg text-lg"
            >
              Ask MediAssist <MessageSquare className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-teal-800/40 p-6 rounded-lg border border-teal-700/50 shadow-lg">
              <h3 className="text-3xl font-bold text-teal-300">{stats.hospitals}+</h3>
              <p className="text-white">Network Hospitals</p>
            </div>
            <div className="bg-teal-800/40 p-6 rounded-lg border border-teal-700/50 shadow-lg">
              <h3 className="text-3xl font-bold text-teal-300">{stats.patients.toLocaleString()}+</h3>
              <p className="text-white">Patients Served</p>
            </div>
            <div className="bg-teal-800/40 p-6 rounded-lg border border-teal-700/50 shadow-lg">
              <h3 className="text-3xl font-bold text-teal-300">{stats.rating.toFixed(1)}/5</h3>
              <p className="text-white">Average Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Store Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Card
          className="bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all cursor-pointer overflow-hidden"
          onClick={handleStoreClick}
        >
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-center">
              <div className="p-8 md:p-10 flex-1">
                <div className="flex items-center mb-6">
                  <Store className="h-12 w-12 text-teal-400 mr-6" />
                  <h3 className="text-2xl md:text-3xl font-bold text-teal-50">MediNexus Pharmacy</h3>
                </div>
                <p className="text-teal-100 text-lg mb-8 max-w-xl">
                  Browse and order medical supplies, equipment, and pharmaceuticals with doorstep delivery within 24
                  hours. Access to over 10,000+ medicines and healthcare products.
                </p>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center">
                    <Badge className="bg-teal-800/50 text-teal-300 px-3 py-1">24/7 Availability</Badge>
                  </div>
                  <div className="flex items-center">
                    <Badge className="bg-teal-800/50 text-teal-300 px-3 py-1">Free Delivery</Badge>
                  </div>
                  <div className="flex items-center">
                    <Badge className="bg-teal-800/50 text-teal-300 px-3 py-1">Prescription Upload</Badge>
                  </div>
                </div>
                <Button className="bg-teal-700 hover:bg-teal-800 text-white px-8 py-3 rounded-lg">
                  Access Pharmacy <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <div className="w-full md:w-2/5 h-64 md:h-auto relative">
                <img
                  src="https://img.freepik.com/free-photo/high-angle-pill-foils-plastic-containers_23-2148533456.jpg?t=st=1741627790~exp=1741631390~hmac=38dd5daed84f10cb434337c9febc5bba2800dfecc766f693369ccea76cb4b5b4&w=1380"
                  alt="Medical Store"
                  className="w-full h-70 rouned-2xl object-contain sm:pr-4 rouned-2xl"
                />
                <div className="absolute inset-0 "></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Achievements Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-teal-400 mb-8 text-center">Our Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <Card
              key={index}
              className="bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all cursor-pointer"
              onClick={handleChatBoxClick}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4">{achievement.icon}</div>
                <h3 className="text-xl font-semibold text-teal-50 mb-2">{achievement.title}</h3>
                <p className="text-teal-300/70">{achievement.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredHospitals.map((hospital, index) => (
            <Card
              key={index}
              className="bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all cursor-pointer overflow-hidden"
              onClick={() => handleHospitalClick(hospital._id.toString())}
            >
              <CardContent className="p-0">
                {/* Hospital Image */}
                <div className="relative h-40 sm:h-48 w-full">
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
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-teal-50 mb-3 sm:mb-4">{hospital.name}</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-teal-400 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
                      <p className="text-sm sm:text-base text-teal-300/70">
                        {hospital.location.address}, {hospital.location.city}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-teal-400 mr-2 sm:mr-3 flex-shrink-0" />
                      <p className="text-sm sm:text-base text-teal-300/70">{hospital.contact.phone}</p>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-teal-400 mr-2 sm:mr-3 flex-shrink-0" />
                      <p className="text-sm sm:text-base text-teal-300/70">24/7 Availability</p>
                    </div>

                    {/* Specialties */}
                    <div className="pt-3 sm:pt-4">
                      <h4 className="text-xs sm:text-sm font-semibold text-teal-400 mb-2">Departments</h4>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {hospital.departments.slice(0, 3).map((department, index) => (
                          <span
                            key={index}
                            className="bg-teal-900/40 text-teal-300 text-xs px-2 sm:px-3 py-1 rounded-full"
                          >
                            {department}
                          </span>
                        ))}
                        {hospital.departments.length > 3 && (
                          <span className="bg-teal-900/40 text-teal-300 text-xs px-2 sm:px-3 py-1 rounded-full">
                            +{hospital.departments.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
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
            <Card
              key={index}
              className="bg-teal-900/20 border-teal-400/10 hover:bg-teal-900/30 transition-all cursor-pointer"
              onClick={handleChatBoxClick}
            >
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

      {/* Chat Button */}
      <button
        onClick={handleChatBoxClick}
        className="fixed bottom-14 right-6 p-4 rounded-full shadow-lg z-50 bg-cyan-950 hover:bg-cyan-900 transition-colors"
        aria-label="Open chat"
      >
        <MessageSquare size={28} className="text-white" />
      </button>

      {/* Footer */}
      <footer className=" text-zinc-400 pt-16 pb-8 mt-auto border-t border-t-zinc-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Section with Logo and Newsletter */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="https://img.icons8.com/arcade/64/hospital.png"
                alt="MediNexus Logo"
                className="h-12 w-12 relative z-10"
              />
              <div className="absolute -inset-1 bg-teal-900/50 rounded-lg blur-sm" />
            </div>
            <span className="text-2xl font-bold text-white">MediNexus</span>
          </div>

          <div className="max-w-md w-full">
            <h4 className="text-white font-semibold mb-3 text-left">Join Our Newsletter</h4>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-zinc-800 border-zinc-700 focus:border-teal-500"
                
                onChange={(e) => console.log("")}
              />
              <Button type="submit" className="bg-teal-600 hover:bg-teal-500 text-white border-0">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 text-left">
          <div>
            <h4 className="text-white font-semibold mb-6 relative inline-block">
              <span className="relative z-10">Quick Links</span>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-green-500 to-teal-500"></span>
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2 group">
                  <span className="h-px w-4 bg-green-500 group-hover:w-6 transition-all"></span>
                  Home
                </a>
              </li>
              <li>
                <a href="#hospitals" className="hover:text-teal-400 transition-colors flex items-center gap-2 group">
                  <span className="h-px w-4 bg-green-500 group-hover:w-6 transition-all"></span>
                  Hospitals
                </a>
              </li>
              <li>
                <a href="#doctors" className="hover:text-teal-400 transition-colors flex items-center gap-2 group">
                  <span className="h-px w-4 bg-green-500 group-hover:w-6 transition-all"></span>
                  Find a Doctor
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6 relative inline-block">
              <span className="relative z-10">Contact</span>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-green-500 to-teal-500"></span>
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-2 hover:text-teal-400 transition-colors cursor-pointer">
                <Mail className="h-4 w-4 text-green-500" />
                support@medinexus.com
              </li>
              <li className="flex items-center gap-2 hover:text-teal-400 transition-colors cursor-pointer">
                <Phone className="h-4 w-4 text-green-500" />
                +91 1234567890
              </li>
              <li className="flex items-center gap-2 hover:text-teal-400 transition-colors cursor-pointer">
                <MapPin className="h-4 w-4 text-green-500" />
                New Delhi, India
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6 relative inline-block">
              <span className="relative z-10">Legal</span>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-green-500 to-teal-500"></span>
            </h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2 group">
                  <span className="h-px w-4 bg-green-500 group-hover:w-6 transition-all"></span>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2 group">
                  <span className="h-px w-4 bg-green-500 group-hover:w-6 transition-all"></span>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors flex items-center gap-2 group">
                  <span className="h-px w-4 bg-green-500 group-hover:w-6 transition-all"></span>
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6 relative inline-block">
              <span className="relative z-10">Connect With Us</span>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-green-500 to-teal-500"></span>
            </h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-teal-400 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-teal-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-teal-400 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-teal-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-8 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
              <h5 className="text-white font-semibold mb-2">24/7 Emergency</h5>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                1800-MED-HELP
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-t-zinc-900 text-center">
          <div className="flex items-center justify-center gap-1 text-sm">© {new Date().getFullYear()} MediNexus.</div>
        </div>
      </div>
    </footer>
    </div>
  )
}

