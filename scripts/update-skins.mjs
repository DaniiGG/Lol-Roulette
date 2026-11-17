import { mkdir, writeFile, readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
async function json(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
  if (!response.ok) throw new Error(`${response.status}: ${url}`)
  return response.json()
}
const versions = await json('https://ddragon.leagueoflegends.com/api/versions.json')
const version = versions[0]
const patch = version.split('.').slice(0, 2).join('.')
const community = `https://raw.communitydragon.org/${patch}/plugins/rcp-be-lol-game-data/global`
const localeData = await Promise.all(['en', 'es'].map(async locale => {
  const [champions, skins, lines] = await Promise.all([
    json(`https://ddragon.leagueoflegends.com/cdn/${version}/data/${locale === 'es' ? 'es_ES' : 'en_US'}/champion.json`),
    json(`${community}/${locale === 'es' ? 'es_es' : 'default'}/v1/skins.json`),
    json(`${community}/${locale === 'es' ? 'es_es' : 'default'}/v1/skinlines.json`),
  ])
  return { locale, champions: champions.data, skins, lines }
}))
const [en, es] = localeData
const slug = text => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const champions = Object.values(en.champions).map(champion => ({
  id: champion.id, key: Number(champion.key), slug: slug(champion.id),
  name: { en: champion.name, es: es.champions[champion.id]?.name ?? champion.name },
  title: { en: champion.title, es: es.champions[champion.id]?.title ?? champion.title },
  tags: champion.tags,
})).sort((a,b) => a.name.en.localeCompare(b.name.en))
const championByKey = new Map(champions.map(c => [c.key, c]))
const lineMap = (lines) => new Map(Object.values(lines).map(line => [line.id, line.name]))
const englishLines = lineMap(en.lines), spanishLines = lineMap(es.lines)
const rarityMap = { kNoRarity: 'standard', kRare: 'rare', kEpic: 'epic', kLegendary: 'legendary', kMythic: 'mythic', kUltimate: 'ultimate', kExalted: 'exalted', kTranscendent: 'transcendent' }
const chromas = new Map()
const queue = [...champions]
await Promise.all(Array.from({length: 6}, async () => {
  while(queue.length) {
    const champion = queue.shift()
    const detail = await json(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${champion.id}.json`)
    for(const skin of detail.data[champion.id].skins) chromas.set(Number(skin.id), Boolean(skin.chromas))
  }
}))
const skins = Object.values(en.skins).filter(s => !s.isBase && championByKey.has(Math.floor(s.id / 1000))).map(skin => {
  const champion = championByKey.get(Math.floor(skin.id / 1000))
  const spanish = es.skins[String(skin.id)]
  return {
    id: skin.id, num: skin.id % 1000, champion: champion.slug,
    slug: `${slug(skin.name)}-${skin.id}`,
    name: { en: skin.name, es: spanish?.name ?? skin.name },
    description: { en: skin.description ?? '', es: spanish?.description ?? '' },
    rarity: rarityMap[skin.rarity] ?? 'special', legacy: Boolean(skin.isLegacy),
    hasChromas: chromas.get(skin.id) ?? null,
    preview: skin.previewVideoUrl?.startsWith('https://') ? skin.previewVideoUrl : null,
    lines: (skin.skinLines ?? []).map(line => ({ id: line.id, en: englishLines.get(line.id) ?? '', es: spanishLines.get(line.id) ?? englishLines.get(line.id) ?? '' })).filter(line => line.en),
  }
}).sort((a,b) => a.id - b.id)
if (champions.length < 150 || skins.length < 1500) throw new Error('Incomplete catalogue; existing data was not replaced')
const ids = new Set(skins.map(s => s.id)); if(ids.size !== skins.length) throw new Error('Duplicate skin IDs')
const snapshot = { version, patch: `${Number(version.split('.')[0]) + 10}.${version.split('.')[1]}`, communityVersion: patch, updatedAt: process.env.SKINS_SNAPSHOT_DATE ?? new Date().toISOString().slice(0,10), sources: [
  'https://developer.riotgames.com/docs/lol#data-dragon',
  `https://raw.communitydragon.org/${patch}/plugins/rcp-be-lol-game-data/global/default/v1/skins.json`,
], champions, skins }
// Preserve real modification dates when a refresh has no content changes.
const target = new URL('lib/skins/catalog.json', root)
try { const old = JSON.parse(await readFile(target, 'utf8')); if(JSON.stringify({...old,updatedAt:''}) === JSON.stringify({...snapshot,updatedAt:''})) snapshot.updatedAt = old.updatedAt } catch {}
await mkdir(new URL('lib/skins/', root), { recursive: true })
await writeFile(target, JSON.stringify(snapshot) + '\n')
console.log(`Saved ${champions.length} champions and ${skins.length} skins, patch ${patch}, English + Spanish`)
