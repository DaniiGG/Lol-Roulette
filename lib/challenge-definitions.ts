export type ChallengeType = 'low_mastery' | 'region' | 'class';

export type ChallengeDuration = 3;

export interface ChallengeConfig {
  low_mastery?: {
    mastery_threshold: number;
  };
  region?: {
    region: string;
  };
  class?: {
    class: string;
  };
}

export interface ChallengeDefinition {
  id: string;
  type: ChallengeType;
  name: string;
  description: string;
  category: string;
  emoji: string;
  config: ChallengeConfig;
  availableDurations: ChallengeDuration[];
  defaultDuration: ChallengeDuration;
  xpMultiplier: number;
}

export const REGIONS = [
  'Demacia',
  'Noxus',
  'Ionia',
  'Freljord',
  'Piltover',
  'Zaun',
  'Shurima',
  'Targon',
  'Ixtal',
  'Shadow Isles',
  'Bilgewater',
  'Void',
  'Runeterra'
] as const;

export const CHAMPION_CLASSES = [
  'Assassin',
  'Tank',
  'Fighter',
  'Mage',
  'Marksman',
  'Support'
] as const;

export const MASTERY_THRESHOLDS = [5000, 10000, 25000, 50000] as const;

export const CHALLENGE_DEFINITIONS: ChallengeDefinition[] = [
  {
    id: 'low_mastery_5k',
    type: 'low_mastery',
    name: 'Low Mastery: Novice',
    description: 'Win with a champion you have less than 5,000 mastery points on.',
    category: 'Mastery',
    emoji: '🌱',
    config: {
      low_mastery: { mastery_threshold: 5000 }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'low_mastery_10k',
    type: 'low_mastery',
    name: 'Low Mastery: Apprentice',
    description: 'Win with a champion you have less than 10,000 mastery points on.',
    category: 'Mastery',
    emoji: '🎯',
    config: {
      low_mastery: { mastery_threshold: 10000 }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'low_mastery_25k',
    type: 'low_mastery',
    name: 'Low Mastery: Explorer',
    description: 'Win with a champion you have less than 25,000 mastery points on.',
    category: 'Mastery',
    emoji: '🔍',
    config: {
      low_mastery: { mastery_threshold: 25000 }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'region_demacia',
    type: 'region',
    name: 'Region: Demacia',
    description: 'Win using a champion from Demacia.',
    category: 'Region',
    emoji: '🏰',
    config: {
      region: { region: 'Demacia' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'region_noxus',
    type: 'region',
    name: 'Region: Noxus',
    description: 'Win using a champion from Noxus.',
    category: 'Region',
    emoji: '⚔️',
    config: {
      region: { region: 'Noxus' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'region_ionia',
    type: 'region',
    name: 'Region: Ionia',
    description: 'Win using a champion from Ionia.',
    category: 'Region',
    emoji: '🌸',
    config: {
      region: { region: 'Ionia' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'region_freljord',
    type: 'region',
    name: 'Region: Freljord',
    description: 'Win using a champion from Freljord.',
    category: 'Region',
    emoji: '❄️',
    config: {
      region: { region: 'Freljord' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'region_piltover',
    type: 'region',
    name: 'Region: Piltover',
    description: 'Win using a champion from Piltover.',
    category: 'Region',
    emoji: '⚙️',
    config: {
      region: { region: 'Piltover' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'region_zaun',
    type: 'region',
    name: 'Region: Zaun',
    description: 'Win using a champion from Zaun.',
    category: 'Region',
    emoji: '☢️',
    config: {
      region: { region: 'Zaun' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'region_shurima',
    type: 'region',
    name: 'Region: Shurima',
    description: 'Win using a champion from Shurima.',
    category: 'Region',
    emoji: '🏜️',
    config: {
      region: { region: 'Shurima' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'region_targon',
    type: 'region',
    name: 'Region: Targon',
    description: 'Win using a champion from Targon.',
    category: 'Region',
    emoji: '🌟',
    config: {
      region: { region: 'Targon' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'region_ixtal',
    type: 'region',
    name: 'Region: Ixtal',
    description: 'Win using a champion from Ixtal.',
    category: 'Region',
    emoji: '🌿',
    config: {
      region: { region: 'Ixtal' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'region_shadow_isles',
    type: 'region',
    name: 'Region: Shadow Isles',
    description: 'Win using a champion from the Shadow Isles.',
    category: 'Region',
    emoji: '👻',
    config: {
      region: { region: 'Shadow Isles' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'region_bilgewater',
    type: 'region',
    name: 'Region: Bilgewater',
    description: 'Win using a champion from Bilgewater.',
    category: 'Region',
    emoji: '🏴‍☠️',
    config: {
      region: { region: 'Bilgewater' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'region_void',
    type: 'region',
    name: 'Region: The Void',
    description: 'Win using a champion from the Void.',
    category: 'Region',
    emoji: '🕳️',
    config: {
      region: { region: 'Void' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'region_runeterra',
    type: 'region',
    name: 'Region: Runeterra',
    description: 'Win using a champion from Runeterra (multi-region).',
    category: 'Region',
    emoji: '🌍',
    config: {
      region: { region: 'Runeterra' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'class_assassin',
    type: 'class',
    name: 'Class: Assassin',
    description: 'Win using an Assassin champion.',
    category: 'Class',
    emoji: '🗡️',
    config: {
      class: { class: 'Assassin' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'class_tank',
    type: 'class',
    name: 'Class: Tank',
    description: 'Win using a Tank champion.',
    category: 'Class',
    emoji: '🛡️',
    config: {
      class: { class: 'Tank' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'class_fighter',
    type: 'class',
    name: 'Class: Fighter',
    description: 'Win using a Fighter champion.',
    category: 'Class',
    emoji: '👊',
    config: {
      class: { class: 'Fighter' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'class_mage',
    type: 'class',
    name: 'Class: Mage',
    description: 'Win using a Mage champion.',
    category: 'Class',
    emoji: '🔮',
    config: {
      class: { class: 'Mage' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'class_marksman',
    type: 'class',
    name: 'Class: Marksman',
    description: 'Win using a Marksman champion.',
    category: 'Class',
    emoji: '🏹',
    config: {
      class: { class: 'Marksman' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  },
  {
    id: 'class_support',
    type: 'class',
    name: 'Class: Support',
    description: 'Win using a Support champion.',
    category: 'Class',
    emoji: '💚',
    config: {
      class: { class: 'Support' }
    },
    availableDurations: [3],
    defaultDuration: 3,
    xpMultiplier: 2.0
  }
];

export function getChallengeById(id: string): ChallengeDefinition | undefined {
  return CHALLENGE_DEFINITIONS.find(c => c.id === id);
}

export function getChallengesByType(type: ChallengeType): ChallengeDefinition[] {
  return CHALLENGE_DEFINITIONS.filter(c => c.type === type);
}

export function getChallengesByCategory(category: string): ChallengeDefinition[] {
  return CHALLENGE_DEFINITIONS.filter(c => c.category === category);
}