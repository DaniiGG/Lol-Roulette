import { useState } from 'react'
import Image from 'next/image'
import { Maximize2, Pause, Play } from 'lucide-react'
import { useTranslations } from 'next-intl'
import AccessibleModal from './AccessibleModal'
import MasteryOrbit from './MasteryOrbit'
import styles from './MasteryOrbit.module.css'
import { championIconUrl } from '@/lib/champion-data'
import { EXPLORER_ROLES, type ChampionCatalogEntry, type ExplorerRole, type MasteryValue } from '@/lib/mastery-tree/explorer-types'
import { ROLE_COLORS } from '@/lib/mastery-tree/visuals'

export type MasteryView = 'map' | 'orbit' | 'atom' | 'profile'
type CollectionChampion = ChampionCatalogEntry & MasteryValue & { rank: number }

type Props = {
  view: Exclude<MasteryView, 'map'>
  nodes: CollectionChampion[]
  roleLabels: Record<ExplorerRole, string>
  formatter: Intl.NumberFormat
  selectedId?: number
  onSelect: (node: ChampionCatalogEntry) => void
}

function MasteryArtwork({ view, nodes, roleLabels, formatter, onSelect, selectedId, paused = false }: Omit<Props, 'onSelect'> & { onSelect?: Props['onSelect']; paused?: boolean }) {
  const ui = useTranslations('mastery-page')
  const t = useTranslations('masteryTreeExplorer')
  const total = nodes.reduce((sum, node) => sum + (node.points ?? 0), 0)
  const groups = view === 'profile' ? EXPLORER_ROLES.map((role) => {
    const champions = nodes.filter((node) => node.primaryRole === role)
    return { role, champions, points: champions.reduce((sum, node) => sum + (node.points ?? 0), 0) }
  }) : []
  const orbit = view !== 'profile'
  const portraits = groups.flatMap((group) => group.champions)
  const mosaicColumns = nodes.length <= 32
    ? 'grid-cols-8 auto-rows-[clamp(24px,5dvh,40px)] sm:auto-rows-[clamp(30px,6dvh,52px)]'
    : nodes.length <= 96
      ? 'grid-cols-12 auto-rows-[clamp(18px,3.6dvh,28px)] max-sm:[@media(max-height:600px)]:auto-rows-[clamp(16px,3.3dvh,20px)] sm:grid-cols-16 sm:auto-rows-[clamp(22px,4dvh,36px)]'
      : 'grid-cols-16 auto-rows-[clamp(14px,3.1dvh,23px)] max-sm:[@media(max-height:600px)]:auto-rows-[clamp(13px,2.65dvh,16px)] sm:grid-cols-24 sm:auto-rows-[clamp(20px,3.45dvh,36px)]'
  const Portrait = onSelect ? 'button' : 'span'

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#f0c75e]/20 bg-[radial-gradient(ellipse_at_top,#231831,#080610_75%)] p-2.5 sm:p-4">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 text-xs text-white/65">
        <span>{ui('championCount', { count: nodes.length })}</span>
        <span className="font-semibold tabular-nums text-[#f0c75e]">
          {t('totalPoints')} {nodes.some((node) => node.points !== null) ? formatter.format(total) : '—'}
        </span>
      </div>
      {orbit ? (
        <MasteryOrbit nodes={nodes} paused={paused} atom={view === 'atom'} selectedId={selectedId} onSelect={onSelect} />
      ) : (
        <>
          {total > 0 && <div aria-hidden="true" className="mb-1.5 flex h-1.5 overflow-hidden rounded-full">
            {groups.map(({ role, points }) => (
              <span key={role} style={{ width: `${points / total * 100}%`, backgroundColor: ROLE_COLORS[role].color }} />
            ))}
          </div>}
          <ul className="mb-2 grid grid-cols-5 gap-1 text-center">
            {groups.map(({ role, champions, points }) => (
              <li key={role} className="min-w-0 rounded-md bg-white/5 px-0.5 py-1 leading-tight">
                <span className="block truncate text-[10px] font-semibold" style={{ color: ROLE_COLORS[role].color }}>{roleLabels[role]}</span>
                <span aria-hidden="true" className="block text-[10px] tabular-nums text-white/80">{formatter.format(champions.length)}</span>
                <span className="sr-only">{ui('championCount', { count: champions.length })}</span>
                <span className="sr-only">{t('detailsPoints')} {champions.length > 0 && !champions.some((node) => node.points !== null) ? '—' : formatter.format(points)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {portraits.length > 0 && (
          <ul
            aria-label={ui('collection')}
            className={`grid w-full gap-0.5 max-sm:[@media(max-height:600px)]:gap-px sm:gap-1 ${mosaicColumns}`}
            style={portraits.length < 8 ? { gridTemplateColumns: `repeat(${portraits.length}, minmax(0, 1fr))` } : undefined}
          >
            {portraits.map((node) => (
              <li key={node.championId} className="min-w-0">
                <Portrait
                  type={onSelect ? 'button' : undefined}
                  onClick={onSelect ? () => onSelect(node) : undefined}
                  aria-label={onSelect ? node.name : undefined}
                  title={node.name}
                  className="relative block h-full w-full overflow-hidden rounded-[3px] border bg-[#100c1c] hover:brightness-125 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
                  style={{ borderColor: ROLE_COLORS[node.primaryRole].color }}
                >
                  <Image src={championIconUrl(node.key)} alt={onSelect ? '' : node.name} fill sizes="(max-width: 639px) 40px, 80px" className="object-cover" />
                </Portrait>
              </li>
            ))}
          </ul>
      )}
    </div>
  )
}

export default function MasteryCollectionView({ view, nodes, roleLabels, formatter, onSelect, selectedId }: Props) {
  const ui = useTranslations('mastery-page')
  const [captureOpen, setCaptureOpen] = useState(false)
  const [orbitPaused, setOrbitPaused] = useState(false)
  const ranked = [...nodes].sort((a, b) => (b.points ?? -1) - (a.points ?? -1) || (b.level ?? -1) - (a.level ?? -1) || a.rank - b.rank)
  const artwork = { view, nodes: ranked, roleLabels, formatter }
  const heading = ui(view === 'profile' ? 'profileHeading' : view === 'atom' ? 'atomHeading' : 'orbitHeading')

  return (
    <section aria-label={ui(view)} className="mt-2 rounded-[1.4rem] border border-white/[0.06] bg-[#05030d] px-2 pb-2 sm:px-3 sm:pb-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 py-1.5">
        <h3 className="min-w-0 text-xs font-semibold text-white/85">{heading}</h3>
        {nodes.length > 0 && (
          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            {view !== 'profile' && (
              <button type="button" onClick={() => setOrbitPaused(paused => !paused)} className={styles.motionButton}>
                {orbitPaused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
                {ui(orbitPaused ? 'resumeOrbit' : 'pauseOrbit')}
              </button>
            )}
            <button type="button" onClick={() => setCaptureOpen(true)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#f0c75e] hover:bg-[#f0c75e]/10 focus-visible:outline-2 focus-visible:outline-[#f0c75e]">
              <Maximize2 size={14} aria-hidden="true" />{ui('capture')}
            </button>
          </div>
        )}
      </div>
      {nodes.length > 0
        ? <MasteryArtwork {...artwork} paused={orbitPaused || captureOpen} selectedId={selectedId} onSelect={onSelect} />
        : <p role="status" className="px-3 py-8 text-center text-sm text-white/65">{ui('viewEmpty')}</p>}
      <AccessibleModal
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
        titleId="mastery-capture-title"
        closeLabel={ui('closeCapture')}
        className="w-full sm:!max-w-5xl"
      >
        <div className="p-2.5 sm:p-5">
          <h2 id="mastery-capture-title" className="mb-2 pe-10 text-base font-bold text-white sm:mb-4 sm:text-xl">{heading}</h2>
          <MasteryArtwork {...artwork} paused />
        </div>
      </AccessibleModal>
    </section>
  )
}
