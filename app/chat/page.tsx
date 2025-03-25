"use client"

import { useState, useRef, useEffect } from "react"
import { Stethoscope, Users, Send, Mic, MicOff } from "lucide-react"
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import connect from "@/lib/mongodb"
import doctorModal from "@/lib/modals/doctorModal"
import { getAllDoctors } from "@/lib/actions/patient.actions"
import { useRouter } from "next/navigation"

// Interfaces
interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
}

// Updated Doctor interface to match your actual data structure
interface Doctor {
  _id: string
  name: string
  specialization: string
  experience: number
  hospitalId: string
  ratings_average: number
  ratings_reviews: number
  email: string
  phone: string
  image: string
  status: string
  weeklyAvailability: {
    monday: string[]
    tuesday: string[]
    wednesday: string[]
    thursday: string[]
    friday: string[]
    saturday: string[]
    sunday: string[]
  }
  availableSlots: any[]
  updatedAt: string
}

// Simplified symptom to specialty mapping
const symptomToSpecialtyMapping = {
  // Common symptoms mapped to specialties
  "headache": "Neurologist",
  "migraine": "Neurologist",
  "dizziness": "Neurologist",
  
  "tooth": "Dentist",
  "teeth": "Dentist",
  "gum": "Dentist",
  
  "chest pain": "Cardiologist",
  "heart": "Cardiologist",
  "palpitation": "Cardiologist",
  
  "skin": "Dermatologist",
  "rash": "Dermatologist",
  "acne": "Dermatologist",
  
  "bone": "Orthopedic",
  "joint pain": "Orthopedic",
  "back pain": "Orthopedic",
  
  "flu": "General Physician",
  "fever": "General Physician",
  "cold": "General Physician",
  "cough": "General Physician",
  "sore throat": "General Physician",
  
  // Add more symptoms as needed
}

export default function ChatPage() {
  // State declarations
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm MediAssistant. Please describe your symptoms, and I'll recommend the best doctor for you.",
      role: "assistant",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([])
  const [foundDoctors, setFoundDoctors] = useState<Doctor[]>([])
  const [showDoctorResults, setShowDoctorResults] = useState(false)
  const [currentSpecialty, setCurrentSpecialty] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Load all doctors on component mount
  useEffect(() => {
    const fetchAllDoctors = async () => {
      try {
        setIsLoading(true)
        const doctors = await getAllDoctors()
        console.log("Fetched doctors:", doctors)
        setAllDoctors(doctors)
      } catch (error) {
        console.error("Error fetching doctors:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAllDoctors()
  }, [])

  // Set up speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
        }
        
        recognition.onend = () => {
          setIsListening(false)
        }
        
        recognitionRef.current = recognition
      }
    }
    
    // Clean up
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null
        recognitionRef.current.onresult = null
      }
    }
  }, [])

  // Analyze symptoms and find matching doctors from already loaded doctors
  const analyzeSymptoms = (symptoms: string) => {
    try {
      // 1. First analyze the symptoms to determine specialty
      const lowerSymptoms = symptoms.toLowerCase()
      let detectedSpecialty = "General Physician" // Default
      
      // Check symptoms against our mapping
      for (const [symptom, specialty] of Object.entries(symptomToSpecialtyMapping)) {
        if (lowerSymptoms.includes(symptom)) {
          detectedSpecialty = specialty
          break
        }
      }
      
      setCurrentSpecialty(detectedSpecialty)
      
      // 2. Filter doctors with matching specialty from the pre-loaded list
      const matchingDoctors = allDoctors.filter(doctor => 
        doctor.specialization.toLowerCase() === detectedSpecialty.toLowerCase()
      )
      console.log("Matching doctors:", matchingDoctors)
      
      // Sort doctors by rating (highest first)
      const sortedDoctors = matchingDoctors.sort((a: Doctor, b: Doctor) => b.ratings_average - a.ratings_average)
      
      // Return top doctors and assistant response
      return {
        specialty: detectedSpecialty,
        doctors: sortedDoctors.slice(0, 5), // Get top 5 doctors
        response: `Based on your symptoms, I recommend seeing a ${detectedSpecialty}. I've found ${sortedDoctors.length > 0 ? 'some excellent specialists' : 'no specialists'} for you.`
      }
    } catch (error) {
      console.error("Error analyzing symptoms:", error)
      return {
        specialty: "General Physician",
        doctors: [],
        response: "I couldn't fully analyze your symptoms. Please consider consulting a General Physician who can help evaluate your condition."
      }
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return
    
    const userMessage = input.trim()
    setInput("")
    setIsProcessing(true)
    
    // Add user message to chat
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      role: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    
    setMessages(prev => [...prev, newUserMessage])
    
    // Show typing indicator
    setIsTyping(true)
    
    // Process the message and get response
    setTimeout(() => {
      try {
        // Check if doctors have been loaded
        if (isLoading) {
          const loadingMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: "I'm still loading doctor information. Please wait a moment and try again.",
            role: "assistant",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
          
          setMessages(prev => [...prev, loadingMessage])
          setIsTyping(false)
          setIsProcessing(false)
          return
        }
        
        // Analyze symptoms and get doctors from pre-loaded list
        const result = analyzeSymptoms(userMessage)
        
        // Add assistant response to chat
        const newAssistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: result.response,
          role: "assistant",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
        
        setMessages(prev => [...prev, newAssistantMessage])
        setIsTyping(false)
        
        // Update doctors list and show results
        if (result.doctors && result.doctors.length > 0) {
          setFoundDoctors(result.doctors)
          setTimeout(() => {
            setShowDoctorResults(true)
          }, 1000)
        }
      } catch (error) {
        console.error("Error processing message:", error)
        
        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Sorry, I encountered an error processing your request. Please try again.",
          role: "assistant",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
        
        setMessages(prev => [...prev, errorMessage])
        setIsTyping(false)
      } finally {
        setIsProcessing(false)
      }
    }, 1000)
  }

  // Toggle voice recognition
  const toggleVoiceRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current?.start()
        setIsListening(true)
      } catch (error) {
        console.error("Error starting speech recognition:", error)
      }
    }
  }



