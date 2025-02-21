"use client"

import { useEffect, useState } from "react"

const Loader = () => {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360)
    }, 10)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[linear-gradient(to_right,#042F2E,#012621,#002A1C)] z-50 animate-fadeIn">
      <div className="relative flex flex-col items-center justify-center">
        <svg className="w-40 h-40 sm:w-64 sm:h-64" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
          {/* Outer rotating ring */}
          <circle cx="120" cy="120" r="110" fill="none" stroke="rgba(0, 255, 255, 0.2)" strokeWidth="6" />
          <circle
            cx="120"
            cy="120"
            r="110"
            fill="none"
            stroke="cyan"
            strokeWidth="6"
            strokeDasharray="691.15"
            strokeDashoffset="172.79"
            style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "center" }}
            className="animate-glow"
          />

          {/* Inner circle with gradient */}
          <circle cx="120" cy="120" r="90" fill="url(#circleGradient)" />

          {/* Caduceus symbol */}
          <g transform="translate(70, 70) scale(0.5)">
            <path d="M100,20 C60,20 20,60 20,100 C20,140 60,180 100,180 C140,180 180,140 180,100 C180,60 140,20 100,20 Z M100,40 C130,40 160,70 160,100 C160,130 130,160 100,160 C70,160 40,130 40,100 C40,70 70,40 100,40 Z" fill="#ffffff" />
            <path d="M90,50 L110,50 L110,150 L90,150 Z M70,70 C70,70 50,90 50,100 C50,110 70,130 70,130 M130,70 C130,70 150,90 150,100 C150,110 130,130 130,130" fill="none" stroke="#00FFFF" strokeWidth="8" strokeLinecap="round" />
            <circle cx="100" cy="60" r="10" fill="#00FFFF" />
            <circle cx="100" cy="140" r="10" fill="#00FFFF" />
          </g>

          {/* Pulsating circles */}
          <circle cx="120" cy="40" r="5" fill="white" className="animate-ping" style={{ animationDuration: "1.5s" }} />
          <circle cx="200" cy="120" r="5" fill="white" className="animate-ping" style={{ animationDuration: "2s" }} />
          <circle cx="120" cy="200" r="5" fill="white" className="animate-ping" style={{ animationDuration: "2.5s" }} />
          <circle cx="40" cy="120" r="5" fill="white" className="animate-ping" style={{ animationDuration: "1.8s" }} />

          {/* Gradient definition */}
          <defs>
            <radialGradient id="circleGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="rgba(0, 255, 255, 0.4)" />
              <stop offset="100%" stopColor="rgba(0, 128, 128, 0.1)" />
            </radialGradient>
          </defs>
        </svg>

        <h1 className="text-cyan-300 text-4xl sm:text-6xl font-bold mt-6 animate-pulse">Medi Nexus</h1></div>
    </div>
  )
}

export default Loader
