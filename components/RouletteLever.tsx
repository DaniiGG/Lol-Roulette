'use client'

import SlotLever from './SlotLever'
import styles from './RouletteAppearance.module.css'

type Props = { onActivate: () => void; onPullStart?: () => void; disabled: boolean; isSpinning: boolean }
export default function RouletteLever(props: Props) {
  return <div className={styles.lever}><div className={styles.leverScale}><SlotLever {...props} /></div></div>
}
