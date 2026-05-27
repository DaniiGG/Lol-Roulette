"use client";

import { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle, Clock, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('autoVerify');
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [nextCheckIn, setNextCheckIn] = useState(120)

  useEffect(() => {
    if (!isActive) return
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1)
      setNextCheckIn(prev => prev <= 1 ? 120 : prev - 1)
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
    <div className="animate-scale-in relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6">
      {/* Scanning line animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 animate-scanline" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-400/30">
              <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/30">
                <span className="text-[10px] font-bold text-cyan-300 tracking-wider uppercase">{t('title')}</span>
              </div>
            </div>

            <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
              {t('monitoring', { champion: championName })}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-zinc-900/70 rounded-lg p-3 border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span className="text-[10px] text-zinc-500 tracking-wider uppercase">{t('nextCheck')}</span>
                </div>
                <p className="text-lg font-bold text-cyan-300 font-display tracking-wide"
                   style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                  {formatTime(nextCheckIn)}
                </p>
              </div>
              <div className="bg-zinc-900/70 rounded-lg p-3 border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-3 h-3 text-zinc-500" />
                  <span className="text-[10px] text-zinc-500 tracking-wider uppercase">{t('elapsed')}</span>
                </div>
                <p className="text-lg font-bold text-white font-display tracking-wide"
                   style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                  {formatTime(secondsElapsed)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onManualVerify}
                className="flex-1 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.97]"
              >
                <CheckCircle className="w-4 h-4" />
                {t('verifyNow')}
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-sm transition-all"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${((120 - nextCheckIn) / 120) * 100}%`,
              background: 'linear-gradient(90deg, #00e5ff, #0088ff)',
            }}
          />
        </div>

        <div className="mt-3 flex items-start gap-2 text-[11px] text-zinc-500">
          <span>ℹ️</span>
          <p>{t('info')}</p>
        </div>
      </div>
    </div>
  )
}
