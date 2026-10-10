"use client"

import { useTranslations } from "next-intl"
import { ChallengeSessionWithDefinition } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { es, de, fr, it, pt, pl, ru, ja, ko, zhCN, nl, ar } from "date-fns/locale"

const localeMap: Record<string, any> = {
  es, de, fr, it, pt, pl, ru, ja, ko, 'zh-CN': zhCN, nl, ar
}

const defaultLocale = {} as any // Use default locale (en)

interface ChallengeHistoryProps {
  sessions: ChallengeSessionWithDefinition[]
  locale: string
}

export default function ChallengeHistory({ sessions, locale }: ChallengeHistoryProps) {
  const t = useTranslations('challenges')
  const dateLocale = localeMap[locale] || defaultLocale

  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 text-center">
        <p className="text-neutral-400">{t('noHistory') || 'No challenge history yet'}</p>
        <p className="text-sm text-neutral-500 mt-1">{t('noHistoryDesc') || 'Complete challenges to see them here'}</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="rounded-full px-3 py-1 text-xs font-semibold bg-green-500/20 text-green-400">
            {t('status.completed') || 'Completed'}
          </span>
        )
      case "expired":
        return (
          <span className="rounded-full px-3 py-1 text-xs font-semibold bg-yellow-500/20 text-yellow-400">
            {t('status.expired') || 'Expired'}
          </span>
        )
      case "failed":
        return (
          <span className="rounded-full px-3 py-1 text-xs font-semibold bg-red-500/20 text-red-400">
            {t('status.failed') || 'Failed'}
          </span>
        )
      default:
        return (
          <span className="rounded-full px-3 py-1 text-xs font-semibold bg-neutral-700 text-neutral-400">
            {status}
          </span>
        )
    }
  }

  const getResultText = (session: ChallengeSessionWithDefinition) => {
    if (session.status === "completed") {
      return t('result.completed', { 
        wins: session.valid_wins, 
        bonusXp: session.bonus_xp 
      }) || `${session.valid_wins} wins • +${session.bonus_xp} bonus XP`
    } else if (session.status === "expired") {
      return t('result.expired') || 'Challenge expired without completion'
    } else if (session.status === "failed") {
      return t('result.failed') || 'Challenge failed'
    }
    return ""
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <span className="text-[#C89B3C]">📜</span>
        {t('history') || 'Challenge History'}
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {sessions.map((session) => {
          const definition = session.definition
          const startedAt = new Date(session.started_at)
          const endedAt = session.completed_at ? new Date(session.completed_at) : new Date(session.expires_at)
          
          return (
            <article
              key={session.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 transition hover:border-neutral-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-2xl flex-shrink-0">{definition?.emoji || '🎯'}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-white truncate">{definition?.name || 'Challenge'}</h4>
                      {getStatusBadge(session.status)}
                    </div>
                    <p className="text-xs text-neutral-400 truncate">{definition?.description || ''}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                      <span>{t('duration') || 'Duration'}: {session.duration_hours}h</span>
                      <span>{t('started') || 'Started'}: {formatDistanceToNow(startedAt, { addSuffix: true, locale: dateLocale })}</span>
                      {session.completed_at && (
                        <span>{t('ended') || 'Ended'}: {formatDistanceToNow(endedAt, { addSuffix: true, locale: dateLocale })}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 min-w-[160px]">
                  <p className="text-right text-sm font-medium text-white">
                    {session.status === "completed" ? `+${session.total_base_xp + session.bonus_xp} XP` : ''}
                  </p>
                  <p className="text-right text-xs text-neutral-400">
                    {session.valid_wins > 0 && (
                      <>
                        {session.valid_wins} {t('wins') || 'wins'} • +{session.bonus_xp} {t('bonusXP') || 'bonus XP'}
                      </>
                    )}
                  </p>
                </div>
              </div>
              {session.status === "completed" && (
                <div className="mt-3 pt-3 border-t border-neutral-800">
                  <p className="text-sm text-green-400">{getResultText(session)}</p>
                </div>
              )}
              {(session.status === "expired" || session.status === "failed") && (
                <div className="mt-3 pt-3 border-t border-neutral-800">
                  <p className="text-sm text-neutral-400">{getResultText(session)}</p>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}