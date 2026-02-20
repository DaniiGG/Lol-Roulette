// app/test-verify/page.tsx
'use client'

import { useState } from 'react'

interface TestScenario {
  id: string
  name: string
  description: string
  puuid: string
  region: string
  championId: number
  timestamp: string
  expectedResult: 'success' | 'fail'
  expectedMessage: string
}

// Escenarios de prueba predefinidos
const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'recent-match',
    name: '✅ Partida Reciente (Última hora)',
    description: 'Usuario jugó con el campeón hace 30 minutos. Debería verificar exitosamente.',
    puuid: 'n-Hc0QPy6rhTlFvKzFTF6WLy4aoQA0gv2N5Tf9khwBdLrRWpVuTX83lLutD_nbYlJSnZURDYR4aLEw',
    region: 'euw1',
    championId: 103, // Ahri
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Hace 30 min
    expectedResult: 'success',
    expectedMessage: 'Partida encontrada en los últimos 30 minutos'
  },
  {
    id: 'wrong-champion',
    name: '❌ Campeón Incorrecto',
    description: 'Usuario jugó pero con otro campeón. Debería fallar la verificación.',
    puuid: 'n-Hc0QPy6rhTlFvKzFTF6WLy4aoQA0gv2N5Tf9khwBdLrRWpVuTX83lLutD_nbYlJSnZURDYR4aLEw',
    region: 'euw1',
    championId: 157, // Yasuo
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    expectedResult: 'fail',
    expectedMessage: 'Jugaste con otro campeón, no Yasuo'
  },
  {
    id: 'no-matches',
    name: '❌ Sin Partidas Recientes',
    description: 'Usuario no ha jugado desde hace días. No debería encontrar partidas.',
    puuid: 'n-Hc0QPy6rhTlFvKzFTF6WLy4aoQA0gv2N5Tf9khwBdLrRWpVuTX83lLutD_nbYlJSnZURDYR4aLEw',
    region: 'euw1',
    championId: 103,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Hace 5 días
    expectedResult: 'fail',
    expectedMessage: 'No se encontraron partidas recientes'
  },
  {
    id: 'old-match',
    name: '❌ Partida Antigua (Timestamp incorrecto)',
    description: 'Challenge creado hace 2 horas, pero la partida fue hace 3 horas.',
    puuid: 'n-Hc0QPy6rhTlFvKzFTF6WLy4aoQA0gv2N5Tf9khwBdLrRWpVuTX83lLutD_nbYlJSnZURDYR4aLEw',
    region: 'euw1',
    championId: 103,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Hace 2h
    expectedResult: 'fail',
    expectedMessage: 'La partida es anterior al challenge'
  },
  {
    id: 'invalid-puuid',
    name: '❌ PUUID Inválido',
    description: 'PUUID que no existe. Debería retornar error 404.',
    puuid: 'INVALID-PUUID-12345',
    region: 'euw1',
    championId: 103,
    timestamp: new Date().toISOString(),
    expectedResult: 'fail',
    expectedMessage: 'PUUID no encontrado'
  },
  {
    id: 'wrong-region',
    name: '❌ Región Incorrecta',
    description: 'Usuario de NA pero buscando en EUW.',
    puuid: 'n-Hc0QPy6rhTlFvKzFTF6WLy4aoQA0gv2N5Tf9khwBdLrRWpVuTX83lLutD_nbYlJSnZURDYR4aLEw',
    region: 'na1', // Usuario real está en EUW
    championId: 103,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    expectedResult: 'fail',
    expectedMessage: 'No se encontraron partidas en esta región'
  },
  {
    id: 'victory',
    name: '✅ Victoria con Campeón',
    description: 'Partida ganada con el campeón correcto.',
    puuid: 'n-Hc0QPy6rhTlFvKzFTF6WLy4aoQA0gv2N5Tf9khwBdLrRWpVuTX83lLutD_nbYlJSnZURDYR4aLEw',
    region: 'euw1',
    championId: 64, // Lee Sin
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    expectedResult: 'success',
    expectedMessage: 'Victoria verificada exitosamente'
  },
  {
    id: 'defeat',
    name: '✅ Derrota con Campeón',
    description: 'Partida perdida pero con el campeón correcto. Aún debería verificar.',
    puuid: 'n-Hc0QPy6rhTlFvKzFTF6WLy4aoQA0gv2N5Tf9khwBdLrRWpVuTX83lLutD_nbYlJSnZURDYR4aLEw',
    region: 'euw1',
    championId: 238, // Zed
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    expectedResult: 'success',
    expectedMessage: 'Partida verificada (aunque perdiste)'
  },
]

