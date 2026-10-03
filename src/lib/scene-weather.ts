export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type SceneWeather = 'clear' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'thunder'

export function somersetSeason(date: Date): Season {
  const month = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', month: 'numeric' }).format(date))
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

export function classifyWeather(code: number): { weather: SceneWeather; label: string } {
  if (code === 45 || code === 48) return { weather: 'fog', label: 'fog on the moor' }
  if (code >= 95 && code <= 99) return { weather: 'thunder', label: 'thunderstorms' }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { weather: 'snow', label: 'snow' }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { weather: 'rain', label: 'rain' }
  if (code === 2 || code === 3) return { weather: 'cloudy', label: 'cloudy skies' }
  if (code === 1) return { weather: 'clear', label: 'mostly clear' }
  return { weather: 'clear', label: 'clear skies' }
}

// The foreground in all four plates is registered to the same curve.
// Returns the fraction of scene height measured up from its bottom edge.
export function meadowGround(x: number): number {
  const stops: [number, number][] = [[0, 0.072], [0.14, 0.09], [0.3, 0.073], [0.46, 0.082], [0.62, 0.071], [0.77, 0.096], [1, 0.075]]
  const clamped = Math.max(0, Math.min(1, x))
  for (let i = 1; i < stops.length; i++) {
    if (clamped <= stops[i][0]) {
      const [x0, y0] = stops[i - 1]
      const [x1, y1] = stops[i]
      const t = (clamped - x0) / (x1 - x0)
      return y0 + (y1 - y0) * t
    }
  }
  return stops[stops.length - 1][1]
}
