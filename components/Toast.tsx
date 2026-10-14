"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { X, Bell } from "lucide-react"

interface ToastProps {
  message: string
  onClose: () => void
  duration?: number
}

export default function Toast({ message, onClose, duration = 8000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slideIn">
      <div className="flex items-start gap-3 w-[320px] max-w-[90vw] rounded-2xl border border-[#C89B3C]/30 bg-gradient-to-r from-[#C89B3C]/10 via-neutral-900/95 to-neutral-950/95 p-4 shadow-2xl shadow-[#C89B3C]/10 backdrop-blur-sm">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#C89B3C]/20 flex-shrink-0">
          <Bell className="w-4 h-4 text-[#C89B3C]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-6 h-6 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50 transition-colors flex-shrink-0"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}