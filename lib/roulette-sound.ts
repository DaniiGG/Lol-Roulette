type Voice = {
  frequency: number
  end: number
  seconds: number
  gain: number
  wave: OscillatorType | 'noise'
  offset?: number
}

const sounds = {
  reelTick: [{ frequency: 1650, end: 670, seconds: .028, gain: .023, wave: 'triangle' }],
  reelStop: [
    { frequency: 160, end: 69, seconds: .16, gain: .078, wave: 'triangle' },
    { frequency: 1750, end: 730, seconds: .05, gain: .045, wave: 'noise' },
  ],
  ballTap: [{ frequency: 810, end: 460, seconds: .065, gain: .052, wave: 'triangle' }],
  latch: [
    { frequency: 2200, end: 790, seconds: .07, gain: .048, wave: 'noise' },
    { frequency: 325, end: 163, seconds: .076, gain: .055, wave: 'triangle' },
  ],
  drop: [
    { frequency: 260, end: 90, seconds: .15, gain: .093, wave: 'sine' },
    { frequency: 1260, end: 410, seconds: .068, gain: .062, wave: 'triangle' },
  ],
  shuffle: [{ frequency: 1700, end: 390, seconds: .24, gain: .074, wave: 'noise' }],
  flip: [
    { frequency: 510, end: 2600, seconds: .13, gain: .062, wave: 'noise' },
    { frequency: 930, end: 508, seconds: .05, gain: .029, wave: 'triangle', offset: .1 },
  ],
  pieceSnap: [
    { frequency: 480, end: 175, seconds: .08, gain: .058, wave: 'triangle' },
    { frequency: 2600, end: 970, seconds: .045, gain: .037, wave: 'noise' },
  ],
  winner: [
    { frequency: 523.25, end: 523.25, seconds: .26, gain: .054, wave: 'sine' },
    { frequency: 659.25, end: 659.25, seconds: .29, gain: .045, wave: 'sine', offset: .065 },
    { frequency: 783.99, end: 783.99, seconds: .33, gain: .047, wave: 'sine', offset: .13 },
    { frequency: 1046.5, end: 1046.5, seconds: .41, gain: .033, wave: 'sine', offset: .205 },
  ],
} satisfies Record<string, Voice[]>

type Cue = keyof typeof sounds
let audio: AudioContext | undefined
let noise: AudioBuffer | undefined

export function unlockRouletteAudio() {
  try {
    audio ??= new AudioContext()
    if (audio.state === 'suspended') void audio.resume().catch(() => {})
  } catch {
    // A browser without Web Audio can still run every roulette mode.
  }
}

function getNoise(context: AudioContext) {
  if (noise) return noise
  noise = context.createBuffer(1, Math.ceil(context.sampleRate * .3), context.sampleRate)
  const samples = noise.getChannelData(0)
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1
  return noise
}

export function playRouletteSound(cue: Cue, strength = 1) {
  const context = audio
  if (context?.state !== 'running') return
  for (const voice of sounds[cue] as Voice[]) {
    const start = context.currentTime + (voice.offset ?? 0)
    const finish = start + voice.seconds
    const envelope = context.createGain()
    envelope.gain.setValueAtTime(.0001, start)
    envelope.gain.linearRampToValueAtTime(voice.gain * strength, start + .008)
    envelope.gain.exponentialRampToValueAtTime(.0001, finish)
    envelope.connect(context.destination)

    const source = voice.wave === 'noise' ? context.createBufferSource() : context.createOscillator()
    if ('buffer' in source) {
      source.buffer = getNoise(context)
      const filter = context.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(voice.frequency, start)
      filter.frequency.exponentialRampToValueAtTime(voice.end, finish)
      source.connect(filter)
      filter.connect(envelope)
    } else {
      source.type = voice.wave as OscillatorType
      source.frequency.setValueAtTime(voice.frequency, start)
      source.frequency.exponentialRampToValueAtTime(voice.end, finish)
      source.connect(envelope)
    }
    source.start(start)
    source.stop(finish)
  }
}

export const cardSounds: [number, Cue][] = [
  [.12, 'shuffle'], [.52, 'shuffle'], [.77, 'shuffle'], [1.17, 'shuffle'],
  [1.5, 'shuffle'], [2.66, 'flip'],
]
