'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Link2,
  Loader2,
  Share2,
  X,
} from 'lucide-react'
import AccessibleModal from './AccessibleModal'
import type {
  ExplorerLayout,
  ExplorerMode,
  ExplorerRole,
} from '@/lib/mastery-tree/explorer-types'
import { ROLE_COLORS } from '@/lib/mastery-tree/visuals'
import { championIconUrl } from '@/lib/champion-data'
import {
  createShareCardBlob,
  downloadBlob,
  type ShareCardChampion,
  type ShareCardData,
} from '@/lib/mastery-tree/share-card'
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics/events'

interface ShareModalProps {
  open: boolean
  onClose: () => void
  url: string
  mode: ExplorerMode
  locale: string
  layout: ExplorerLayout
  roleLabels: Record<ExplorerRole, string>
}

type Notice = { kind: 'success' | 'error'; text: string } | null

function fallbackCopy(text: string): boolean {
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  let copied = false
  try {
    copied = document.execCommand('copy')
  } catch {
    copied = false
  }
  area.remove()
  return copied
}

function toShareChampion(node: {
  key: string
  name: string
  points: number | null
  level: number | null
  primaryRole: ExplorerRole
}): ShareCardChampion {
  return {
    key: node.key,
    name: node.name,
    points: node.points,
    level: node.level,
    role: node.primaryRole,
  }
}

