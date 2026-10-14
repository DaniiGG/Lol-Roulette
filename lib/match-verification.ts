export function evaluateMatchVerification(
  expectedChampionId: number,
  playedChampionId: number,
  won: boolean,
) {
  const playedCorrectChampion = Number(playedChampionId) === Number(expectedChampionId)

  return {
    success: playedCorrectChampion && won,
    playedCorrectChampion,
    won,
  }
}