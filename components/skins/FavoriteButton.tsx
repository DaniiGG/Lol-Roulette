'use client'

import { useSyncExternalStore } from 'react'
import { Heart } from 'lucide-react'
import type { SkinLocale } from '@/lib/skins/data'
import { skinCopy } from '@/lib/skins/copy'
import styles from './Skins.module.css'

const KEY = 'league-roulette-favorite-skins'
const EVENT = 'league-roulette-favorite-skins-change'
let memory = '[]'
function subscribe(callback: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === KEY) callback() }
  window.addEventListener('storage', storage)
  window.addEventListener(EVENT, callback)
  return () => { window.removeEventListener('storage', storage); window.removeEventListener(EVENT, callback) }
}
function snapshot() { try { return localStorage.getItem(KEY) ?? memory } catch { return memory } }
function parse(value: string): number[] {
  try { const ids: unknown = JSON.parse(value); return Array.isArray(ids) ? ids.filter((id): id is number => Number.isSafeInteger(id)) : [] } catch { return [] }
}
function toggle(id: number) {
  const ids = parse(snapshot())
  memory = JSON.stringify(ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id])
  try { localStorage.setItem(KEY, memory) } catch { /* Favorites remain available for this visit. */ }
  window.dispatchEvent(new Event(EVENT))
}
export function useSkinFavorites() { return parse(useSyncExternalStore(subscribe, snapshot, () => '[]')) }
export default function FavoriteButton({ id, locale }: { id: number; locale: SkinLocale }) {
  const saved = useSkinFavorites().includes(id)
  const label = saved ? skinCopy[locale].unsave : skinCopy[locale].save
  return <button type="button" className={styles.favorite + (saved ? ' ' + styles.saved : '')} aria-label={label} title={label} aria-pressed={saved} onClick={() => toggle(id)}><Heart size={16} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" /></button>
}
