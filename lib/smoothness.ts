export interface GpsPoint {
  lat: number; lng: number; speed: number; timestamp: number
}

export function calculateSmoothnessScore(points: GpsPoint[]): number {
  const clean = points.filter((p, i) => {
    if (p.speed > 200) return false
    if (i === 0) return true
    const dt = (p.timestamp - points[i - 1].timestamp) / 1000
    const dv = Math.abs(p.speed - points[i - 1].speed)
    if (dt > 0 && dv / dt > 50) return false
    return true
  })

  let penalties = 0
  let bonuses = 0
  let cruiseStreak = 0

  for (let i = 1; i < clean.length; i++) {
    const dt = (clean[i].timestamp - clean[i - 1].timestamp) / 1000
    if (dt <= 0) continue
    const accel = (clean[i].speed - clean[i - 1].speed) / dt
    if (accel < -15) penalties += 5
    if (accel > 20)  penalties += 3
    if (Math.abs(accel) > 8) penalties += 1
    const isHighway = clean[i].speed > 60
    const isSmooth  = Math.abs(accel) < 2
    if (isHighway && isSmooth) {
      cruiseStreak++
      if (cruiseStreak >= 30) bonuses += 10
    } else {
      cruiseStreak = 0
    }
  }

  const raw = 100 - penalties + bonuses
  return Math.min(100, Math.max(0, raw))
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Smooth Operator 😌'
  if (score >= 70) return 'Pretty Clean Drive 👌'
  if (score >= 50) return 'Aggressive but Alive 😤'
  return 'Chaotic Energy 💀'
}
