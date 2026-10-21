const CHAMPION_IMAGE_IDS: Record<string, string> = {
  'Nunu & Willump': 'Nunu',
  'Lee Sin': 'LeeSin',
  'Miss Fortune': 'MissFortune',
  "Kog'Maw": 'KogMaw',
  'Vel\'Koz': 'Velkoz',
  'Xin Zhao': 'XinZhao',
  Wukong: 'MonkeyKing',
  Azir: 'Azir',
  Caitlyn: 'Caitlyn',
  Darius: 'Darius',
  Fizz: 'Fizz',
  Garen: 'Garen',
  Gwen: 'Gwen',
  Jinx: 'Jinx',
  Leona: 'Leona',
  Nidalee: 'Nidalee',
  Orianna: 'Orianna',
  Qiyana: 'Qiyana',
  Rammus: 'Rammus',
  Ryze: 'Ryze',
  Shyvana: 'Shyvana',
  Sion: 'Sion',
  Taliyah: 'Taliyah',
  Taric: 'Taric',
  Tristana: 'Tristana',
  Varus: 'Varus',
  Viktor: 'Viktor',
  Volibear: 'Volibear',
  Yone: 'Yone',
  Zyra: 'Zyra',
}

const CHAMPION_NAMES = Object.keys(CHAMPION_IMAGE_IDS).sort((a, b) => b.length - a.length)

export function findChampionImageId(text: string): string | undefined {
  const name = CHAMPION_NAMES.find((champion) => text.includes(champion))
  return name ? CHAMPION_IMAGE_IDS[name] : undefined
}