export default function ShareModal({
  open,
  onClose,
  url,
  mode,
  locale,
  layout,
  roleLabels,
}: ShareModalProps) {
  const t = useTranslations('masteryTreeExplorer')
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale])

  const centerNode = useMemo(
    () => layout.nodes.find((node) => node.isCenter) ?? null,
    [layout.nodes],
  )

  const topNodes = useMemo(
    () =>
      layout.nodes
        .filter((node) => !node.isCenter)
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 5),
    [layout.nodes],
  )

  const championCount = layout.nodes.length
  const isPersonal = mode === 'personal'
  const rootNode = isPersonal ? centerNode : null
  const shareTitle = isPersonal
    ? t('shareImageTitle')
    : t('shareImageTitleExplore')
  const shareSubtitle = isPersonal
    ? t('shareImageSubtitle', {
        count: championCount,
        points: numberFormatter.format(layout.totalPoints),
      })
    : t('shareImageSubtitleExplore')
  const shareText = `${shareTitle} · ${t('sharePreviewChampions', { count: championCount })}`
  const previewChampions = rootNode ? topNodes : topNodes.slice(0, 5)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) {
      setCopied(false)
      setNotice(null)
      setExporting(false)
      return
    }
    setCopied(false)
    setNotice(null)
  }, [open])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 5000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const shareData = (): ShareCardData => ({
    mode,
    locale,
    title: shareTitle,
    subtitle: shareSubtitle,
    modeLabel: isPersonal ? t('sharePreviewPersonal') : t('sharePreviewExplore'),
    modeBadge: isPersonal ? t('modePersonal') : t('modeExplore'),
    root: rootNode ? toShareChampion(rootNode) : null,
    champions: previewChampions.map(toShareChampion),
    roleLabels,
    disclaimer: t('shareImageDisclaimer'),
    url,
    pointsLabel: t('tooltipPoints'),
    levelLabel: t('tooltipLevel'),
  })

  const createImage = async () => {
    const blob = await createShareCardBlob(shareData())
    return { blob, filename: 'leagueroulette-mastery-tree.png' }
  }

  const copyLink = async () => {
    let copiedOk = false
    try {
      await navigator.clipboard.writeText(url)
      copiedOk = true
    } catch {
      copiedOk = fallbackCopy(url)
    }

    if (copiedOk) {
      setCopied(true)
      setNotice({ kind: 'success', text: t('shareLinkCopied') })
      trackEvent(ANALYTICS_EVENTS.linkCopied)
    } else {
      setNotice({ kind: 'error', text: t('shareLinkError') })
    }
  }

  const nativeShare = async () => {
    trackEvent(ANALYTICS_EVENTS.shareClicked, { method: 'native' })
    if (typeof navigator.share !== 'function') {
      setNotice({ kind: 'error', text: t('shareNativeError') })
      return
    }

    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setNotice({ kind: 'error', text: t('shareCancelled') })
        return
      }
      setNotice({ kind: 'error', text: t('shareNativeError') })
    }
  }

  const downloadImage = async () => {
    setExporting(true)
    setNotice(null)
    try {
      const { blob, filename } = await createImage()
      downloadBlob(blob, filename)
      setNotice({ kind: 'success', text: t('shareImageDownloaded') })
      trackEvent(ANALYTICS_EVENTS.imageExported)
    } catch {
      setNotice({ kind: 'error', text: t('shareImageError') })
    } finally {
      setExporting(false)
    }
  }

  const shareImage = async () => {
    setExporting(true)
    setNotice(null)
    try {
      const { blob, filename } = await createImage()
      const file = new File([blob], filename, { type: 'image/png' })
      if (
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: shareTitle,
          text: shareText,
        })
        trackEvent(ANALYTICS_EVENTS.shareClicked, { method: 'image' })
      } else {
        downloadBlob(blob, filename)
        setNotice({ kind: 'success', text: t('shareImageDownloaded') })
        trackEvent(ANALYTICS_EVENTS.imageExported)
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setNotice({ kind: 'error', text: t('shareCancelled') })
      } else {
        setNotice({ kind: 'error', text: t('shareImageError') })
      }
    } finally {
      setExporting(false)
    }
  }

  const socials = [
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      label: 'Reddit',
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(shareText)}`,
    },
  ]

  return (
    <AccessibleModal
      open={open}
      onClose={onClose}
      titleId="mt-share-title"
      closeLabel={t('shareClose')}
      className="sm:max-w-2xl"
    >
      <div className="border-b border-white/[0.07] px-5 py-5 sm:px-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f0c75e]/75">
          {t('share')}
        </p>
        <h2
          id="mt-share-title"
          className="mt-1 text-3xl text-white"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}
        >
          {t('shareTitle')}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-white/45">{t('shareIntro')}</p>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-7">
        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#06030e]">
          <div className="relative overflow-hidden p-5">
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#f0c75e]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#f0c75e]/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#f0c75e]" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0c75e]">
                    League Roulette
                  </span>
                </div>
                <p className="mt-4 max-w-[300px] text-2xl leading-none text-[#fff8e6] [font-family:'Bebas_Neue',sans-serif]">
                  {shareTitle}
                </p>
                <p className="mt-2 max-w-[300px] text-[11px] leading-relaxed text-white/40">
                  {shareSubtitle}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-[#f0c75e]/30 bg-[#f0c75e]/[0.07] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#f0c75e]/85">
                {isPersonal ? t('modePersonal') : t('modeExplore')}
              </span>
            </div>

            <div className="relative mt-5 flex items-center gap-3">
              {rootNode ? (
                <span
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2"
                  style={{
                    borderColor: ROLE_COLORS[rootNode.primaryRole].color,
                    boxShadow: `0 0 30px ${ROLE_COLORS[rootNode.primaryRole].soft}`,
                  }}
                >
                  <Image
                    src={championIconUrl(rootNode.key)}
                    alt={rootNode.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </span>
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#f0c75e]/30 bg-[#f0c75e]/[0.06] text-[#f0c75e]">
                  <SparkIcon />
                </span>
              )}
              <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                {previewChampions.map((node) => (
                  <span
                    key={node.championId}
                    className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border"
                    style={{ borderColor: `${ROLE_COLORS[node.primaryRole].color}66` }}
                  >
                    <Image
                      src={championIconUrl(node.key)}
                      alt=""
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </span>
                ))}
                <span className="ml-auto shrink-0 text-[10px] font-semibold text-white/35">
                  {t('sharePreviewChampions', { count: championCount })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-2.5">
            <span className="truncate text-[10px] text-white/25">
              {t('sharePreviewUrl')}
            </span>
            <span className="shrink-0 text-[9px] uppercase tracking-[0.14em] text-white/20">
              1200 x 630
            </span>
          </div>
        </section>

        <section>
          <div className="flex gap-2">
            <label className="min-w-0 flex-1">
              <span className="sr-only">{t('shareCopyLink')}</span>
              <span className="relative block">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                <input
                  readOnly
                  value={url}
                  onFocus={(event) => event.target.select()}
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/25 pl-9 pr-3 text-xs text-white/60 outline-none transition focus:border-[#c89b3c]/45 focus:ring-1 focus:ring-[#c89b3c]/20"
                />
              </span>
            </label>
            <button
              type="button"
              onClick={() => void copyLink()}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[#c89b3c]/35 bg-[#c89b3c]/10 px-3.5 text-xs font-semibold text-[#f0c75e] transition hover:bg-[#c89b3c]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="hidden sm:inline">
                {copied ? t('shareLinkCopied') : t('shareCopyLink')}
              </span>
            </button>
          </div>
          {layout.totalPoints > 0 && isPersonal && (
            <p className="mt-2 text-[10px] text-white/30">
              {t('shareTopNote', {
                count: Math.min(25, layout.nodes.length),
              })}
            </p>
          )}
        </section>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => void downloadImage()}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white/70 transition hover:border-[#f0c75e]/40 hover:text-[#f0c75e] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {t('shareDownload')}
          </button>
          <button
            type="button"
            onClick={() => void shareImage()}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white/70 transition hover:border-[#f0c75e]/40 hover:text-[#f0c75e] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
          >
            <ImageIcon className="h-4 w-4" />
            {t('shareShareImage')}
          </button>
          <button
            type="button"
            onClick={() => void nativeShare()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white/70 transition hover:border-[#f0c75e]/40 hover:text-[#f0c75e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
          >
            <Share2 className="h-4 w-4" />
            {t('shareNative')}
          </button>
          <div className="flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-2 py-1.5">
            <span className="mr-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
              {t('shareSocial')}
            </span>
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent(ANALYTICS_EVENTS.shareClicked, { method: social.label })}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[10px] font-semibold text-white/50 transition hover:border-[#f0c75e]/35 hover:text-[#f0c75e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
              >
                {social.label}
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
          <p className="text-[10px] leading-relaxed text-white/35">
            {isPersonal ? t('sharePrivateNote') : t('sharePublicNote')}
          </p>
          <p className="text-[10px] leading-relaxed text-white/25">{t('shareExportNote')}</p>
        </div>

        {notice && (
          <div
            role="status"
            aria-live="polite"
            className={[
              'flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-xs',
              notice.kind === 'error'
                ? 'border-red-400/25 bg-red-400/[0.06] text-red-200'
                : 'border-[#5ee0a0]/25 bg-[#5ee0a0]/[0.06] text-[#9df0c5]',
            ].join(' ')}
          >
            {notice.kind === 'error' ? (
              <X className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
        )}
      </div>

      <div className="flex justify-end border-t border-white/[0.06] px-5 py-4 sm:px-7">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/55 transition hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c75e]/50"
        >
          {t('shareClose')}
        </button>
      </div>
    </AccessibleModal>
  )
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
      <path
        d="M12 2.5l2.1 6.1 6.4 1.5-4.8 4.4.6 6.4L12 17.6l-4.3 3.3.6-6.4-4.8-4.4 6.4-1.5L12 2.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}
