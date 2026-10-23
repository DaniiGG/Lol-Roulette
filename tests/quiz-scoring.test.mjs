import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { QUIZ_QUESTIONS } from '../lib/quiz/questions.ts'
import { QUIZ_CHAMPIONS } from '../lib/quiz/champions.ts'
import {
  calculateTraitScores,
  isCompleteAnswers,
  scoreAnswers,
  topTraitIds,
} from '../lib/quiz/scoring.ts'
import { TRAIT_IDS } from '../lib/quiz/types.ts'

const duelistAnswers = {
  q1: 'q1b',
  q2: 'q2a',
  q3: 'q3f',
  q4: 'q4f',
  q5: 'q5a',
  q6: 'q6f',
  q7: 'q7b',
  q8: 'q8a',
}

const protectorAnswers = {
  q1: 'q1d',
  q2: 'q2d',
  q3: 'q3e',
  q4: 'q4b',
  q5: 'q5e',
  q6: 'q6e',
  q7: 'q7f',
  q8: 'q8d',
}

const creativeAnswers = {
  q1: 'q1c',
  q2: 'q2c',
  q3: 'q3d',
  q4: 'q4a',
  q5: 'q5f',
  q6: 'q6c',
  q7: 'q7e',
  q8: 'q8b',
}

function run(answers) {
  const result = scoreAnswers(answers, QUIZ_QUESTIONS, QUIZ_CHAMPIONS)
  assert.ok(result, 'expected a result for complete answers')
  return result
}

test('question configuration uses stable ids and only known traits', () => {
  const questionIds = new Set()
  const optionIds = new Set()

  for (const question of QUIZ_QUESTIONS) {
    assert.match(question.id, /^q\d+$/)
    assert.ok(!questionIds.has(question.id), `duplicate question id ${question.id}`)
    questionIds.add(question.id)

    for (const option of question.options) {
      assert.match(option.id, /^q\d[a-f]$/)
      assert.ok(!optionIds.has(option.id), `duplicate option id ${option.id}`)
      optionIds.add(option.id)

      for (const [trait, value] of Object.entries(option.traits)) {
        assert.ok(TRAIT_IDS.includes(trait), `unknown trait ${trait}`)
        assert.ok(value > 0 && value <= 3, `weight out of range for ${option.id}.${trait}`)
      }
    }
  }

  assert.equal(QUIZ_QUESTIONS.length, 8)
})

test('identical answers always produce the same recommendations', () => {
  const first = run(duelistAnswers)
  const second = run({ ...duelistAnswers })

  assert.equal(first.main.champion.id, second.main.champion.id)
  assert.equal(first.alternate.champion.id, second.alternate.champion.id)
  assert.equal(first.wildcard.champion.id, second.wildcard.champion.id)
  assert.deepEqual(first.traits, second.traits)
})

test('aggressive duelist answers favor a duel-oriented champion', () => {
  const result = run(duelistAnswers)
  const top = topTraitIds(result.traits, 3)

  assert.ok(top.includes('aggression'))
  assert.ok(top.includes('dueling'))
  assert.ok(['Fighter', 'Assassin'].includes(result.main.champion.championClass))
})

test('protective answers favor a protective teammate', () => {
  const result = run(protectorAnswers)

  assert.ok(result.traits.protection >= result.traits.aggression)
  assert.ok(result.traits.teamwork >= result.traits.carry)
  assert.ok(['Tank', 'Support'].includes(result.main.champion.championClass))
})

test('creative answers favor a mobile or unconventional champion', () => {
  const result = run(creativeAnswers)
  const top = topTraitIds(result.traits, 3)

  assert.ok(top.includes('creativity'))
  assert.ok(
    ['Assassin', 'Fighter', 'Marksman', 'Mage'].includes(result.main.champion.championClass)
  )
})

test('different answer combinations produce different mains', () => {
  const duelist = run(duelistAnswers)
  const protector = run(protectorAnswers)

  assert.notEqual(duelist.main.champion.id, protector.main.champion.id)
  assert.notDeepEqual(duelist.traits, protector.traits)
})

test('recommendations are unique, ordered and plausible', () => {
  for (const answers of [duelistAnswers, protectorAnswers, creativeAnswers]) {
    const result = run(answers)
    const ids = [result.main, result.alternate, result.wildcard].map((entry) => entry.champion.id)

    assert.equal(new Set(ids).size, 3)
    assert.ok(result.main.similarity >= result.alternate.similarity)
    assert.ok(result.alternate.similarity >= result.wildcard.similarity)
    assert.ok(result.wildcard.similarity >= 0.4, 'wildcard should remain a plausible match')
    assert.ok(result.main.matchPercent >= 55 && result.main.matchPercent <= 98)
    assert.ok(result.alternate.champion.championClass !== result.main.champion.championClass)
  }
})

test('incomplete or invalid answers do not produce a result', () => {
  assert.equal(scoreAnswers({}, QUIZ_QUESTIONS, QUIZ_CHAMPIONS), null)
  assert.equal(
    scoreAnswers({ ...duelistAnswers, q8: 'not-a-real-option' }, QUIZ_QUESTIONS, QUIZ_CHAMPIONS),
    null
  )
  assert.equal(isCompleteAnswers(duelistAnswers, QUIZ_QUESTIONS), true)
  assert.equal(isCompleteAnswers({ q1: 'q1a' }, QUIZ_QUESTIONS), false)
})

test('trait scoring sums multiple traits per answer', () => {
  const scores = calculateTraitScores({ q1: 'q1c' }, QUIZ_QUESTIONS)

  assert.equal(scores.creativity, 3)
  assert.equal(scores.teamwork, 1)
  assert.equal(scores.aggression, 1)
  assert.equal(scores.carry, 0)
})

test('champion roster is large, unique and valid', () => {
  const roles = ['top', 'jungle', 'mid', 'adc', 'support']
  const classes = ['Fighter', 'Assassin', 'Mage', 'Marksman', 'Tank', 'Support']
  const ids = new Set()

  assert.ok(QUIZ_CHAMPIONS.length >= 30, 'expected a broad champion roster')

  for (const champion of QUIZ_CHAMPIONS) {
    assert.ok(!ids.has(champion.id), `duplicate champion id ${champion.id}`)
    ids.add(champion.id)
    assert.ok(roles.includes(champion.role), `invalid role for ${champion.id}`)
    assert.ok(classes.includes(champion.championClass), `invalid class for ${champion.id}`)
    assert.match(champion.ddragonKey, /^[A-Za-z]+$/, `invalid DDragon key for ${champion.id}`)

    for (const trait of TRAIT_IDS) {
      const value = champion.traits[trait]
      assert.ok(
        value >= 0 && value <= 10,
        `trait ${trait} out of range for ${champion.id}: ${value}`
      )
    }
  }
})

test('every champion has localized title and quote in every locale', () => {
  const locales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh-CN', 'ko', 'ar', 'ru', 'nl', 'pl']
  const championIds = QUIZ_CHAMPIONS.map((champion) => champion.id).sort()

  for (const locale of locales) {
    const messages = JSON.parse(
      readFileSync(new URL(`../locales/${locale}/quiz.json`, import.meta.url), 'utf8')
    )
    const localizedIds = Object.keys(messages.champions).sort()

    assert.deepEqual(localizedIds, championIds, `champion translation keys differ for ${locale}`)

    for (const id of championIds) {
      assert.ok(messages.champions[id].title, `missing title for ${id} (${locale})`)
      assert.ok(messages.champions[id].quote, `missing quote for ${id} (${locale})`)
    }
  }
})
