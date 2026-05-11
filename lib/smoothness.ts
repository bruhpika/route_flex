export function calculateSmoothnessScore(coords: { speed: number }[]): number {
  if (coords.length < 2) return 100
  const avgSpeed = coords.reduce((acc, c) => acc + c.speed, 0) / coords.length
  const variance = coords.reduce((acc, c) => acc + Math.pow(c.speed - avgSpeed, 2), 0) / coords.length
  const score = Math.max(0, 100 - (variance / 5))
  return Math.round(score)
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'BUTTER SMOOTH 🧈'
  if (score >= 75) return 'CHILL RIDE 🌊'
  if (score >= 50) return 'SPIRITED ⚡'
  if (score >= 30) return 'AGRESSIVE 🏎️'
  return 'CHAOTIC 🌪️'
}
