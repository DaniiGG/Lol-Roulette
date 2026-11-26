import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { championIconUrl } from '@/lib/champion-data'
import type { ChampionCatalogEntry, MasteryValue } from '@/lib/mastery-tree/explorer-types'
import { ROLE_COLORS } from '@/lib/mastery-tree/visuals'
import styles from './MasteryOrbit.module.css'

type OrbitChampion = ChampionCatalogEntry & MasteryValue
const ATOM_ANGLES = [0, 60, 120]

type Props = {
  nodes: OrbitChampion[]
  paused: boolean
  atom?: boolean
  selectedId?: number
  onSelect?: (node: ChampionCatalogEntry) => void
}

export default function MasteryOrbit({ nodes, paused, atom = false, selectedId, onSelect }: Props) {
  const ui = useTranslations('mastery-page')
  const orbitRef = useRef<HTMLDivElement>(null)
  const [center, ...rest] = nodes
  const orbiting = rest.sort((a, b) =>
    (b.level ?? 0) - (a.level ?? 0) || (b.points ?? 0) - (a.points ?? 0),
  )
  const maxLevel = nodes.reduce((max, node) => Math.max(max, node.level ?? 0), 0)
  const levelScale = (node: OrbitChampion) =>
    maxLevel > 0 ? Math.log1p(node.level ?? 0) / Math.log1p(maxLevel) : 0
  const ringCount = Math.ceil(Math.sqrt(orbiting.length / 5))
  const innerRadius = atom ? 21 : 16
  const spacing = ringCount > 1 ? (44 - innerRadius) / (ringCount - 1) : 28
  const radii = Array.from({ length: ringCount }, (_, index) =>
    ringCount === 1 ? (atom ? 39 : 29) : innerRadius + index * spacing,
  )
  const totalRadius = radii.reduce((sum, radius) => sum + radius, 0)
  const Portrait = onSelect ? 'button' : 'span'
  let assigned = 0
  let cumulativeRadius = 0

  const rings = radii.map(radius => {
    cumulativeRadius += radius
    // Proportional counts keep a similar distance between neighbors on every ring.
    const end = Math.round(orbiting.length * cumulativeRadius / totalRadius)
    const champions = orbiting.slice(assigned, end)
    assigned = end
    return { radius, champions }
  })
  const baseSize = Math.min(10, spacing * 0.86, ...rings.map(({ radius, champions }) =>
    champions.length > 1 ? 1.7 * radius * Math.sin(Math.PI / champions.length) : 10,
  ))

  useLayoutEffect(() => {
    const rate = selectedId === undefined ? 1 : 0.3
    // Changing the playback rate keeps both rotations at their current angle.
    for (const animation of orbitRef.current?.getAnimations({ subtree: true }) ?? []) {
      animation.updatePlaybackRate(rate)
    }
  }, [atom, nodes, selectedId])

  function renderPortrait(node: OrbitChampion, isCenter: boolean) {
    return (
      <Portrait
        type={onSelect ? 'button' : undefined}
        onClick={onSelect ? () => onSelect(node) : undefined}
        aria-label={onSelect ? node.name : undefined}
        data-selected={node.championId === selectedId || undefined}
        title={node.name}
        className={styles.orbitPortrait}
        style={{ borderColor: isCenter ? '#f0c75e' : ROLE_COLORS[node.primaryRole].color }}
      >
        <Image src={championIconUrl(node.key)} alt={onSelect ? '' : node.name} width={isCenter ? 80 : 52} height={isCenter ? 80 : 52} />
      </Portrait>
    )
  }

  return (
    <div ref={orbitRef} className={styles.orbit} data-paused={paused} data-atom={atom} role="group" aria-label={ui('collection')}>
      {atom && <svg viewBox="0 0 100 100" className={styles.atomTracks} aria-hidden="true">
        {ATOM_ANGLES.map(angle => (
          <ellipse key={angle} cx="50" cy="50" rx="46" ry="23" transform={`rotate(${angle} 50 50)`} />
        ))}
        {rings.map(({ radius }, ring) => (
          <ellipse key={ring} cx="50" cy="50" rx={radius} ry={radius / 2} transform={`rotate(${ATOM_ANGLES[ring % ATOM_ANGLES.length]} 50 50)`} />
        ))}
      </svg>}
      {center && <div className={styles.orbitCenter} style={{ width: `${12 + 4 * levelScale(center)}%` }}>
        {renderPortrait(center, true)}
      </div>}
      {rings.map(({ radius, champions }, ring) => {
        const planeAngle = ATOM_ANGLES[ring % ATOM_ANGLES.length]
        const planeRadians = atom ? planeAngle * Math.PI / 180 : 0
        const planeCos = Math.cos(planeRadians)
        const planeSin = Math.sin(planeRadians)
        const ringStyle = {
          '--track-inset': `${50 - radius}%`,
          '--orbit-duration': `${32 + ring * 8}s`,
          '--orbit-turn': ring % 2 === 0 ? '1turn' : '-1turn',
          '--atom-radius': radius,
          '--atom-plane-cos': planeCos,
          '--atom-plane-sin': planeSin,
        } as CSSProperties

        return (
          <div key={ring} className={styles.orbitPlane} style={ringStyle}>
            <ul className={styles.orbitRing}>
              {champions.map((node, index) => {
                const angle = (index + (ring % 2) * 0.5) * (2 * Math.PI / champions.length) - Math.PI / 2
                const x = Math.cos(angle) * radius
                const y = Math.sin(angle) * radius * (atom ? 0.5 : 1)
                const position = {
                  '--start-x': `${50 + x * planeCos - y * planeSin}%`,
                  '--start-y': `${50 + x * planeSin + y * planeCos}%`,
                  '--atom-start-angle': `${angle}rad`,
                  width: `${baseSize * (0.55 + 0.45 * levelScale(node)) * (atom ? 0.78 : 1)}%`,
                } as CSSProperties

                return (
                  <li key={node.championId} className={styles.orbitPosition} style={position}>
                    {renderPortrait(node, false)}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
