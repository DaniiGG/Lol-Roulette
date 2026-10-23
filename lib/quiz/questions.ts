import type { QuizQuestion } from './types'

/**
 * Hidden trait weights for the quiz.
 *
 * Each option contributes to several traits so that no single answer locks the
 * user into one class. The weights are deliberately small and transparent:
 * 1 = a nudge, 2 = a clear signal, 3 = a very loud personality clue.
 */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    options: [
      { id: 'q1a', traits: { patience: 2, teamwork: 1, scaling: 1 } },
      { id: 'q1b', traits: { carry: 3, aggression: 2, mechanics: 1 } },
      { id: 'q1c', traits: { creativity: 3, teamwork: 1, aggression: 1 } },
      { id: 'q1d', traits: { patience: 3, control: 2, scaling: 1 } },
      { id: 'q1e', traits: { creativity: 2, mechanics: 2, mobility: 1, scaling: 1 } },
    ],
  },
  {
    id: 'q2',
    options: [
      { id: 'q2a', traits: { teamwork: 3, aggression: 3, dueling: 1 } },
      { id: 'q2b', traits: { patience: 2, carry: 3, dueling: 2, control: 1, ranged: 2 } },
      { id: 'q2c', traits: { creativity: 3, mechanics: 2, mobility: 2 } },
      { id: 'q2d', traits: { protection: 3, teamwork: 2, patience: 1 } },
      { id: 'q2e', traits: { scaling: 2, carry: 2, control: 2, creativity: 1 } },
    ],
  },
  {
    id: 'q3',
    options: [
      { id: 'q3a', traits: { dueling: 2, aggression: 2, patience: 1 } },
      { id: 'q3b', traits: { carry: 3, aggression: 2, mechanics: 1 } },
      { id: 'q3c', traits: { control: 3, patience: 2, teamwork: 1 } },
      { id: 'q3d', traits: { mechanics: 3, mobility: 2, aggression: 1 } },
      { id: 'q3e', traits: { protection: 3, teamwork: 2, patience: 1 } },
      { id: 'q3f', traits: { dueling: 3, aggression: 2, mechanics: 1 } },
    ],
  },
  {
    id: 'q4',
    options: [
      { id: 'q4a', traits: { mobility: 3, creativity: 2, aggression: 2 } },
      { id: 'q4b', traits: { protection: 3, teamwork: 2, patience: 1 } },
      { id: 'q4c', traits: { carry: 3, mechanics: 3, scaling: 1, ranged: 2 } },
      { id: 'q4d', traits: { control: 3, patience: 2, teamwork: 1 } },
      { id: 'q4e', traits: { mechanics: 3, ranged: 2, control: 1 } },
      { id: 'q4f', traits: { dueling: 3, aggression: 2, protection: 1 } },
    ],
  },
  {
    id: 'q5',
    options: [
      { id: 'q5a', traits: { aggression: 3, mobility: 2, dueling: 1 } },
      { id: 'q5b', traits: { dueling: 2, carry: 2, patience: 1, aggression: 1 } },
      { id: 'q5c', traits: { mechanics: 3, control: 2, patience: 1 } },
      { id: 'q5d', traits: { aggression: 2, control: 2, creativity: 2 } },
      { id: 'q5e', traits: { protection: 3, teamwork: 3, patience: 1 } },
      { id: 'q5f', traits: { creativity: 3, mechanics: 1, scaling: 1, control: 1 } },
    ],
  },
  {
    id: 'q6',
    options: [
      { id: 'q6a', traits: { mechanics: 3, patience: 2, mobility: 1 } },
      { id: 'q6b', traits: { scaling: 3, patience: 2, carry: 2, ranged: 2 } },
      { id: 'q6c', traits: { creativity: 3, aggression: 2, mobility: 1 } },
      { id: 'q6d', traits: { creativity: 2, control: 2, teamwork: 1, scaling: 1 } },
      { id: 'q6e', traits: { teamwork: 3, protection: 2, patience: 1 } },
      { id: 'q6f', traits: { carry: 3, aggression: 2, mechanics: 1 } },
    ],
  },
  {
    id: 'q7',
    options: [
      { id: 'q7a', traits: { dueling: 3, aggression: 2, carry: 1 } },
      { id: 'q7b', traits: { aggression: 3, dueling: 2, control: 1 } },
      { id: 'q7c', traits: { patience: 3, control: 2, mechanics: 1 } },
      { id: 'q7d', traits: { scaling: 2, patience: 2, control: 2 } },
      { id: 'q7e', traits: { creativity: 3, mechanics: 1, mobility: 1 } },
      { id: 'q7f', traits: { teamwork: 2, protection: 2, patience: 2 } },
    ],
  },
  {
    id: 'q8',
    options: [
      { id: 'q8a', traits: { aggression: 3, carry: 2, dueling: 1 } },
      { id: 'q8b', traits: { mobility: 3, creativity: 2, mechanics: 1 } },
      { id: 'q8c', traits: { control: 3, patience: 2, teamwork: 1 } },
      { id: 'q8d', traits: { protection: 3, teamwork: 2, patience: 1 } },
      { id: 'q8e', traits: { scaling: 3, dueling: 2, carry: 2 } },
      { id: 'q8f', traits: { creativity: 3, mechanics: 2, control: 1 } },
    ],
  },
]

export const QUESTION_BY_ID = new Map(QUIZ_QUESTIONS.map((question) => [question.id, question]))
