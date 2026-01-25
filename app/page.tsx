"use client"

import { useState } from "react"

export default function Home() {
  const [champ, setChamp] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const spin = async () => {
    setLoading(true)
    const res = await fetch("/api/roulette")
    const data = await res.json()
    setChamp(data)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
      <div className="w-full max-w-md p-6 rounded-2xl bg-zinc-800 shadow-xl text-center">

        <h1 className="text-3xl font-bold mb-2">
          LoL Roulette
        </h1>

        <p className="text-zinc-400 mb-6">
          ¿Qué campeón te toca hoy?
        </p>

        {/* Champion card */}
        <div className="h-64 flex items-center justify-center mb-6 rounded-xl bg-zinc-700">
          {champ ? (
            <div>
              <p className="text-xl font-semibold">
                {champ.name}
              </p>
              <img
  src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_0.jpg`}
  alt={champ.name}
  className="rounded-xl"
/>
            </div>
          ) : (
            <p className="text-zinc-400">
              Gira la ruleta 🎰
            </p>
          )}
        </div>

        {/* Button */}
        <button
          onClick={spin}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition disabled:opacity-50"
        >
          {loading ? "Girando..." : "Girar ruleta"}
        </button>

      </div>
    </main>
  )
}
