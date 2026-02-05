// components/AutoVerifyIndicator.tsx
'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle, Clock, Zap } from 'lucide-react'

interface AutoVerifyIndicatorProps {
  isActive: boolean
  championName: string
  onManualVerify: () => void
  onCancel: () => void
}

export default function AutoVerifyIndicator({ 
  isActive, 
  championName,
  onManualVerify,
  onCancel 
}: AutoVerifyIndicatorProps) {
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [nextCheckIn, setNextCheckIn] = useState(120)

  useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1)
      setNextCheckIn(prev => {
        if (prev <= 1) return 120 // Reset cada 2 minutos
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive])

  if (!isActive) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        {/* Animated Icon */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h3 className="text-white font-bold">Auto-Verification Active</h3>
          </div>
          
          <p className="text-sm text-neutral-300 mb-3">
            We're automatically checking for your <strong className="text-white">{championName}</strong> match. 
            Play your game and we'll verify it for you!
          </p>

          {/* Status Info */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-neutral-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3 h-3 text-neutral-400" />
                <span className="text-xs text-neutral-400">Checking in</span>
              </div>
              <div className="text-lg font-bold text-white">{formatTime(nextCheckIn)}</div>
            </div>

            <div className="bg-neutral-800/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="w-3 h-3 text-neutral-400" />
                <span className="text-xs text-neutral-400">Waiting for</span>
              </div>
              <div className="text-lg font-bold text-white">{formatTime(secondsElapsed)}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onManualVerify}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Verify Now
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-300 text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-1 bg-neutral-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
          style={{ width: `${((120 - nextCheckIn) / 120) * 100}%` }}
        />
      </div>

      {/* Info */}
      <div className="mt-4 flex items-start gap-2 text-xs text-neutral-400">
        <div className="flex-shrink-0 mt-0.5">ℹ️</div>
        <p>
          Auto-verification checks every 2 minutes for up to 1 hour. 
          If you finish your game early, click "Verify Now" for instant verification.
        </p>
      </div>
    </div>
  )
}