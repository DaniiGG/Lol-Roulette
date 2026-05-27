"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useTranslations } from 'next-intl'

interface SlotLeverProps {
  onActivate?: () => void;
  disabled?: boolean;
  isSpinning?: boolean;
}

export default function SlotLever({ onActivate, disabled = false, isSpinning = false }: SlotLeverProps) {
  const t = useTranslations('slotLever')
  const leverRef = useRef<HTMLDivElement>(null);
  const [pulled, setPulled] = useState(false);

  useEffect(() => {
    const lever = leverRef.current;
    if (!lever) return;

    let angle = -35;
    let velocity = 0;
    let animating = false;

    const audio = new Audio("/lever.m4a");
    audio.volume = 0.8;

    function animate() {
      velocity *= 0.92;
      angle += velocity;

      if (angle > 45) { angle = 45; velocity *= -0.5; }
      if (!animating && angle < -35) { angle = -35; velocity = 0; }

      if (lever) lever.style.transform = `rotate(${angle}deg)`;
      requestAnimationFrame(animate);
    }

    function trigger() {
      if (animating || disabled) return;
      animating = true;
      setPulled(true);
      velocity = 14;
      audio.currentTime = 0;
      audio.play().catch(() => {});
      setTimeout(() => {
        animating = false;
        setPulled(false);
        onActivate?.();
      }, 700);
    }

    const container = lever.closest(".slot-lever-root");
    container?.addEventListener("click", trigger);
    animate();
    return () => container?.removeEventListener("click", trigger);
  }, [onActivate, disabled]);

  return (
    <div className="slot-lever-root cursor-pointer select-none relative">
      {/* Glow ring behind lever */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-radial from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="flex items-center justify-center h-[320px]">
        <div className="flex items-center relative">

          {/* MECHANICAL BASE */}
          <div className="relative z-20">
            <div className="w-[60px] h-[160px] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 rounded-xl shadow-2xl border border-zinc-600 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-1 rounded-lg border border-cyan-400/30 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

              <div className="flex flex-col items-center text-white font-display tracking-widest text-xl relative z-10"
                   style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
                <span>S</span>
                <span>P</span>
                <span>I</span>
                <span>N</span>
              </div>

              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-zinc-400 rounded-full shadow-inner" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-zinc-400 rounded-full shadow-inner" />
            </div>
          </div>

          {/* LEVER ARM */}
          <div className="relative ml-1">
            <div
              ref={leverRef}
              className="w-[110px] h-[12px] bg-gradient-to-r from-zinc-500 via-zinc-300 to-zinc-500 rounded-r-full cursor-pointer relative z-10 shadow-lg"
              style={{ transformOrigin: "left center", transform: "rotate(-35deg)" }}
            >
              <div className={`
                absolute right-[-18px] top-[-12px] w-[36px] h-[36px] rounded-full
                bg-gradient-to-br from-red-500 to-red-800
                shadow-xl border-2 border-red-900/60
                transition-shadow duration-300
                ${pulled ? 'shadow-red-500/80 scale-110' : 'shadow-red-500/40'}
              `}>
                <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
              </div>
            </div>

            {/* HINGE MECHANISM */}
            <div className="absolute left-[-28px] top-[-22px] w-[50px] h-[50px] rounded-full bg-gradient-to-br from-zinc-400 via-zinc-700 to-zinc-950 shadow-lg z-19 border border-zinc-500/50"
              style={{ clipPath: "inset(0 0 0 50%)" }}
            />
            <div className="absolute left-[-14px] top-[-8px] w-[10px] h-[10px] rounded-full bg-zinc-300 shadow-inner z-20" />
          </div>

        </div>
      </div>

      {/* Pull hint */}
      <div className={`
        absolute -bottom-2 left-1/2 -translate-x-1/2 text-center transition-all duration-500
        ${pulled ? 'opacity-0 translate-y-4' : 'opacity-100'}
      `}>
        <p className="text-zinc-500 text-xs tracking-[0.3em] uppercase font-display"
           style={{ fontFamily: '"Bebas Neue", sans-serif' }}>
          {isSpinning ? t('spinning') : t('pull')}
        </p>
      </div>
    </div>
  );
}