import catalog from './catalog.json'

export const SKIN_LOCALES = ['en', 'es'] as const
export type SkinLocale = typeof SKIN_LOCALES[number]
export type Skin = typeof catalog.skins[number]
export type SkinChampion = typeof catalog.champions[number]
export type SkinCardData = Omit<Skin, 'description'>
export const skinCatalog = catalog
export const skinLocale = (locale: string): SkinLocale => locale === 'es' ? 'es' : 'en'
export const isSkinLocale = (locale: string): locale is SkinLocale => locale === 'es' || locale === 'en'
export const championSkins = (slug: string) => catalog.skins.filter(skin => skin.champion === slug)
export const findSkinChampion = (slug: string) => catalog.champions.find(champion => champion.slug === slug)
export const findSkin = (champion: string, slug: string) => catalog.skins.find(skin => skin.champion === champion && skin.slug === slug)
export const skinSplash = (skin: Pick<Skin, 'champion' | 'num'>) => `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${findSkinChampion(skin.champion)?.id}_${skin.num}.jpg`
export const championPortrait = (id: string) => `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_0.jpg`
export const skinIsIndexable = (skin: Skin, locale: SkinLocale) => skin.description[locale].trim().length >= 80
export const skinCard = (skin: Skin): SkinCardData => ({ id: skin.id, num: skin.num, champion: skin.champion, slug: skin.slug, name: skin.name, rarity: skin.rarity, legacy: skin.legacy, hasChromas: skin.hasChromas, preview: skin.preview, lines: skin.lines })
