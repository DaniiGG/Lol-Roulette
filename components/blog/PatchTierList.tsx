import Image from 'next/image'
import { championIconUrl } from '@/lib/champion-data'
import { PATCH_TYPE_BY_CHAMPION, ROLE_ORDER, TIER_ORDER } from '@/lib/patch-tier-list'
import type { PatchTierListData, TierChampion, TierGrade } from '@/lib/patch-tier-list'

interface PatchTierListProps {
  data: PatchTierListData
  locale: string
}

const TIER_STYLES: Record<TierGrade, string> = {
  'S+': 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300',
  S: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  A: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  B: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  C: 'border-neutral-700 bg-neutral-800/60 text-neutral-300',
}

function ChampionPick({ champion, data }: { champion: TierChampion; data: PatchTierListData }) {
  const imageId = champion.id
  const patchType = PATCH_TYPE_BY_CHAMPION[imageId]

  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950/80 py-1 pl-1 pr-2.5">
      <Image
        src={championIconUrl(imageId)}
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 rounded-md border border-neutral-700"
      />
      <span className="text-sm font-medium text-white">{champion.name}</span>
      {champion.rising ? (
        <span className="rounded bg-[#C89B3C]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#C89B3C]">
          {data.ui.rising}
        </span>
      ) : null}
      {patchType ? (
        <span className="text-[10px] uppercase tracking-wide text-neutral-500">
          {data.patchTypes[patchType]}
        </span>
      ) : null}
    </span>
  )
}

export default function PatchTierList({ data, locale }: PatchTierListProps) {
  const isEs = locale === 'es'
  const title = isEs ? 'Tier list del parche 26.21 por línea' : 'Patch 26.21 tier list by role'
  const subtitle = isEs
    ? 'Una tabla estática con los picks recomendados, los cambios del parche y los campeones en observación para cada línea.'
    : 'A static table with the recommended picks, patch changes and watchlist champions for every role.'

  return (
    <section className="not-prose my-10" aria-labelledby="tier-list-title">
      <div className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/90 shadow-xl shadow-black/20">
        <header className="border-b border-neutral-800 px-5 py-6 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C89B3C]">
            {data.ui.kicker}
          </p>
          <h2 id="tier-list-title" className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">{subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-400">
            <span className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1">
              {data.ui.patch}: <strong className="text-white">{data.patch}</strong>
            </span>
            <span className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1">
              {data.ui.reviewed}: <strong className="text-white">{data.lastReviewed}</strong>
            </span>
            <span className="rounded-full border border-[#C89B3C]/30 bg-[#C89B3C]/10 px-3 py-1 text-[#C89B3C]">
              {data.ui.editorial}
            </span>
          </div>
          <p className="mt-3 text-xs leading-5 text-neutral-500">{data.ui.provisional}</p>
        </header>

        <div className="divide-y divide-neutral-800">
          {ROLE_ORDER.map((role) => {
            const roleChampions = data.champions.filter((champion) => champion.role === role)
            const hasTopTier = roleChampions.some(
              (champion) => champion.tier === 'S+' || champion.tier === 'S'
            )

            return (
              <div key={role} className="px-4 py-6 sm:px-8">
                <div className="mb-3">
                  <h3 className="text-xl font-semibold text-white">{data.roles[role]}</h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-400">{data.roleDescriptions[role]}</p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-neutral-800">
                  <table className="w-full min-w-[34rem] text-left text-sm">
                    <thead>
                      <tr className="border-b border-neutral-800 bg-neutral-900">
                        <th scope="col" className="w-36 px-4 py-3 font-semibold text-white">
                          {data.ui.tier}
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold text-white">
                          {data.roles[role]}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {TIER_ORDER.map((tier) => {
                        const picks = roleChampions.filter((champion) => champion.tier === tier)

                        return (
                          <tr key={tier} className="border-b border-neutral-800/60 last:border-0">
                            <th scope="row" className="px-4 py-3 align-top">
                              <span
                                className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${TIER_STYLES[tier]}`}
                              >
                                {data.tiers[tier]}
                              </span>
                            </th>
                            <td className="px-4 py-3 align-top">
                              {picks.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {picks.map((champion) => (
                                    <ChampionPick
                                      key={`${champion.role}-${champion.id}`}
                                      champion={champion}
                                      data={data}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-neutral-500">{data.ui.tierRowEmpty}</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {!hasTopTier ? (
                  <p className="mt-3 text-xs leading-5 text-neutral-500">{data.ui.emptyTierNote}</p>
                ) : null}
              </div>
            )
          })}
        </div>

        <footer className="border-t border-neutral-800 px-5 py-5 sm:px-8">
          <h3 className="text-sm font-semibold text-white">{data.ui.sources}</h3>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-neutral-400">
            {data.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-neutral-700 underline-offset-2 transition hover:text-[#C89B3C]"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </section>
  )
}
