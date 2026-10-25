"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationEvent, CSSProperties } from "react";
import { useTranslations } from 'next-intl'

interface SlotLeverProps {
  onActivate?: () => void;
  disabled?: boolean;
  isSpinning?: boolean;
}

export default function SlotLever({ onActivate, disabled = false, isSpinning = false }: SlotLeverProps) {
  const t = useTranslations('slotLever')
  const [pulling, setPulling] = useState(false)
  const onActivateRef = useRef(onActivate)
  const disabledRef = useRef(disabled)
  const pullingRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    onActivateRef.current = onActivate;
  }, [onActivate]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    const audio = new Audio("/lever.m4a");
    audio.volume = 0.8;
    audioRef.current = audio
    return () => {
      audio.pause()
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    };
  }, []);

  const trigger = () => {
    if (pullingRef.current || disabledRef.current) return;

    pullingRef.current = true
    setPulling(true)

    const audio = audioRef.current
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(() => {})
    }

    timeoutRef.current = window.setTimeout(() => {
      onActivateRef.current?.()
    }, 620)
  }

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.animationName !== 'slotLeverPull') return
    pullingRef.current = false
    setPulling(false)
  }

  const armStyle: CSSProperties = {
    transformOrigin: "left center",
    transform: "rotate(-42deg)",
    background: "linear-gradient(180deg, #f8eaae 0%, #ddb559 30%, #C89B3C 52%, #8a671f 78%, #4d370d 100%)",
    boxShadow: "0 0 18px rgba(0,229,255,0.35), 0 0 5px rgba(200,155,60,0.7)",
    animation: pulling
      ? "slotLeverPull 0.9s cubic-bezier(0.33, 1.12, 0.62, 1) both"
      : undefined,
  }

  return (
    <div
      className={`slot-lever-root select-none relative ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={trigger}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          trigger()
        }
      }}
    >
      {/* Glow ring behind lever */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(0,229,255,0.10) 0%, rgba(200,155,60,0.06) 40%, transparent 70%)`,
        }}
      />

      <div className="flex items-center justify-center h-[320px]">
        <div className="flex items-center relative">

          {/* MECHANICAL BASE */}
          <div className="relative z-20">
            <div
              className="relative w-[68px] h-[190px] rounded-[18px] flex flex-col items-center justify-center overflow-hidden border"
              style={{
                borderColor: 'rgba(200,155,60,0.6)',
                background: 'linear-gradient(180deg, #1d1d27 0%, #0a0a10 48%, #171722 100%)',
                boxShadow: '0 0 28px rgba(0,229,255,0.12), inset 0 0 22px rgba(0,229,255,0.08), 0 18px 30px rgba(0,0,0,0.55)',
              }}
            >
              {/* Gold filigree frame */}
              <div className="absolute inset-[5px] rounded-[14px] border border-[#C89B3C]/30 pointer-events-none" />
              <div className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-[#C89B3C]/80 to-transparent" />
              <div className="absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-[#C89B3C]/80 to-transparent" />

              {/* Cyan energy wash */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-cyan-400/15 via-cyan-400/5 to-transparent pointer-events-none" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-24 bg-cyan-400/10 blur-xl rounded-full pointer-events-none" />

              {/* Gems top / bottom */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 border border-[#C89B3C] bg-cyan-300/70 shadow-[0_0_10px_#00e5ff]" />
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 border border-[#C89B3C] bg-cyan-300/70 shadow-[0_0_10px_#00e5ff]" />

              <div
                className="relative z-10 flex flex-col items-center text-[22px] leading-[0.92] tracking-[0.15em]"
                style={{
                  fontFamily: '"Bebas Neue", sans-serif',
                  color: '#e8c874',
                  textShadow: '0 0 10px rgba(0,229,255,0.45), 0 0 2px rgba(200,155,60,0.9)',
                }}
              >
                <span>S</span>
                <span>P</span>
                <span>I</span>
                <span>N</span>
              </div>

              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#C89B3C] to-transparent" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#C89B3C] to-transparent" />
            </div>
          </div>

          {/* LEVER ARM */}
          <div className="relative ml-1">
            <div
              className="w-[122px] h-[14px] rounded-r-full relative z-10"
              style={armStyle}
              onAnimationEnd={handleAnimationEnd}
            >
              {/* Cyan energy running through the arm */}
              <div
                className="absolute left-2 top-1/2 -translate-y-1/2 w-[calc(100%-14px)] h-[4px] rounded-full pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, rgba(0,229,255,0) 0%, rgba(0,229,255,0.55) 35%, rgba(180,250,255,0.95) 75%, rgba(0,229,255,0.55) 100%)',
                  filter: 'blur(0.5px)',
                  boxShadow: '0 0 8px rgba(0,229,255,0.8)',
                }}
              />

              {/* Gold filigree studs */}
              {[30, 64, 98].map((left) => (
                <div
                  key={left}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#f4dc94] border border-[#fff6cf]/70 shadow-[0_0_6px_#C89B3C] pointer-events-none"
                  style={{ left }}
                />
              ))}

              {/* Crystal handle */}
              <div
                className={`absolute right-[-28px] top-[-21px] w-[56px] h-[56px] rounded-full transition-transform duration-200 pointer-events-none ${pulling ? 'scale-110' : ''}`}
                style={{
                  background: 'radial-gradient(circle at 32% 28%, #f2ffff 0%, #7ef3ff 18%, #00e5ff 42%, #036b8c 70%, #04222e 100%)',
                  border: '2px solid rgba(200,155,60,0.9)',
                  boxShadow: pulling
                    ? '0 0 36px rgba(0,229,255,0.9), 0 0 16px rgba(200,155,60,0.9), inset 0 0 14px rgba(255,255,255,0.65)'
                    : '0 0 22px rgba(0,229,255,0.55), 0 0 10px rgba(200,155,60,0.5), inset 0 0 10px rgba(255,255,255,0.45)',
                }}
              >
                <div className="absolute inset-[3px] rounded-full border border-white/25" />
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 30% 24%, rgba(255,255,255,0.85), transparent 38%)' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rotate-45 rounded-[2px] bg-white/90 shadow-[0_0_12px_#fff]" />
                </div>
              </div>
            </div>

            {/* HINGE / PIVOT */}
            <div
              className="absolute left-[-32px] top-[-28px] w-[62px] h-[62px] rounded-full z-20 border flex items-center justify-center"
              style={{
                borderColor: 'rgba(200,155,60,0.75)',
                background: 'radial-gradient(circle at 35% 30%, #3a3a48 0%, #14141c 55%, #050508 100%)',
                boxShadow: '0 0 20px rgba(0,229,255,0.28), inset 0 0 10px rgba(200,155,60,0.25)',
              }}
            >
              <div className="absolute inset-[6px] rounded-full border border-cyan-300/30" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#C89B3C] shadow-[0_0_10px_#C89B3C]" />
              <div className="absolute inset-[10px] rounded-full bg-cyan-400/10 blur-sm" />
            </div>
          </div>

        </div>
      </div>

      {/* Pull hint */}
      <div className={`
        absolute -bottom-2 left-1/2 -translate-x-1/2 text-center transition-all duration-500
        ${pulling ? 'opacity-0 translate-y-4' : 'opacity-100'}
      `}>
        <p
          className={`text-xs tracking-[0.3em] uppercase font-display ${isSpinning ? 'text-cyan-300/80' : 'text-[#C89B3C]/80'}`}
          style={{ fontFamily: '"Bebas Neue", sans-serif' }}
        >
          {isSpinning ? t('spinning') : t('pull')}
        </p>
      </div>

      <style>{`
        @keyframes slotLeverPull {
          0%   { transform: rotate(-42deg); }
          12%  { transform: rotate(-54deg); }
          42%  { transform: rotate(52deg); }
          54%  { transform: rotate(40deg); }
          74%  { transform: rotate(-50deg); }
          88%  { transform: rotate(-37deg); }
          100% { transform: rotate(-42deg); }
        }
      `}</style>
    </div>
  );
}
