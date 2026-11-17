import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const catalog = JSON.parse(readFileSync(new URL('../lib/skins/catalog.json', import.meta.url), 'utf8'))

test('catalogue is complete and has unique stable champion and skin routes', () => {
  assert.ok(catalog.champions.length >= 170)
  assert.ok(catalog.skins.length >= 1900)
  assert.equal(new Set(catalog.champions.map(c => c.slug)).size, catalog.champions.length)
  assert.equal(new Set(catalog.skins.map(s => s.id)).size, catalog.skins.length)
  assert.equal(new Set(catalog.skins.map(s => `${s.champion}/${s.slug}`)).size, catalog.skins.length)
  for (const champion of catalog.champions) assert.ok(catalog.skins.some(skin => skin.champion === champion.slug), champion.id)
})

test('skin artwork references the correct champion and never counts base appearances', () => {
  for (const skin of catalog.skins) {
    const champion = catalog.champions.find(c => c.slug === skin.champion)
    assert.ok(champion, skin.name.en)
    assert.equal(Math.floor(skin.id / 1000), champion.key)
    assert.equal(skin.num, skin.id % 1000)
    assert.ok(skin.num > 0, 'Base appearance must not be counted as a skin')
    assert.match(skin.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  }
})

test('English and Spanish names, validated classifications and chroma information are present', () => {
  for (const skin of catalog.skins) {
    assert.ok(skin.name.en && skin.name.es)
    assert.equal(typeof skin.description.en, 'string')
    assert.equal(typeof skin.description.es, 'string')
    assert.equal(typeof skin.legacy, 'boolean')
    assert.ok(typeof skin.hasChromas === 'boolean' || skin.hasChromas === null)
    assert.ok(['standard', 'rare', 'epic', 'legendary', 'mythic', 'ultimate', 'exalted', 'transcendent', 'special'].includes(skin.rarity))
  }
})
