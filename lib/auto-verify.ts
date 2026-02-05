// lib/auto-verify.ts
// Sistema de verificación automática de partidas

export class AutoVerifier {
  private intervalId: NodeJS.Timeout | null = null
  private isChecking = false

  constructor(
    private userId: string,
    private puuid: string,
    private region: string,
    private championId: number,
    private onSuccess: (result: any) => void,
    private onFail: () => void,
    private sessionToken: string
  ) {}

  // Iniciar verificación automática
  start() {
    console.log('🔄 Auto-verification started')
    
    // Verificar cada 2 minutos
    this.intervalId = setInterval(() => {
      this.checkMatch()
    }, 2 * 60 * 1000) // 2 minutos

    // Primera verificación inmediata
    this.checkMatch()
  }

  // Detener verificación automática
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('⏸️ Auto-verification stopped')
    }
  }

  // Verificar si hay partida completada
  private async checkMatch() {
    if (this.isChecking) return // Evitar verificaciones simultáneas

    this.isChecking = true

    try {
      console.log('🔍 Checking for completed match...')

      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sessionToken}`
        },
        body: JSON.stringify({
          puuid: this.puuid,
          region: this.region,
          championId: this.championId
        })
      })

      if (!response.ok) {
        // Si hay error 404 o similar, continuar verificando
        console.log('⏳ No match found yet')
        return
      }

      const result = await response.json()

      if (result.success) {
        console.log('✅ Match verified automatically!')
        this.stop() // Detener verificación
        this.onSuccess(result)
      } else if (result.playedCorrectChampion === false) {
        console.log('❌ Wrong champion detected')
        this.stop()
        this.onFail()
      }
      // Si playedCorrectChampion es true pero won es false, seguir esperando

    } catch (error) {
      console.error('Error in auto-verification:', error)
    } finally {
      this.isChecking = false
    }
  }
}