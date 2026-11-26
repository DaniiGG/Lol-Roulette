export const duos = {
  aggressive: [
    ['Samira', 'Nautilus'], ['Draven', 'Leona'], ['Kalista', 'Renata'],
    ['Lucian', 'Nami'], ['Kaisa', 'Rell'], ['Tristana', 'Alistar'],
    ['Xayah', 'Rakan'], ['Kaisa', 'Leona'], ['Draven', 'Thresh'],
  ],
  safe: [
    ['Ezreal', 'Karma'], ['Jinx', 'Lulu'], ['KogMaw', 'Milio'],
    ['Sivir', 'Janna'], ['Aphelios', 'Braum'], ['Caitlyn', 'Morgana'],
    ['Ezreal', 'Bard'], ['Varus', 'Janna'], ['Xayah', 'Janna'],
  ],
  unusual: [
    ['Ashe', 'Anivia'], ['Jhin', 'Veigar'], ['MissFortune', 'JarvanIV'],
    ['Nilah', 'Taric'], ['Varus', 'Xerath'], ['Seraphine', 'Senna'],
    ['Karthus', 'Pyke'], ['Ziggs', 'Poppy'], ['Jhin', 'Shaco'],
  ],
} as const

export type Style = keyof typeof duos
export const styles = Object.keys(duos) as Style[]
export const pairs = styles.flatMap(style => duos[style].map(([adc, support]) => ({
  id: `${adc}-${support}`, adc, support, style,
})))