export default function TestVerifyPage() {
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null)
  const [customMode, setCustomMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  // Custom inputs
  const [customPuuid, setCustomPuuid] = useState('n-Hc0QPy6rhTlFvKzFTF6WLy4aoQA0gv2N5Tf9khwBdLrRWpVuTX83lLutD_nbYlJSnZURDYR4aLEw')
  const [customRegion, setCustomRegion] = useState('euw1')
  const [customChampionId, setCustomChampionId] = useState('')
  const [customTimestamp, setCustomTimestamp] = useState('')

  const runTest = async (scenario: TestScenario) => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      console.log('🧪 Running test scenario:', scenario.name)
      console.log('Expected result:', scenario.expectedResult)

      const response = await fetch('/api/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    puuid: scenario.puuid,
    region: scenario.region,
    championId: scenario.championId,
    challengeCreatedAt: scenario.timestamp
  })
})

let data: any = {}

try {
  const text = await response.text()
  data = text ? JSON.parse(text) : {}
} catch (err) {
  data = { error: 'Server returned invalid JSON' }
}

if (!response.ok) {
  setError(data.error || `HTTP ${response.status}`)
}

      

      setResult({
        ...data,
        expected: scenario.expectedResult,
        expectedMessage: scenario.expectedMessage,
        actualResult: data.success ? 'success' : 'fail',
        passed: (data.success && scenario.expectedResult === 'success') || 
                (!data.success && scenario.expectedResult === 'fail')
      })

    } catch (err: any) {
      console.error('Test error:', err)
      setError(err.message || 'Network error')
      setResult({
        expected: scenario.expectedResult,
        expectedMessage: scenario.expectedMessage,
        actualResult: 'error',
        passed: false
      })
    } finally {
      setLoading(false)
    }
  }

  const runCustomTest = async () => {
    if (!customPuuid || !customChampionId) {
      setError('PUUID and Champion ID are required')
      return
    }

    const customScenario: TestScenario = {
      id: 'custom',
      name: 'Custom Test',
      description: 'User-defined test case',
      puuid: customPuuid,
      region: customRegion,
      championId: Number(customChampionId),
      timestamp: customTimestamp || new Date().toISOString(),
      expectedResult: 'success',
      expectedMessage: 'Custom test'
    }

    await runTest(customScenario)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🧪 Verification Testing Suite</h1>
          <p className="text-neutral-400">Test diferentes escenarios de verificación sin jugar partidas</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setCustomMode(false)}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              !customMode 
                ? 'bg-[#C89B3C] text-neutral-950' 
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            📋 Escenarios Predefinidos
          </button>
          <button
            onClick={() => setCustomMode(true)}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              customMode 
                ? 'bg-[#C89B3C] text-neutral-950' 
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            ✏️ Prueba Personalizada
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Scenarios / Custom Form */}
          <div className="lg:col-span-2 space-y-4">
            {!customMode ? (
              // Predefined Scenarios
              <>
                <h2 className="text-2xl font-bold text-white mb-4">Escenarios de Prueba</h2>
                {TEST_SCENARIOS.map(scenario => (
                  <div
                    key={scenario.id}
                    className={`bg-neutral-900 rounded-xl border-2 p-6 cursor-pointer transition ${
                      selectedScenario?.id === scenario.id
                        ? 'border-[#C89B3C] shadow-lg shadow-[#C89B3C]/20'
                        : 'border-neutral-800 hover:border-neutral-700'
                    }`}
                    onClick={() => setSelectedScenario(scenario)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-white">{scenario.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        scenario.expectedResult === 'success'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {scenario.expectedResult === 'success' ? 'Should Pass' : 'Should Fail'}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-sm mb-3">{scenario.description}</p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-neutral-500">Region:</span>
                        <span className="text-neutral-300 ml-2">{scenario.region.toUpperCase()}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Champion:</span>
                        <span className="text-neutral-300 ml-2">{scenario.championId}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              // Custom Form
              <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Prueba Personalizada</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-neutral-400 text-sm mb-2">PUUID</label>
                    <input
                      type="text"
                      value="n-Hc0QPy6rhTlFvKzFTF6WLy4aoQA0gv2N5Tf9khwBdLrRWpVuTX83lLutD_nbYlJSnZURDYR4aLEw"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#C89B3C] transition font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 text-sm mb-2">Region</label>
                    <select
                      value={customRegion}
                      onChange={(e) => setCustomRegion(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:border-[#C89B3C] transition"
                    >
                      <option value="euw1">EUW</option>
                      <option value="eun1">EUNE</option>
                      <option value="na1">NA</option>
                      <option value="kr">KR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-400 text-sm mb-2">Champion ID</label>
                    <input
                      type="number"
                      value={customChampionId}
                      onChange={(e) => setCustomChampionId(e.target.value)}
                      placeholder="103"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#C89B3C] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 text-sm mb-2">Timestamp (opcional)</label>
                    <input
                      type="text"
                      value={customTimestamp}
                      onChange={(e) => setCustomTimestamp(e.target.value)}
                      placeholder="Leave empty for now"
                      className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#C89B3C] transition font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Test Panel */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 sticky top-6">
              <h3 className="text-xl font-bold text-white mb-4">Panel de Prueba</h3>

              {!customMode && selectedScenario && (
                <div className="mb-6 p-4 rounded-xl bg-neutral-800 border border-neutral-700">
                  <p className="text-neutral-400 text-sm mb-2">Escenario seleccionado:</p>
                  <p className="text-white font-semibold">{selectedScenario.name}</p>
                </div>
              )}

              <button
                onClick={() => customMode ? runCustomTest() : selectedScenario && runTest(selectedScenario)}
                disabled={loading || (!customMode && !selectedScenario) || (customMode && (!customPuuid || !customChampionId))}
                className="w-full py-4 rounded-xl bg-[#C89B3C] hover:bg-[#d9aa44] text-neutral-950 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed mb-6"
              >
                {loading ? 'Testing...' : '▶️ Ejecutar Prueba'}
              </button>

              {/* Result Display */}
              {result && (
                <div className={`p-4 rounded-xl border-2 ${
                  result.passed
                    ? 'bg-green-500/10 border-green-500/50'
                    : 'bg-red-500/10 border-red-500/50'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    {result.passed ? (
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <h4 className={`font-bold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                      {result.passed ? 'Test Passed ✅' : 'Test Failed ❌'}
                    </h4>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-neutral-400">Expected:</span>
                      <span className="text-white ml-2">{result.expected}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Actual:</span>
                      <span className="text-white ml-2">{result.actualResult}</span>
                    </div>
                    {result.message && (
                      <div>
                        <span className="text-neutral-400">Message:</span>
                        <p className="text-white mt-1">{result.message}</p>
                      </div>
                    )}
                  </div>

                  <details className="mt-3">
                    <summary className="text-neutral-400 text-xs cursor-pointer">Show JSON</summary>
                    <pre className="mt-2 p-2 rounded bg-neutral-950 text-neutral-300 text-xs overflow-auto max-h-48">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/50">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to League Roulette
          </a>
        </div>
      </div>
    </main>
  )
}