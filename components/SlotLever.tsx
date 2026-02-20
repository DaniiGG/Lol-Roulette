"use client";

import { useEffect, useRef } from "react";

export default function SlotLever({ onActivate,
  disabled = false }:
  {
    onActivate?: () => void,
    disabled?: boolean
  }) {
  const leverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lever = leverRef.current;
    if (!lever) return;

    let angle = -35;
    let velocity = 0;
    let animating = false;

    const audio = new Audio("/lever.m4a");
    audio.volume = 0.8;

    function animate() {
      velocity *= 0.96;
      angle += velocity;

      if (angle > 30) {
        angle = 30;
        velocity *= -0.6;
      }

      if (!animating && angle <= -35) {
        angle = -35;
        velocity = 0;
      }

      if (lever)
        lever.style.transform = `rotate(${angle}deg)`;
      requestAnimationFrame(animate);
    }

    function trigger() {
      if (animating || disabled) return;

      animating = true;
      velocity = 11;

      audio.currentTime = 0;
      audio.play().catch(() => { });

      setTimeout(() => {
        animating = false;
        onActivate?.();
      }, 650);
    }

    const container = lever.closest(".slot-lever-root");
    container?.addEventListener("click", trigger);

    animate();

    return () => {
      container?.removeEventListener("click", trigger);
    };
  }, [onActivate, disabled]);

  return (
    <div className="slot-lever-root cursor-pointer select-none">
      <div className="flex items-center justify-center h-[300px]">
        <div className="flex items-center relative">

          {/* BASE DECORADA */}
          <div className="relative z-20">

            {/* Cuerpo base */}
            <div className="w-[55px] h-[150px] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 rounded-xl shadow-2xl border border-yellow-400 flex flex-col items-center justify-center">

              {/* Borde interior brillo */}
              <div className="absolute inset-1 rounded-lg border border-yellow-400 pointer-events-none" />

              {/* Letras verticales */}
              <div className="flex flex-col items-center text-white font-extrabold tracking-widest text-lg">
                <span>S</span>
                <span>P</span>
                <span>I</span>
                <span>N</span>
              </div>

              {/* Tornillos decorativos */}
              <div className="absolute top-2 w-6 h-1 bg-zinc-300 rounded-full shadow-inner" />
              <div className="absolute bottom-2 w-6 h-1 bg-zinc-300 rounded-full shadow-inner" />
            </div>
          </div>

          {/* CONTENEDOR PALANCA */}
          <div className="relative">

            {/* PALANCA */}
            <div
              ref={leverRef}
              className="w-[100px] h-[10px] bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-400 rounded-r-full cursor-pointer relative z-10 shadow-md"
              style={{
                transformOrigin: "left center",
                transform: "rotate(-35deg)"
              }}
            >
              {/* Bola */}
              <div className="absolute right-[-15px] top-[-9px] w-[28px] h-[28px] bg-red-600 rounded-full shadow-xl border-2 border-red-800" />
            </div>

            {/* BISAGRA METÁLICA */}
            <div
              className="absolute left-[-22px] top-[-18px] w-[42px] h-[42px] rounded-full bg-gradient-to-br from-zinc-400 via-zinc-700 to-zinc-900 shadow-lg z-19 border border-zinc-500"
              style={{
                clipPath: "inset(0 0 0 50%)"
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