const bookAppointment = (doctor:any) => {

  if (!doctor || !doctor.hospitalId) {
    alert('Invalid doctor details');
    return;
  }
  router.push('/');
  setTimeout(() => {
      router.push('/dashboard'); 
      setTimeout(() => {
        router.push('/patients'); 
      }, 500); 
    }, 500);
};


  // Function to get availability status text from weeklyAvailability
const getAvailabilityText = (doctor: Doctor) => {
  // First check if weeklyAvailability exists
  if (!doctor.weeklyAvailability) {
    return "Availability unknown";
  }
  
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  try {
    const availableDays = daysOfWeek.filter(day => {
      // Safe access with optional chaining
      const dayAvailability = doctor.weeklyAvailability[day as keyof typeof doctor.weeklyAvailability];
      return Array.isArray(dayAvailability) && dayAvailability.length > 0;
    });
    
    if (availableDays.length === 0) return "No availability";
    if (availableDays.length > 3) return "Available most days";
    
    return `Available on ${availableDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}`;
  } catch (error) {
    console.error("Error processing availability for doctor:", doctor.name, error);
    return "Availability info unavailable";
  }
}

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-teal-950 to-black overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-4 sm:px-6 py-3 bg-teal-900/70 border-b border-teal-700/30">
        <Link href="/" className="cursor-pointer">
          <div className="flex items-center space-x-2">
            <img
              src="https://img.icons8.com/arcade/64/hospital.png"
              alt="MediNexus Logo"
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
            <div className="text-base sm:text-lg font-bold text-teal-400">MediNexus Assistant</div>
          </div>
        </Link>

        <Button
          onClick={toggleVoiceRecognition}
          variant="ghost"
          size="icon"
          className={`rounded-full ${isListening ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-teal-800/30 hover:bg-teal-800/50"}`}
          aria-label={isListening ? "Stop listening" : "Start voice assistant"}
        >
          {isListening ? <MicOff size={18} className="text-red-400" /> : <Mic size={18} className="text-teal-300" />}
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 space-y-4 scrollbar-hide">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-teal-700 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <Stethoscope size={14} className="text-white sm:hidden" />
                    <Stethoscope size={16} className="text-white hidden sm:block" />
                  </div>
                )}
                <div className="flex flex-col max-w-[80%] sm:max-w-[75%]">
                  <div
                    className={`p-2 sm:p-3 rounded-lg shadow-md ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-br-none"
                        : "bg-gradient-to-r from-teal-900 to-teal-950 border border-teal-700/50 text-teal-100 rounded-bl-none"
                    }`}
                  >
                    <div className="text-sm sm:text-base">{message.content}</div>
                  </div>
                  <div
                    className={`text-xs mt-1 text-teal-400/70 ${message.role === "user" ? "text-right" : "text-left"}`}
                  >
                    {message.timestamp}
                  </div>
                </div>
                {message.role === "user" && (
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-teal-600 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                    <Users size={14} className="text-white sm:hidden" />
                    <Users size={16} className="text-white hidden sm:block" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-teal-700 flex items-center justify-center mr-2 flex-shrink-0">
                  <Stethoscope size={14} className="text-white sm:hidden" />
                  <Stethoscope size={16} className="text-white hidden sm:block" />
                </div>
                <div className="bg-gradient-to-r from-teal-900 to-teal-950 border border-teal-700/50 text-teal-100 p-2 sm:p-3 rounded-lg rounded-bl-none">
                  <div className="flex space-x-1">
                    <div
                      className="h-2 w-2 bg-teal-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 bg-teal-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 bg-teal-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-3 sm:p-4 border-t border-teal-700/30 bg-teal-900/30 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Describe your symptoms (e.g., headache, flu, chest pain)"}
                className="flex-1 bg-teal-800/50 border border-teal-700/50 rounded-full py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base text-teal-100 placeholder-teal-400/70 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                disabled={isProcessing}
              />
              <Button
                type="button"
                onClick={toggleVoiceRecognition}
                variant="ghost"
                size="icon"
                className={`rounded-full ${
                  isListening ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-teal-700/50 text-teal-300"
                } hover:bg-teal-700/70 transition-colors`}
                disabled={isProcessing}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-teal-600 hover:bg-teal-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!input.trim() || isProcessing}
              >
                <Send size={18} />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Doctor Results Sheet */}
      <Sheet open={showDoctorResults} onOpenChange={setShowDoctorResults}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-teal-900/95 backdrop-blur-sm border-l border-teal-700/30 p-0"
        >
          <SheetHeader className="p-4 border-b border-teal-700/30">
            <SheetTitle className="text-teal-300">Recommended Doctors</SheetTitle>
            <SheetDescription className="text-teal-400/80">
              {currentSpecialty ? `Top ${currentSpecialty} specialists for you` : "Specialists based on your symptoms"}
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)] scrollbar-hide">
            {foundDoctors.length > 0 ? (
              foundDoctors.map((doctor) => (
                <Card
                  key={doctor._id}
                  className="bg-teal-800/30 border-teal-700/30 hover:bg-teal-800/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 mr-3">
                        <img 
                          src={doctor.image || "https://img.icons8.com/ios/50/doctor-male--v1.png"} 
                          alt={doctor.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-teal-200">{doctor.name}</h4>
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-400/30">
                            {doctor.ratings_average} ★
                          </Badge>
                        </div>
                        <p className="text-sm text-teal-300 mt-1">{doctor.specialization}</p>
                        <div className="mt-2 text-xs text-teal-400/80">
                          <p>{doctor.experience} years experience</p>
                          <p>{getAvailabilityText(doctor)}</p>
                          <p>{doctor.ratings_reviews} reviews</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      onClick={() => bookAppointment(doctor)}
                      className="w-full bg-teal-600 hover:bg-teal-500 text-white"
                    >
                      Book Appointment
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center p-6">
                <p className="text-teal-300">No specialists found</p>
                <p className="text-teal-400/70 text-sm mt-2">Please try with different symptoms</p>
              </div>
            )}
          </div>
          <div className="p-4 text-center border-t border-teal-700/30">
            <SheetClose asChild>
              <Button variant="link" className="text-teal-300 hover:text-teal-200">
                Return to chat
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}