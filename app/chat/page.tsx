"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Stethoscope, Users, Send, Mic, MicOff, ArrowLeft, Info } from "lucide-react"
import Link from "next/link"

// Message interface
interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp?: string
}

// Define global SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I help you with your healthcare needs today?",
      role: "assistant",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [input, setInput] = useState("")
  const [recognition, setRecognition] = useState<any>(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // Process any message passed via URL query parameter
  useEffect(() => {
    const messageFromQuery = searchParams?.get("message")
    if (messageFromQuery) {
      addMessage(messageFromQuery, "user")
    }
  }, [searchParams])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = 'en-US'
        
        let finalTranscript = ''
        let interimTranscript = ''
        
        recognitionInstance.onstart = () => {
          setIsListening(true)
          finalTranscript = ''
          interimTranscript = ''
        }

        recognitionInstance.onresult = (event: any) => {
          interimTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' '
              setInput(finalTranscript.trim())
            } else {
              interimTranscript += transcript
              setInput(finalTranscript + interimTranscript)
            }
          }
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
          
          // If we have a final transcript and user stopped manually (not auto-submit)
          if (finalTranscript.trim() && inputRef.current) {
            inputRef.current.focus()
          }
        }

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setIsListening(false)
        }

        setRecognition(recognitionInstance)
        recognitionRef.current = recognitionInstance
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore errors when stopping on unmount
        }
      }
    }
  }, [])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const addMessage = (content: string, role: "user" | "assistant") => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prev) => [...prev, newMessage])

    // Process user message and generate response
    if (role === "user") {
      setIsTyping(true)

      setTimeout(() => {
        let response =
          "I'll help you with that. Is there anything specific you'd like to know about our hospitals or services?"
        let redirectPath = null

        // Simple keyword matching for demo purposes
        const lowerContent = content.toLowerCase()

        if (
          lowerContent.includes("appointment") ||
          lowerContent.includes("book") ||
          lowerContent.includes("schedule")
        ) {
          response =
            "I can help you schedule an appointment. Let me take you to our appointments page where you can select a hospital and doctor."
          redirectPath = "/dashboard"
        } else if (lowerContent.includes("emergency")) {
          response =
            "For medical emergencies, please call our emergency hotline or visit your nearest MediNexus hospital immediately. I'll show you our hospital network."
          redirectPath = "/#hospitals"
        } else if (lowerContent.includes("doctor") || lowerContent.includes("specialist")) {
          response =
            "We have specialists in various fields. Let me show you our hospital network where you can find specialists by department."
          redirectPath = "/#hospitals"
        } else if (
          lowerContent.includes("medicine") ||
          lowerContent.includes("drug") ||
          lowerContent.includes("pharmacy")
        ) {
          response =
            "I'll redirect you to our medical store where you can browse and order medicines and medical supplies."
          redirectPath = "https://medical-store-bice.vercel.app/"
        } else if (lowerContent.includes("service") || lowerContent.includes("offer")) {
          response = "Let me show you the services we offer at MediNexus."
          redirectPath = "/#services"
        }

        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          role: "assistant",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }

        setMessages((prev) => [...prev, botResponse])
        setIsTyping(false)

        // Handle redirection after a delay
        if (redirectPath) {
          setTimeout(() => {
            if (redirectPath.startsWith("http")) {
              window.location.href = redirectPath
            } else {
              router.push(redirectPath)
            }
          }, 2000)
        }
      }, 1500)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      addMessage(input, "user")
      setInput("")
      
      // Stop listening if active
      if (isListening && recognition) {
        recognition.stop()
      }
    }
  }

  const toggleVoiceRecognition = () => {
    if (!recognition) return

    if (isListening) {
      recognition.stop()
    } else {
      setInput("")
      recognition.start()
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-teal-950 to-black overflow-hidden">
      {/* Header - Static */}
      <header className="flex justify-between items-center px-6 py-3 bg-teal-900/70 border-b border-teal-700/30">
        <Link href="/" className="cursor-pointer">
          <div className="flex items-center space-x-2">
            <img src="https://img.icons8.com/arcade/64/hospital.png" alt="MediNexus Logo" className="h-10 w-10" />
            <div className="text-lg font-bold text-teal-400">MediNexus Assistant</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoiceRecognition}
            className={`p-2 rounded-full ${isListening ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-teal-800/30 hover:bg-teal-800/50"} transition-colors`}
            aria-label={isListening ? "Stop listening" : "Start voice assistant"}
          >
            {isListening ? <MicOff size={20} className="text-red-400" /> : <Mic size={20} className="text-teal-300" />}
          </button>
        </div>
      </header>

      {/* Chat Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" && (
              <div className="h-8 w-8 rounded-full bg-teal-700 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                <Stethoscope size={16} className="text-white" />
              </div>
            )}
            <div className="flex flex-col max-w-[75%]">
              <div
                className={`p-3 rounded-lg shadow-md ${message.role === "user"
                    ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-br-none"
                    : "bg-gradient-to-r from-teal-900 to-teal-950 border border-teal-700/50 text-teal-100 rounded-bl-none"
                  }`}
              >
                {message.content}
              </div>
              <div
                className={`text-xs mt-1 text-teal-400/70 ${message.role === "user" ? "text-right" : "text-left"}`}
              >
                {message.timestamp}
              </div>
            </div>
            {message.role === "user" && (
              <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                <Users size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="h-8 w-8 rounded-full bg-teal-700 flex items-center justify-center mr-2 flex-shrink-0">
              <Stethoscope size={16} className="text-white" />
            </div>
            <div className="bg-gradient-to-r from-teal-900 to-teal-950 border border-teal-700/50 text-teal-100 p-3 rounded-lg rounded-bl-none shadow-md">
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
        <div ref={messagesEndRef}></div>
      </div>

      {/* Listening Indicator - Static */}
      {isListening && (
        <div className="text-center py-2 text-red-400 flex items-center justify-center gap-2 bg-teal-950/80 border-t border-teal-800/30">
          <span className="inline-block h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
          <p>Listening... Speak now</p>
        </div>
      )}

      {/* Input Form - Static */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-teal-800 flex gap-2 bg-teal-950/90">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening..." : "Type your message..."}
          className="flex-1 bg-teal-800 border border-teal-700/50 text-white px-4 py-3 rounded-md focus:outline-none focus:border-teal-500 placeholder-teal-300/50"
        />
        <button
          type="button"
          onClick={toggleVoiceRecognition}
          className={`p-3 rounded-md ${isListening ? "bg-red-600 hover:bg-red-700" : "bg-teal-800 hover:bg-teal-700"
            } transition-colors`}
          aria-label={isListening ? "Stop listening" : "Start voice input"}
        >
          {isListening ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
        </button>
        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-md disabled:opacity-50 transition-colors"
          disabled={!input.trim()}
        >
          <Send size={20} />
        </button>
      </form>

      {/* Suggestion Chips - Static */}
      <div className="px-4 py-1 bg-teal-950 border-t border-teal-800/30 hidden sm:block ">
        <p className="text-center text-teal-400/70 mb-3">Try asking about:</p>
        <div className="flex flex-wrap gap-3 justify-center mb-2">
          {["Book an appointment", "Emergency services", "Find specialists", "Medical store"].map((suggestion) => (
            <button 
              key={suggestion}
              onClick={() => {
                setInput(suggestion)
                inputRef.current?.focus()
              }}
              className="px-3 py-2 rounded-full bg-teal-800/50 hover:bg-teal-700/50 text-teal-300 text-sm transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}